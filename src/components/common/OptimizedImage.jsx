import React from 'react';

/**
 * A reusable component for optimized images.
 * Supports native lazy loading, async decoding, and WebP/AVIF if URLs are provided.
 */
const OptimizedImage = ({ 
  src, 
  alt, 
  style, 
  className, 
  loading = 'lazy', 
  width, 
  height,
  sizes,
  srcset,
  priority = false 
}) => {
  // If priority is true, we disable lazy loading and set fetchpriority
  const isLazy = !priority && loading === 'lazy';
  
  return (
    <img
      src={src}
      alt={alt || ''}
      style={{
        ...style,
        display: 'block',
        maxWidth: '100%',
        height: 'auto'
      }}
      className={className}
      loading={isLazy ? 'lazy' : 'eager'}
      decoding="async"
      width={width}
      height={height}
      srcSet={srcset}
      sizes={sizes}
      {...(priority ? { fetchpriority: 'high' } : {})}
    />
  );
};

export default OptimizedImage;
