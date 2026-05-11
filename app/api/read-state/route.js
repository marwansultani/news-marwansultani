import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  const { date, is_read } = await req.json();
  await supabase.schema('news').from('read_state').upsert({
    date,
    is_read,
    read_at: is_read ? new Date().toISOString() : null,
  }, { onConflict: 'date' });
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}
