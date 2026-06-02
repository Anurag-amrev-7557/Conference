import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { mkdir } from 'node:fs/promises';
import prisma from './lib/prisma';
import contentRoutes from './routes/contentRoutes';
import registrationPublicRoutes from './routes/registrationPublicRoutes';
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import marketingRoutes from './routes/marketingRoutes';
import seoRoutes from './routes/seoRoutes';
import { getJwtSecret } from './lib/jwtSecret';
import { getSiteUrl } from './lib/siteUrl';
import { createCorsMiddleware } from './lib/corsPolicy';
import { getApiPublicUrl } from './lib/apiPublicUrl';
import { getMediaUploadDir, getOgUploadDir, getUploadRoot } from './lib/uploadPaths';
import { ensureDatabasePath } from './lib/ensureDatabasePath';
import { bootstrapMediaAssets } from './lib/bootstrapMedia';
import { getDatabaseStats } from './lib/backupDatabase';
import { getStorageProvider } from './lib/mediaStorage';
import { requestIdMiddleware, errorHandler } from './middleware/errorHandler';

dotenv.config();
getJwtSecret();
getSiteUrl();

export const app = express();
const PORT = process.env.PORT || 3001;

const isDev = process.env.NODE_ENV !== 'production';
const connectSrc = ["'self'"];
const imgSrc = ["'self'", 'data:', 'https:'];
const mediaSrc = ["'self'", 'https:', 'blob:'];
if (isDev) {
  connectSrc.push('http://localhost:5173', 'ws://localhost:5173', 'http://localhost:3001');
  imgSrc.push('http://localhost:3001');
  mediaSrc.push('http://localhost:3001');
}

app.use(requestIdMiddleware);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc,
        mediaSrc,
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        frameSrc: ['https://www.youtube.com', 'https://www.youtube-nocookie.com'],
        connectSrc,
      },
    },
  }),
);
app.use(createCorsMiddleware());
app.use(express.json());

app.use(
  '/media',
  express.static(getMediaUploadDir(), {
    maxAge: process.env.NODE_ENV === 'production' ? '30d' : 0,
  }),
);
app.use(
  '/og',
  express.static(getOgUploadDir(), {
    maxAge: process.env.NODE_ENV === 'production' ? '7d' : 0,
  }),
);

app.use(seoRoutes);

app.use('/api/v1/content', contentRoutes);
app.use('/api/v1/registrations', registrationPublicRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/marketing', marketingRoutes);
app.use('/api/v1/admin', adminRoutes);

app.get('/health', async (_req, res) => {
  const dbStats = await getDatabaseStats();
  let dbConnected = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbConnected = true;
  } catch {
    dbConnected = false;
  }

  const healthy = dbConnected && dbStats.ok;
  res.status(healthy ? 200 : 503).json({
    service: 'book-website-api',
    status: healthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    checks: {
      database: {
        ok: dbConnected && dbStats.ok,
        sizeBytes: dbStats.sizeBytes ?? null,
      },
      uploads: {
        ok: true,
        root: getUploadRoot(),
      },
    },
  });
});

app.use(errorHandler);

async function startServer() {
  const databaseUrl = await ensureDatabasePath();
  const storageProvider = getStorageProvider();

  if (storageProvider === 'local') {
    await mkdir(getMediaUploadDir(), { recursive: true });
    await mkdir(getOgUploadDir(), { recursive: true });
    await bootstrapMediaAssets();
  }

  if (process.env.BACKUP_ON_START === '1') {
    const { backupDatabase } = await import('./lib/backupDatabase');
    const result = await backupDatabase();
    if (result) {
      console.log(`[💾] Startup backup: ${result.backupPath}`);
    }
  }

  app.listen(PORT, () => {
    console.log(`[🚀] API listening on port ${PORT}`);
    console.log(`[🗄️] Database: ${databaseUrl}`);
    console.log(`[📁] Upload root: ${getUploadRoot()}`);
    console.log(`[🗂️] Storage provider: ${storageProvider}`);
    console.log(`[🔗] Public API URL: ${getApiPublicUrl()}`);
  });
}

if (process.env.NODE_ENV !== 'test') {
  void startServer();
}
