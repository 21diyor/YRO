import React, { useState } from "react";

interface PostImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
}

/** Placeholder when image fails to load (no extra file needed) */
const PLACEHOLDER_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23f3f4f6' width='400' height='300'/%3E%3Ctext fill='%239ca3af' font-family='system-ui' font-size='14' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle'%3EImage%3C/text%3E%3C/svg%3E";

export function PostImage({ src, alt, fallbackSrc, className, ...props }: PostImageProps) {
  const [error, setError] = useState(false);
  const [fallbackError, setFallbackError] = useState(false);

  const currentSrc =
    error && fallbackSrc && !fallbackError ? fallbackSrc : error || fallbackError ? PLACEHOLDER_SVG : src;

  return (
    <img
      {...props}
      src={currentSrc}
      alt={alt}
      className={className}
      onError={() => {
        if (!fallbackError) {
          if (!error) setError(true);
          else setFallbackError(true);
        }
      }}
    />
  );
}
