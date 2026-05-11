'use client';

import { useEffect, useState } from 'react';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export default function NotificationSetup() {
  const [state, setState] = useState('loading');
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    setIsIOS(ios);
    setIsStandalone(standalone);

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState('unsupported');
      return;
    }
    (async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' });
        const sub = await reg.pushManager.getSubscription();
        setState(sub ? 'subscribed' : 'idle');
      } catch (e) {
        console.error('SW register failed', e);
        setState('unsupported');
      }
    })();
  }, []);

  const subscribe = async () => {
    setState('working');
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
      });
      const json = sub.toJSON();
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys, userAgent: navigator.userAgent }),
      });
      setState('subscribed');
    } catch (e) {
      console.error('Subscribe failed', e);
      setState('idle');
    }
  };

  const unsubscribe = async () => {
    setState('working');
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setState('idle');
    } catch (e) {
      console.error('Unsubscribe failed', e);
      setState('subscribed');
    }
  };

  if (state === 'loading' || state === 'subscribed') return null;
  if (state === 'unsupported') return null;
  if (isIOS && !isStandalone) {
    return (
      <div style={{ background: '#fff', border: '1px solid #e8e4dc', borderRadius: 10, padding: '14px 16px', marginBottom: 24, fontSize: 12, color: '#57534e', lineHeight: 1.5 }}>
        <strong style={{ color: '#1c1917' }}>Install the app to get notifications:</strong> tap the Share button, then “Add to Home Screen.” Open the app from your home screen to enable daily push.
      </div>
    );
  }
  return (
    <div style={{ background: '#fff', border: '1px solid #e8e4dc', borderRadius: 10, padding: '14px 16px', marginBottom: 24, fontSize: 12, color: '#57534e', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <span>Get a notification each morning when the digest is ready.</span>
      <button onClick={subscribe} disabled={state === 'working'} style={{ background: '#1c1917', color: '#faf9f6', border: 'none', borderRadius: 6, padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Georgia, serif' }}>
        {state === 'working' ? '…' : 'Enable'}
      </button>
    </div>
  );
}
