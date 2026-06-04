import { v2 as cloudinary } from 'cloudinary';
import { randomUUID } from 'node:crypto';
import { mkdir, readdir, stat, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { publicAssetUrl } from './apiPublicUrl';
import { getMediaUploadDir, getOgUploadDir } from './uploadPaths';

export type StorageProvider = 'local' | 'cloudinary';

export type MediaListItem = {
  filename: string;
  url: string;
  size: number;
  createdAt: string;
  ext: string;
};

const SAFE_LOCAL_FILENAME = /^[a-f0-9-]{36}\.(jpg|jpeg|png|webp)$/i;
const MEDIA_TAG = 'book-site-media';
const OG_TAG = 'book-site-og';

let cloudinaryConfigured = false;

export function getStorageProvider(): StorageProvider {
  return process.env.STORAGE_PROVIDER === 'cloudinary' ? 'cloudinary' : 'local';
}

function configureCloudinary(): void {
  if (cloudinaryConfigured) return;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  cloudinaryConfigured = true;
}

function uploadToCloudinary(buffer: Buffer, publicId: string, tags: string[]): Promise<string> {
  configureCloudinary();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        unique_filename: false,
        overwrite: true,
        resource_type: 'image',
        tags,
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(error ?? new Error('Cloudinary upload failed.'));
          return;
        }
        resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });
}

export function isSafeMediaFilename(name: string): boolean {
  if (getStorageProvider() === 'cloudinary') {
    return /^[a-z0-9._-]{1,120}$/i.test(name);
  }
  return SAFE_LOCAL_FILENAME.test(name);
}

export async function uploadOgImage(file: Buffer): Promise<string> {
  const optimized = await sharp(file)
    .resize(1200, 630, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 85 })
    .toBuffer();

  if (getStorageProvider() === 'cloudinary') {
    const publicId = randomUUID();
    return uploadToCloudinary(optimized, publicId, [OG_TAG]);
  }

  const ogDir = getOgUploadDir();
  await mkdir(ogDir, { recursive: true });
  const filename = `${randomUUID()}.jpg`;
  const outPath = join(ogDir, filename);
  await sharp(optimized).toFile(outPath);
  return publicAssetUrl(`/og/${filename}`);
}

export async function uploadMediaImage(file: Buffer, mimetype: string): Promise<string> {
  const ext = mimetype === 'image/png' ? 'png' : mimetype === 'image/webp' ? 'webp' : 'jpg';
  const filename = `${randomUUID()}.${ext}`;

  let pipeline = sharp(file).resize(1920, 1920, { fit: 'inside', withoutEnlargement: true });
  if (ext === 'png') pipeline = pipeline.png();
  else if (ext === 'webp') pipeline = pipeline.webp({ quality: 85 });
  else pipeline = pipeline.jpeg({ quality: 85 });
  const optimized = await pipeline.toBuffer();

  if (getStorageProvider() === 'cloudinary') {
    const publicId = randomUUID();
    return uploadToCloudinary(optimized, publicId, [MEDIA_TAG]);
  }

  const mediaDir = getMediaUploadDir();
  await mkdir(mediaDir, { recursive: true });
  const outPath = join(mediaDir, filename);
  await sharp(optimized).toFile(outPath);
  return publicAssetUrl(`/media/${filename}`);
}

export async function listMediaFiles(): Promise<MediaListItem[]> {
  if (getStorageProvider() === 'cloudinary') {
    configureCloudinary();
    const resources = await cloudinary.search
      .expression(`resource_type:image AND tags=${MEDIA_TAG}`)
      .sort_by('created_at', 'desc')
      .max_results(200)
      .execute();
    return (resources.resources ?? []).map((item: Record<string, unknown>) => {
      const filename = String(item.public_id ?? '');
      const bytes = Number(item.bytes ?? 0);
      const createdAt = String(item.created_at ?? new Date().toISOString());
      const format = String(item.format ?? '').toLowerCase();
      return {
        filename,
        url: String(item.secure_url ?? ''),
        size: Number.isFinite(bytes) ? bytes : 0,
        createdAt,
        ext: format,
      };
    });
  }

  const dir = getMediaUploadDir();
  let names: string[];
  try {
    names = await readdir(dir);
  } catch {
    return [];
  }

  const items: MediaListItem[] = [];
  for (const filename of names) {
    if (!SAFE_LOCAL_FILENAME.test(filename)) continue;
    const path = join(dir, filename);
    try {
      const st = await stat(path);
      if (!st.isFile()) continue;
      items.push({
        filename,
        url: publicAssetUrl(`/media/${filename}`),
        size: st.size,
        createdAt: st.mtime.toISOString(),
        ext: filename.split('.').pop()?.toLowerCase() ?? '',
      });
    } catch {
      // Ignore race between listing and stat.
    }
  }
  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return items;
}

export async function deleteMediaFile(filename: string): Promise<'deleted' | 'not_found'> {
  if (getStorageProvider() === 'cloudinary') {
    configureCloudinary();
    const result = await cloudinary.uploader.destroy(filename, { resource_type: 'image' });
    return result.result === 'ok' ? 'deleted' : 'not_found';
  }

  const filePath = join(getMediaUploadDir(), filename);
  try {
    await unlink(filePath);
    return 'deleted';
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') return 'not_found';
    throw err;
  }
}
