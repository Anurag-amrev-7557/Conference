import type { ImgHTMLAttributes } from 'react';
import { resolveAssetUrl } from '../lib/assetUrl';

type CmsImageProps = ImgHTMLAttributes<HTMLImageElement>;

/** Image tag that resolves /media and /og paths against VITE_API_ORIGIN when needed. */
export function CmsImage({ src, ...props }: CmsImageProps) {
  const resolved = typeof src === 'string' ? resolveAssetUrl(src) : src;
  return <img src={resolved} {...props} />;
}
