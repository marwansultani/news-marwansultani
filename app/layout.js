import './globals.css';

export const metadata = {
  title: 'Daily Digest',
  description: 'Your personal newsletter digest',
  appleWebApp: {
    capable: true,
    title: 'Digest',
    statusBarStyle: 'black-translucent',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1c1917',
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
