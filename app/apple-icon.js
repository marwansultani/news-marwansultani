import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

async function fetchFont(family, weight) {
  // Use old UA so Google Fonts returns TTF — satori (next/og) doesn't support WOFF2
  const css = await fetch(
    `https://fonts.googleapis.com/css?family=${family.replace(/ /g, '+')}:${weight}`,
    { headers: { 'User-Agent': 'Mozilla/4.0 (compatible; MSIE 6.0)' } }
  ).then(r => r.text());
  const url = css.match(/src: url\((.+?)\)/)?.[1];
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ position: 'relative', display: 'flex' }}>
          <span style={{
            fontFamily: serif,
            fontSize: 105,
            fontWeight: 900,
            color: '#1a1209',
            lineHeight: 1,
          }}>D</span>
          <div style={{
            position: 'absolute',
            bottom: 5,
            right: -6,
            width: 19,
            height: 19,
            borderRadius: '50%',
            background: '#8b2020',
          }} />
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
