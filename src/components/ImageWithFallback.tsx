import React, { useState, useEffect } from 'react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * A component that handles image loading errors with fallbacks
 * Specifically designed to handle Firebase Storage URL issues
 */
const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  fallbackSrc = '',
  className = '',
  style = {}
}) => {
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);
  
  // Reset error state if src changes
  useEffect(() => {
    setError(false);
    setImageSrc(src);
  }, [src]);

  const handleError = () => {
    console.error(`Failed to load image: ${imageSrc}`);
    setError(true);
  };
  
  // Validate if the src is a proper Firebase Storage URL
  const isValidUrl = (url: string) => {
    if (!url) return false;
    
    // Check if it's a Firebase Storage URL but missing token (malformed)
    if (url.includes('firebasestorage.googleapis.com') && 
        !url.includes('token=') && 
        !url.includes('alt=media')) {
      console.warn('Firebase Storage URL missing authentication token:', url);
      return false;
    }
    
    return true;
  };

  // Render a placeholder if there's no fallback
  const renderPlaceholder = () => {
    if (fallbackSrc) return null;
    
    return (
      <div 
        className={`image-placeholder ${className}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f0f0f0',
          color: '#666',
          fontSize: '14px',
          width: style.width || '100px',
          height: style.height || '100px',
          ...style
        }}
      >
        {alt || 'Image'}
      </div>
    );
  };

  if (error || !isValidUrl(imageSrc)) {
    return fallbackSrc ? (
      <img
        src={fallbackSrc}
        alt={alt}
        className={`${className} image-fallback`}
        style={style}
      />
    ) : renderPlaceholder();
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      onError={handleError}
      className={className}
      style={style}
      crossOrigin="anonymous"
    />
  );
};

export default ImageWithFallback;