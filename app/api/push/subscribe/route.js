import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  const body = await req.json();
  const { endpoint, keys, userAgent } = body || {};
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return Response.json({ error: 'Invalid subscription' }, { status: 400 });
  }

  const { error } = await supabase
    .schema('news')
    .from('push_subscriptions')
    .upsert(
      { endpoint, p256dh: keys.p256dh, auth: keys.auth, user_agent: userAgent || null },
      { onConflict: 'endpoint' }
    );

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ ok: true });
}

export async function DELETE(req) {
  const { endpoint } = await req.json();
  if (!endpoint) return Response.json({ error: 'Missing endpoint' }, { status: 400 });
  const { error } = await supabase
    .schema('news')
    .from('push_subscriptions')
    .delete()
    .eq('endpoint', endpoint);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
