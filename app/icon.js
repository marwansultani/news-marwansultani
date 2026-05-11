import { ImageResponse } from 'next/og';

export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{
        width: 512, height: 512,
        background: '#1a1209',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', width: 340, marginBottom: 18 }}>
          <div style={{ flex: 1, height: 2, background: '#f5f0e8' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#8b2020', margin: '0 14px', flexShrink: 0 }} />
          <div style={{ flex: 1, height: 2, background: '#f5f0e8' }} />
        </div>
        <div style={{
          fontSize: 292, fontWeight: 700, color: '#f5f0e8',
          fontFamily: 'Georgia, "Times New Roman", serif',
          lineHeight: 0.88,
        }}>D</div>
        <div style={{ display: 'flex', alignItems: 'center', width: 340, marginTop: 18 }}>
          <div style={{ flex: 1, height: 2, background: '#f5f0e8' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#8b2020', margin: '0 14px', flexShrink: 0 }} />
          <div style={{ flex: 1, height: 2, background: '#f5f0e8' }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
