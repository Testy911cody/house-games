import { NextResponse } from 'next/server';

// Serve a simple SVG as PNG (browser will handle it)
export async function GET() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <rect width="512" height="512" fill="#0a0a1a"/>
    <text x="50%" y="50%" font-size="320" text-anchor="middle" dominant-baseline="middle" fill="#00ffff">🏠</text>
  </svg>`;
  
  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}

