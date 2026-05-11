'use client';

import { useState, useEffect, useRef } from 'react';
import NotificationSetup from './NotificationSetup';

const SOURCES = {
  'Morning Brew': { bg: '#eff6ff', border: '#93c5fd', label: '#1e40af', dot: '#1d4ed8', badge: '#dbeafe', badgeText: '#1e3a8a' },
  'The Peak':     { bg: '#f0fdf4', border: '#86efac', label: '#15803d', dot: '#16a34a', badge: '#dcfce7', badgeText: '#14532d' },
};

// Strip trailing standalone link nodes (source attribution appended at end of seeded content)
function trimNodes(nodes) {
  if (!nodes) return [];
  let end = nodes.length;
  while (end > 0 && nodes[end - 1].link !== undefined && nodes[end - 1].text === undefined) end--;
  return nodes.slice(0, end);
}

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
  const [dragX, setDragX] = useState(0);
  const startX = useRef(0);
  const startY = useRef(0);
  const startTime = useRef(0);
  const axis = useRef(null);

  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  const handleClose = () => { setVisible(false); setTimeout(onClose, 300); };

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const onTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    startTime.current = Date.now();
    axis.current = null;
  };
  const onTouchMove = (e) => {
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;
    if (axis.current === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
      axis.current = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    }
    if (axis.current === 'x' && dx > 0) setDragX(dx);
  };
  const onTouchEnd = (e) => {
    if (axis.current !== 'x') return;
    const dx = e.changedTouches[0].clientX - startX.current;
    const velocity = dx / (Date.now() - startTime.current);
    if (dx > 100 || velocity > 0.4) handleClose();
    else setDragX(0);
  };

  const dragging = dragX > 0;

  return (
    <>
      <div onClick={handleClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 100,
        opacity: visible ? Math.max(0, 1 - dragX / 400) : 0,
        transition: dragging ? 'none' : 'opacity 0.3s ease',
      }} />
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 'min(540px, 94vw)', background: '#faf9f6', zIndex: 101,
        display: 'flex', flexDirection: 'column',
        transform: visible ? `translateX(${dragX}px)` : 'translateX(100%)',
        transition: dragging ? 'none' : 'transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)',
        boxShadow: '-6px 0 48px rgba(0,0,0,0.12)',
        touchAction: 'pan-y',
      }}>
        <div style={{
          padding: '14px 16px', borderBottom: '1px solid #e8e4dc',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0,
        }}>
          <span style={{ fontSize: 10, letterSpacing: 2, color: '#9ca3af', textTransform: 'uppercase' }}>
            {story.sources.length} source{story.sources.length > 1 ? 's' : ''}
          </span>
          <button onClick={handleClose} style={{ background: '#ede8df', border: 'none', borderRadius: '50%', width: 34, height: 34, fontSize: 20, cursor: 'pointer', color: '#78716c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
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
                  <RichText nodes={trimNodes(source.nodes)} />
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
      <button
        onClick={() => setDrawerOpen(true)}
        style={{
          width: '100%', background: 'none', border: 'none',
          borderBottom: '1px solid #ede8df', padding: '14px 0',
          cursor: 'pointer', textAlign: 'left',
          display: 'flex', flexDirection: 'column', gap: 8,
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: '#1c1917', fontFamily: 'Georgia, serif' }}>
          {story.summary}
        </p>
        <div style={{ display: 'flex', gap: 5 }}>
          {story.sources.map(s => {
            const st = SOURCES[s.name] || { badge: '#f3f4f6', badgeText: '#374151', border: '#d1d5db' };
            return (
              <span key={s.name} style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: st.badge, color: st.badgeText, border: '1px solid ' + st.border }}>
                {s.name === 'Morning Brew' ? 'MB' : s.name === 'The Peak' ? 'TP' : s.name.slice(0, 2).toUpperCase()}
              </span>
            );
          })}
        </div>
      </button>
      {drawerOpen && <Drawer story={story} onClose={() => setDrawerOpen(false)} />}
    </>
  );
}

