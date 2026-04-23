import React from 'react';

const LOGOS = {
  light: '/assets/brand/masala-matrix-logo-black-elements.png',
  dark: '/assets/brand/masala-matrix-logo-white-elements.png',
};

export default function BrandLogo({ theme = 'dark', size = 38, style }) {
  const src = theme === 'light' ? LOGOS.light : LOGOS.dark;

  return (
    <img
      src={src}
      alt="Masala Matrix"
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        borderRadius: Math.max(8, Math.round(size * 0.24)),
        objectFit: 'cover',
        display: 'block',
        ...style,
      }}
    />
  );
}
