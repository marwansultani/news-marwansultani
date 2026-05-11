'use client';

import { useState, useEffect, useRef } from 'react';

const SOURCES = {
  'Morning Brew': { bg: '#eff6ff', border: '#93c5fd', label: '#1e40af', dot: '#1d4ed8', badge: '#dbeafe', badgeText: '#1e3a8a' },
  'The Peak':     { bg: '#f0fdf4', border: '#86efac', label: '#15803d', dot: '#16a34a', badge: '#dcfce7', badgeText: '#14532d' },
};

function RichText({ nodes }) {
  return (
    <span>
      {(nodes || []).map((node, i) => {
        if (node.link) {
          return (
            <a key={i} href={node.link.href} target='_blank' rel='noopener noreferrer'
              style={{ color: '#1d4ed8', textDecoration: 'underline', textUnderlineOffset: 2 }}
              onClick={e => e.stopPropagation()}>
              {node.link.text}
            </a>
          );
        }
        return (node.text || '').split('\n\n').map((para, j) =>
          j === 0 ? <span key={j}>{para}</span> : <span key={j}><br /><br />{para}</span>
        );
      })}
    </span>
  );
}

function Drawer({ story, onClose }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);
  const handleClose = () => { setVisible(false); setTimeout(onClose, 300); };

  return (
    <>
      <div onClick={handleClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 100,
        opacity: visible ? 1 : 0, transition: 'opacity 0.3s ease',
      }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 'min(540px, 94vw)', background: '#faf9f6', zIndex: 101,
        display: 'flex', flexDirection: 'column',
        transform: visible ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)',
        boxShadow: '-6px 0 48px rgba(0,0,0,0.12)',
      }}>
        <div style={{
          padding: '22px 24px 18px', borderBottom: '1px solid #e8e4dc',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0,
        }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#1c1917', fontFamily: 'Georgia, serif', lineHeight: 1.55, flex: 1, paddingRight: 16 }}>{story.summary}</p>
          <button onClick={handleClose} style={{ background: '#ede8df', border: 'none', borderRadius: '50%', width: 34, height: 34, fontSize: 20, cursor: 'pointer', color: '#78716c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
        </div>
        <div style={{ padding: '12px 24px 4px', flexShrink: 0 }}>
          <span style={{ fontSize: 10, letterSpacing: 2, color: '#9ca3af', textTransform: 'uppercase' }}>
            {story.sources.length} source{story.sources.length > 1 ? 's' : ''}
          </span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 24px 32px' }}>
          {story.sources.map((source, i) => {
            const st = SOURCES[source.name] || { bg: '#f9fafb', border: '#e5e7eb', label: '#374151', dot: '#9ca3af' };
            return (
              <div key={i} style={{ background: st.bg, border: '1px solid ' + st.border, borderRadius: 10, padding: '18px 20px', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: st.dot }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: st.label, letterSpacing: 1.5, textTransform: 'uppercase' }}>{source.name}</span>
                </div>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.85, color: '#374151', fontFamily: 'Georgia, serif' }}>
                  <RichText nodes={source.nodes} />
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function StoryRow({ story }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <>
      <div onClick={() => setDrawerOpen(true)} style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        gap: 12, padding: '13px 0', borderBottom: '1px solid #ede8df', cursor: 'pointer',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1 }}>
          <span style={{ marginTop: 5, flexShrink: 0, fontSize: 12, color: '#c4b9ac' }}>›</span>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: '#1c1917', fontFamily: 'Georgia, serif' }}>{story.summary}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0, marginTop: 3 }}>
          {story.sources.map(s => {
            const st = SOURCES[s.name] || { badge: '#f3f4f6', badgeText: '#374151', border: '#d1d5db' };
            return <span key={s.name} style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: st.badge, color: st.badgeText, border: '1px solid ' + st.border }}>{s.name === 'Morning Brew' ? 'MB' : s.name === 'The Peak' ? 'TP' : s.name.slice(0,2).toUpperCase()}</span>;
          })}
          <span style={{ fontSize: 11, color: '#d1c9be', marginLeft: 2 }}>↗</span>
        </div>
      </div>
      {drawerOpen && <Drawer story={story} onClose={() => setDrawerOpen(false)} />}
    </>
  );
}

