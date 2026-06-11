import type { ImgHTMLAttributes } from 'react';
import { resolveAssetUrl } from '../lib/assetUrl';

type CmsImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  srcSet?: string;
  sizes?: string;
};

/** Image tag that resolves /media and /og paths against VITE_API_ORIGIN when needed. */
export function CmsImage({
  src,
  srcSet,
  sizes,
  width,
  height,
  loading = 'lazy',
  ...props
}: CmsImageProps) {
  const resolved = typeof src === 'string' ? resolveAssetUrl(src) : src;
  const resolvedSrcSet =
    typeof srcSet === 'string'
      ? srcSet
          .split(',')
          .map((entry) => {
            const [url, descriptor] = entry.trim().split(/\s+/, 2);
            const resolvedUrl = resolveAssetUrl(url);
            return descriptor ? `${resolvedUrl} ${descriptor}` : resolvedUrl;
          })
          .join(', ')
      : srcSet;

  return (
    <img
      src={resolved}
      srcSet={resolvedSrcSet}
      sizes={sizes}
      width={width}
      height={height}
      loading={loading}
      decoding="async"
      {...props}
    />
  );
}
