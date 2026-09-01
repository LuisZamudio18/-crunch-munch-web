import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Crunch & Munch — Luxury Mobile Bars';

// Next.js auto-detects this file and wires up og:image / og:image:width /
// og:image:height / og:image:type on every page that doesn't define its own
// opengraph-image, so /about, /contact, /privacy inherit this too.
export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: 'linear-gradient(160deg, #2C1A0A 0%, #1C1008 40%, #3D2510 70%, #5C3D1E 100%)',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontStyle: 'italic',
            color: '#FEFDF9',
            display: 'flex',
            gap: 20,
          }}
        >
          <span>Crunch</span>
          <span style={{ color: '#D9B456' }}>&amp;</span>
          <span>Munch</span>
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 30,
            letterSpacing: 10,
            textTransform: 'uppercase',
            color: '#EACF8B',
          }}
        >
          Luxury Mobile Bars
        </div>
      </div>
    ),
    { ...size }
  );
}