function Bucket({ bucket }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div style={{ marginBottom: 32 }}>
      <div onClick={() => setCollapsed(!collapsed)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #1c1917', paddingBottom: 6, cursor: 'pointer' }}>
        <h2 style={{ margin: 0, fontSize: 10.5, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', color: '#1c1917', fontFamily: 'Georgia, serif' }}>{bucket.label}</h2>
        <span style={{ fontSize: 10, color: '#9ca3af' }}>{collapsed ? 'show ' + bucket.stories.length : 'hide'}</span>
      </div>
      {!collapsed && bucket.stories.map((story, i) => <StoryRow key={i} story={story} />)}
    </div>
  );
}

export default function DailyDigest({ days, digests, initialReadState }) {
  const [activeDay, setActiveDay] = useState(0);
  const [readState, setReadState] = useState(initialReadState || {});
  const markReadTimer = useRef(null);

  const persistRead = async (date, isRead) => {
    try {
      await fetch('/api/read-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, is_read: isRead }),
      });
    } catch (e) { console.error('Failed to persist read state', e); }
  };

  useEffect(() => {
    const date = days[activeDay]?.date;
    if (!date || readState[date]) return;
    clearTimeout(markReadTimer.current);
    markReadTimer.current = setTimeout(() => {
      setReadState(prev => ({ ...prev, [date]: true }));
      persistRead(date, true);
    }, 4000);
    return () => clearTimeout(markReadTimer.current);
  }, [activeDay]);

  const toggleRead = (dayIdx, e) => {
    e.stopPropagation();
    clearTimeout(markReadTimer.current);
    const date = days[dayIdx]?.date;
    if (!date) return;
    const newValue = !readState[date];
    setReadState(prev => ({ ...prev, [date]: newValue }));
    persistRead(date, newValue);
  };

  const digest = digests[days[activeDay]?.date];
  const day = days[activeDay];
  const totalStories = digest?.buckets?.reduce((a, b) => a + b.stories.length, 0) || 0;
  const unreadCount = Object.values(readState).filter(v => !v).length;

  if (!day || !digest) {
    return (
      <div style={{ background: '#faf9f6', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#1c1917', marginBottom: 8 }}>Daily Digest</div>
          <div style={{ fontSize: 12, color: '#9ca3af' }}>No digests yet. Tomorrow morning, your first one will appear.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#faf9f6', minHeight: '100vh', fontFamily: 'Georgia, serif' }}>
      <div style={{ background: '#faf9f6', borderBottom: '1px solid #e8e4dc', position: 'sticky', top: 0, zIndex: 10, overflowX: 'auto' }}>
        <div style={{ display: 'flex', maxWidth: 680, margin: '0 auto', padding: '0 24px', alignItems: 'stretch' }}>
          {days.map((d, i) => {
            const isRead = readState[d.date];
            const isActive = activeDay === i;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <button onClick={() => setActiveDay(i)} style={{
                  background: 'none', border: 'none',
                  borderBottom: isActive ? '2px solid #1c1917' : '2px solid transparent',
                  padding: '13px 10px 11px', cursor: 'pointer',
                  fontFamily: 'Georgia, serif',
                  color: isActive ? '#1c1917' : isRead ? '#9ca3af' : '#1c1917',
                  fontWeight: (isActive || !isRead) ? 700 : 400,
                  fontSize: 11.5, whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  {!isRead && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#1d4ed8', flexShrink: 0 }} />}
                  {d.label}
                </button>
                <button onClick={(e) => toggleRead(i, e)} title={isRead ? 'Mark as unread' : 'Mark as read'} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', fontSize: 13, color: '#c4b9ac', opacity: isActive ? 1 : 0.5, lineHeight: 1 }}>
                  {isRead ? '○' : '●'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 9, letterSpacing: 5, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 10 }}>{day.full}</div>
          <div style={{ fontSize: 44, fontWeight: 700, color: '#1c1917', letterSpacing: '-2px', lineHeight: 1, marginBottom: 16 }}>Daily Digest</div>
          <div style={{ marginBottom: 14 }}>
            {readState[day.date] ? (
              <span style={{ fontSize: 11, color: '#9ca3af' }}>Read · <span onClick={(e) => toggleRead(activeDay, e)} style={{ textDecoration: 'underline', cursor: 'pointer' }}>Mark as unread</span></span>
            ) : (
              <span style={{ fontSize: 11, color: '#1d4ed8', fontWeight: 600 }}>● Unread · <span onClick={(e) => toggleRead(activeDay, e)} style={{ textDecoration: 'underline', cursor: 'pointer', fontWeight: 400, color: '#9ca3af' }}>Mark as read</span></span>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
            {(digest.sources || []).map(name => {
              const st = SOURCES[name] || { badge: '#f3f4f6', badgeText: '#374151', border: '#d1d5db' };
              return <span key={name} style={{ fontSize: 10, padding: '3px 12px', borderRadius: 20, background: st.badge, color: st.badgeText, border: '1px solid ' + st.border }}>{name}</span>;
            })}
          </div>
          <div style={{ height: 1, background: 'linear-gradient(to right, transparent, #c4b9ac, transparent)' }} />
        </div>

        {digest.buckets.map((bucket, i) => <Bucket key={i} bucket={bucket} />)}

        <div style={{ marginTop: 40, paddingTop: 16, borderTop: '1px solid #ede8df', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 10, color: '#c4b9ac', letterSpacing: 1, textTransform: 'uppercase' }}>Generated 7:00 AM</span>
          <span style={{ fontSize: 10, color: '#c4b9ac', letterSpacing: 1, textTransform: 'uppercase' }}>{totalStories} stories · {unreadCount > 0 ? unreadCount + ' unread' : 'all read'}</span>
        </div>
      </div>
    </div>
  );
}
