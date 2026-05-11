import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';

export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default async function Icon() {
  const playfairData = readFileSync(join(process.cwd(), 'public/fonts/PlayfairDisplay.ttf'));
  const fonts = [{ name: 'Playfair Display', data: playfairData, weight: 900, style: 'normal' }];
  const serif = 'Playfair Display';

  return new ImageResponse(
    (
      <div style={{
        width: 512, height: 512,
        background: '#f5f0e8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ position: 'relative', display: 'flex' }}>
          <span style={{
            fontFamily: serif,
            fontSize: 300,
            fontWeight: 900,
            color: '#1a1209',
            lineHeight: 1,
          }}>D</span>
          <div style={{
            position: 'absolute',
            bottom: 14,
            right: -18,
            width: 54,
            height: 54,
            borderRadius: '50%',
            background: '#8b2020',
          }} />
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
