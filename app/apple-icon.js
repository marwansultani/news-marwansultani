import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

async function fetchFont(family, weight) {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@${weight}&display=swap`,
    { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36' } }
  ).then(r => r.text());
  const url = css.match(/src: url\((.+?)\) format\('woff2'\)/)?.[1];
  if (!url) return null;
  return fetch(url).then(r => r.arrayBuffer());
}

export default async function AppleIcon() {
  const playfairData = await fetchFont('Playfair Display', 900).catch(() => null);
  const fonts = playfairData
    ? [{ name: 'Playfair Display', data: playfairData, weight: 900, style: 'normal' }]
    : [];
  const serif = playfairData ? 'Playfair Display' : 'Georgia, serif';

  return new ImageResponse(
    (
      <div style={{
        width: 180, height: 180,
        background: '#f5f0e8',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 6,
      }}>
        <div style={{
          fontFamily: 'monospace',
          fontSize: 19, fontWeight: 700,
          letterSpacing: 4,
          color: '#8b2020',
          textTransform: 'uppercase',
          lineHeight: 1,
          marginLeft: 4,
        }}>DAILY</div>
        <div style={{ width: 110, height: 1.5, background: '#1a1209' }} />
        <div style={{
          fontFamily: serif,
          fontSize: 41, fontWeight: 900,
          color: '#1a1209',
          lineHeight: 1,
          letterSpacing: -1,
          marginTop: -2,
        }}>Digest</div>
      </div>
    ),
    { ...size, fonts }
  );
}
