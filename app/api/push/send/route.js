import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

webpush.setVapidDetails(
  process.env.VAPID_CONTACT || 'mailto:noreply@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export async function POST(req) {
  const auth = req.headers.get('x-push-secret');
  if (!auth || auth !== process.env.PUSH_SEND_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const title = body.title || 'Your daily digest is ready';
  const message = body.body || 'Today’s digest has been generated.';
  const url = body.url || '/';

  const [digestsRes, readRes] = await Promise.all([
    supabase.schema('news').from('digests').select('date'),
    supabase.schema('news').from('read_state').select('date').eq('is_read', true),
  ]);
  const readDates = new Set((readRes.data || []).map(r => r.date));
  const badgeCount = (digestsRes.data || []).filter(d => !readDates.has(d.date)).length;

  const { data: subs, error } = await supabase
    .schema('news')
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth');

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const payload = JSON.stringify({ title, body: message, url, badgeCount, tag: 'daily-digest' });
  const results = await Promise.allSettled(
    (subs || []).map(s =>
      webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        payload
      ).catch(async (err) => {
        if (err.statusCode === 404 || err.statusCode === 410) {
          await supabase.schema('news').from('push_subscriptions').delete().eq('endpoint', s.endpoint);
        }
        throw err;
      })
    )
  );

  const sent = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.length - sent;
  return Response.json({ sent, failed, total: results.length, badgeCount });
}
