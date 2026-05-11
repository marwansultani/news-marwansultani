import { createClient } from '@supabase/supabase-js';
import DailyDigest from '@/components/DailyDigest';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { data: digestRows } = await supabase
    .schema('news')
    .from('digests')
    .select('*')
    .order('date', { ascending: false })
    .limit(14);

  const { data: readRows } = await supabase
    .schema('news')
    .from('read_state')
    .select('date, is_read');

  const initialReadState = {};
  (readRows || []).forEach(r => { initialReadState[r.date] = r.is_read; });

  const today = new Date().toISOString().split('T')[0];
  const days = (digestRows || []).map(d => {
    const dateObj = new Date(d.date + 'T12:00:00');
    return {
      date: d.date,
      full: dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
      label: d.date === today ? 'Today' : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
  });

  const digests = {};
  (digestRows || []).forEach(d => {
    digests[d.date] = { buckets: d.buckets, sources: d.sources };
  });

  return <DailyDigest days={days} digests={digests} initialReadState={initialReadState} />;
}
