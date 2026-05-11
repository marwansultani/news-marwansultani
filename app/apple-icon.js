import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{
        width: 180, height: 180,
        background: '#1a1209',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', width: 118, marginBottom: 7 }}>
          <div style={{ flex: 1, height: 1.5, background: '#f5f0e8' }} />
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#8b2020', margin: '0 6px', flexShrink: 0 }} />
          <div style={{ flex: 1, height: 1.5, background: '#f5f0e8' }} />
        </div>
        <div style={{
          fontSize: 104, fontWeight: 700, color: '#f5f0e8',
          fontFamily: 'Georgia, "Times New Roman", serif',
          lineHeight: 0.88,
        }}>D</div>
        <div style={{ display: 'flex', alignItems: 'center', width: 118, marginTop: 7 }}>
          <div style={{ flex: 1, height: 1.5, background: '#f5f0e8' }} />
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#8b2020', margin: '0 6px', flexShrink: 0 }} />
          <div style={{ flex: 1, height: 1.5, background: '#f5f0e8' }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
