import './globals.css';

export const metadata = {
  title: 'Daily Digest',
  description: 'Your personal newsletter digest',
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
