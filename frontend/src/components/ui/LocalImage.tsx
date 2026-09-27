import Image from 'next/image';
import type { ImgHTMLAttributes } from 'react';
type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'onLoad' | 'onError'> & { src: string; alt: string };
export function LocalImage({src,alt,width,height,loading,...props}:Props) {
  const isExternal = /^https?:\/\//.test(src);
  // For external hosts not in next.config, use unoptimized to avoid hostname error
  // Also fallback to plain <img> if needed, but next/image with unoptimized handles it
  return <Image {...props} src={src} alt={alt} width={Number(width)||1200} height={Number(height)||800} loading={loading || 'lazy'} sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw" unoptimized={isExternal} />;
}
