export default function manifest() {
  return {
    name: 'Daily Digest',
    short_name: 'Digest',
    description: 'Your personal newsletter digest',
    start_url: '/',
    display: 'standalone',
    background_color: '#faf9f6',
    theme_color: '#1c1917',
    icons: [
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