function Bucket({ bucket }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div style={{ marginBottom: 32 }}>
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          width: '100%', background: 'none', border: 'none',
          borderBottom: '2px solid #1c1917', paddingBottom: 6, paddingTop: 0,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <h2 style={{ margin: 0, fontSize: 10.5, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', color: '#1c1917', fontFamily: 'Georgia, serif' }}>{bucket.label}</h2>
        <span style={{ fontSize: 10, color: '#9ca3af' }}>{collapsed ? 'show ' + bucket.stories.length : 'hide'}</span>
      </button>
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
  const unreadCount = days.filter(d => readState[d.date] !== true).length;

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('setAppBadge' in navigator)) return;
    if (unreadCount > 0) navigator.setAppBadge(unreadCount).catch(() => {});
    else navigator.clearAppBadge?.().catch(() => {});
  }, [unreadCount]);

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
      {/* Sticky wrapper separate from overflow wrapper — iOS Safari requires this */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ background: '#faf9f6', borderBottom: '1px solid #e8e4dc', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div style={{ display: 'flex', padding: '0 16px', alignItems: 'stretch', width: 'max-content', minWidth: '100%' }}>
            {days.map((d, i) => {
              const isRead = readState[d.date];
              const isActive = activeDay === i;
              return (
                <button key={i} onClick={() => setActiveDay(i)} style={{
                  background: 'none', border: 'none',
                  borderBottom: isActive ? '2px solid #1c1917' : '2px solid transparent',
                  padding: '14px 10px 12px', cursor: 'pointer',
                  fontFamily: 'Georgia, serif',
                  color: isActive ? '#1c1917' : isRead ? '#9ca3af' : '#1c1917',
                  fontWeight: (isActive || !isRead) ? 700 : 400,
                  fontSize: 12, whiteSpace: 'nowrap', flexShrink: 0,
                  display: 'flex', alignItems: 'center', gap: 5,
                  WebkitTapHighlightColor: 'transparent',
                }}>
                  {!isRead && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1d4ed8', flexShrink: 0 }} />}
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 20px 80px' }}>
        <NotificationSetup />
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 9, letterSpacing: 5, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 10 }}>{day.full}</div>
          <div style={{ fontSize: 44, fontWeight: 700, color: '#1c1917', letterSpacing: '-2px', lineHeight: 1, marginBottom: 16 }}>Daily Digest</div>
          <div style={{ marginBottom: 14 }}>
            {readState[day.date] ? (
              <span style={{ fontSize: 11, color: '#9ca3af' }}>Read · <button onClick={(e) => toggleRead(activeDay, e)} style={{ background: 'none', border: 'none', padding: 0, textDecoration: 'underline', cursor: 'pointer', fontSize: 11, color: '#9ca3af', fontFamily: 'Georgia, serif', WebkitTapHighlightColor: 'transparent' }}>Mark as unread</button></span>
            ) : (
              <span style={{ fontSize: 11, color: '#1d4ed8', fontWeight: 600 }}>● Unread · <button onClick={(e) => toggleRead(activeDay, e)} style={{ background: 'none', border: 'none', padding: 0, textDecoration: 'underline', cursor: 'pointer', fontSize: 11, color: '#9ca3af', fontFamily: 'Georgia, serif', fontWeight: 400, WebkitTapHighlightColor: 'transparent' }}>Mark as read</button></span>
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
          <span style={{ fontSize: 10, color: '#c4b9ac', letterSpacing: 1, textTransform: 'uppercase' }}>
            {digest.createdAt ? 'Generated ' + new Date(digest.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : 'Generated 7:00 AM'}
          </span>
          <span style={{ fontSize: 10, color: '#c4b9ac', letterSpacing: 1, textTransform: 'uppercase' }}>{totalStories} stories · {unreadCount > 0 ? unreadCount + ' unread' : 'all read'}</span>
        </div>
      </div>
    </div>
  );
}
