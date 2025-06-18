'use client';

import Image from 'next/image';

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  sizes = '100vw',
  quality = 85,
  placeholder = 'blur',
  blurDataURL = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYyMCIgaGVpZ2h0PSI1MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YyZjJmMiIvPjwvc3ZnPg==",
  fill = false,
  style,
  ...props
}) {
  // If fill is true, we need to ensure the parent has position: relative
  const imageStyle = fill ? { position: 'absolute', height: '100%', width: '100%', ...style } : style;

  return (
    <Image
      src={src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      className={`optimized-image ${className}`}
      priority={priority}
      sizes={sizes}
      quality={quality}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      fill={fill}
      style={imageStyle}
      {...props}
    />
  );
} 