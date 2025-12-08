import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const size = searchParams.get('size') || '192';
  
  const viewBox = size === '512' ? '0 0 512 512' : '0 0 192 192';
  const fontSize = size === '512' ? '320' : '120';
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">
    <rect width="${size}" height="${size}" fill="#0a0a1a"/>
    <text x="50%" y="50%" font-size="${fontSize}" text-anchor="middle" dominant-baseline="middle" fill="#00ffff">🏠</text>
  </svg>`;
  
  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}

