self.addEventListener('push', function (event) {
  if (!event.data) return;
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: data.icon || '/icon',
    badge: '/icon',
    tag: data.tag || 'daily-digest',
    data: { url: data.url || '/' },
  };
  event.waitUntil(
    (async () => {
      await self.registration.showNotification(data.title, options);
      if (typeof data.badgeCount === 'number' && self.navigator.setAppBadge) {
        await self.navigator.setAppBadge(data.badgeCount).catch(() => {});
      }
    })()
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
      for (const w of wins) {
        if ('focus' in w) return w.focus();
      }
      return clients.openWindow(url);
    })
  );
});
