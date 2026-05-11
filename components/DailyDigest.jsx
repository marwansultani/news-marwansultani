'use client';

import { useState, useEffect, useRef } from 'react';
import NotificationSetup from './NotificationSetup';

const SOURCES = {
  'Morning Brew': { bg: '#edf2f9', border: '#bccfe8', label: '#1e3a6e', dot: '#1e3a6e', badge: '#dde9f5', badgeText: '#1e3a6e', badgeBorder: '#bccfe8' },
  'The Peak':     { bg: '#eef6f0', border: '#aad4b6', label: '#1b4d31', dot: '#1b4d31', badge: '#daeee2', badgeText: '#1b4d31', badgeBorder: '#aad4b6' },
};

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
            <a key={i} href={node.link.href} target="_blank" rel="noopener noreferrer"
              style={{ color: '#8b2020', textDecoration: 'underline', textUnderlineOffset: 3 }}
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
  const [dragging, setDragging] = useState(false);
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

  useEffect(() => {
    const scrollY = window.scrollY;
    const orig = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
    };
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    return () => {
      document.body.style.overflow = orig.overflow;
      document.body.style.position = orig.position;
      document.body.style.top = orig.top;
      document.body.style.width = orig.width;
      window.scrollTo(0, scrollY);
    };
  }, []);

  const onTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    startTime.current = Date.now();
    axis.current = null;
    setDragging(true);
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
    setDragging(false);
    if (axis.current !== 'x') return;
    const dx = e.changedTouches[0].clientX - startX.current;
    const velocity = dx / (Date.now() - startTime.current);
    if (dx > 100 || velocity > 0.4) handleClose();
    else setDragX(0);
  };

  return (
    <>
      <div onClick={handleClose} style={{
        position: 'fixed', inset: 0,
        background: 'rgba(26,18,9,0.5)',
        backdropFilter: 'blur(2px)',
        zIndex: 100,
        opacity: visible ? Math.max(0, 1 - dragX / 400) : 0,
        transition: dragging ? 'none' : 'opacity 0.3s ease',
      }} />
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: 'min(560px, 96vw)',
          background: '#faf7f2',
          borderLeft: '1px solid #d8cfbc',
          zIndex: 101,
          display: 'flex', flexDirection: 'column',
          transform: visible ? `translateX(${dragX}px)` : 'translateX(100%)',
          transition: dragging ? 'none' : 'transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)',
          boxShadow: '-12px 0 64px rgba(26,18,9,0.16)',
          touchAction: 'pan-y',
        }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #d8cfbc',
          background: '#f5f0e8',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0,
        }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: 2.5, color: '#7a6e62', textTransform: 'uppercase' }}>
            {story.sources.length} source{story.sources.length > 1 ? 's' : ''}
          </span>
          <div
            onClick={handleClose}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && handleClose()}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              border: '1px solid #d8cfbc', background: '#ede8df',
              cursor: 'pointer', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1L11 11M11 1L1 11" stroke="#7a6e62" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 48px' }}>
          {story.sources.map((source, i) => {
            const st = SOURCES[source.name] || { bg: '#f5f2ed', border: '#d8cfbc', label: '#3a3228', dot: '#7a6e62' };
            return (
              <div key={i} style={{ marginBottom: 28, borderLeft: `3px solid ${st.dot}`, paddingLeft: 18 }}>
                <div style={{ marginBottom: 14 }}>
                  <span style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 10, fontWeight: 700, color: st.label,
                    letterSpacing: 2, textTransform: 'uppercase',
                  }}>{source.name}</span>
                </div>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.9, color: '#2a2018', fontFamily: "'Libre Baskerville', Georgia, serif" }}>
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

function StoryRow({ story, index }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  return (
    <>
      <button
        onClick={() => setDrawerOpen(true)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: '100%',
          background: hovered ? 'rgba(212,201,184,0.22)' : 'none',
          border: 'none',
          borderBottom: '1px solid #d8cfbc',
          padding: '16px 8px',
          cursor: 'pointer', textAlign: 'left',
          display: 'flex', flexDirection: 'column', gap: 10,
          WebkitTapHighlightColor: 'transparent',
          transition: 'background 0.15s ease',
          animation: 'fadeUp 0.4s ease both',
          animationDelay: `${index * 35}ms`,
        }}
      >
        <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.78, color: '#1a1209', fontFamily: "'Libre Baskerville', Georgia, serif" }}>
          {story.summary}
        </p>
        <div style={{ display: 'flex', gap: 6 }}>
          {story.sources.map(s => {
            const st = SOURCES[s.name] || { badge: '#ede8df', badgeText: '#3a3228', badgeBorder: '#d8cfbc' };
            return (
              <span key={s.name} style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 8, fontWeight: 700,
                padding: '3px 8px', borderRadius: 2,
                background: st.badge, color: st.badgeText,
                border: `1px solid ${st.badgeBorder}`,
                letterSpacing: 0.5,
              }}>
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
    <div style={{ marginBottom: 44 }}>
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          width: '100%', background: 'none', border: 'none',
          borderBottom: '2px solid #1a1209',
          padding: '0 0 10px 0',
          cursor: 'pointer', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <h2 style={{
          margin: 0,
          fontFamily: "'Space Mono', monospace",
          fontSize: 10, fontWeight: 700,
          letterSpacing: 3, textTransform: 'uppercase', color: '#1a1209',
        }}>{bucket.label}</h2>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: '#7a6e62', letterSpacing: 1 }}>
          {collapsed ? `${bucket.stories.length} ${bucket.stories.length === 1 ? 'story' : 'stories'}` : 'hide'}
        </span>
      </button>
      {!collapsed && bucket.stories.map((story, i) => <StoryRow key={i} story={story} index={i} />)}
    </div>
  );
}

function usePullToRefresh() {
  const [progress, setProgress] = useState(0);
  const [triggered, setTriggered] = useState(false);
  const startY = useRef(-1);
  const pulling = useRef(false);
  const THRESHOLD = 120;

  useEffect(() => {
    const onTouchStart = (e) => {
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
        pulling.current = false;
      } else {
        startY.current = -1;
      }
    };
    const onTouchMove = (e) => {
      if (startY.current < 0) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy > 0) {
        pulling.current = true;
        setProgress(Math.min(dy / THRESHOLD, 1));
      }
    };
    const onTouchEnd = () => {
      if (!pulling.current) return;
      if (progress >= 1) {
        setTriggered(true);
        setTimeout(() => window.location.reload(), 200);
      } else {
        setProgress(0);
      }
      startY.current = -1;
      pulling.current = false;
    };
    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [progress]);

  return { progress, triggered };
}

export default function DailyDigest({ days, digests, initialReadState }) {
  const [activeDay, setActiveDay] = useState(0);
  const [readState, setReadState] = useState(initialReadState || {});
  const markReadTimer = useRef(null);
  const { progress, triggered } = usePullToRefresh();

  useEffect(() => {
    if (!document.getElementById('digest-fonts')) {
      const link = document.createElement('link');
      link.id = 'digest-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=Space+Mono:wght@400;700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap';
      document.head.appendChild(link);
    }
  }, []);

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
      <div style={{ background: '#f5f0e8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 38, fontWeight: 900, color: '#1a1209', marginBottom: 12 }}>Daily Digest</div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#7a6e62', letterSpacing: 1 }}>Your first edition arrives tomorrow morning.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f5f0e8', minHeight: '100vh' }}>
      <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } } @keyframes shimmer { 0%,100% { opacity:1 } 50% { opacity:0.4 } }`}</style>
      {/* Pull-to-refresh indicator */}
      {progress > 0 && !triggered && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 20,
          height: 44, background: '#f5f0e8',
          borderBottom: `1px solid ${progress >= 1 ? '#8b2020' : '#d8cfbc'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transform: `translateY(${(progress - 1) * 100}%)`,
          pointerEvents: 'none',
          transition: 'border-color 0.15s ease',
        }}>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none"
            style={{ transform: progress >= 1 ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
            <path d="M5.5 1v8M2 6.5l3.5 3.5 3.5-3.5" stroke={progress >= 1 ? '#8b2020' : '#7a6e62'} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{
            fontFamily: "'Space Mono', monospace", fontSize: 9,
            letterSpacing: 2.5, textTransform: 'uppercase',
            color: progress >= 1 ? '#8b2020' : '#7a6e62',
            transition: 'color 0.15s ease',
          }}>
            {progress >= 1 ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </div>
      )}
      {triggered && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 200, background: '#e8e2d8' }}>
          <div style={{ height: '100%', background: '#8b2020', width: '100%', animation: 'shimmer 0.6s ease infinite' }} />
        </div>
      )}

      {/* Nav */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ background: '#f5f0e8', borderBottom: '1px solid #d8cfbc', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div style={{ display: 'flex', padding: '0 20px', alignItems: 'stretch', width: 'max-content', minWidth: '100%' }}>
            {days.map((d, i) => {
              const isRead = readState[d.date];
              const isActive = activeDay === i;
              return (
                <button key={i} onClick={() => setActiveDay(i)} style={{
                  background: 'none', border: 'none',
                  borderBottom: isActive ? '2px solid #1a1209' : '2px solid transparent',
                  padding: '13px 12px 11px', cursor: 'pointer',
                  fontFamily: "'Space Mono', monospace",
                  color: isActive ? '#1a1209' : isRead ? '#a89e92' : '#1a1209',
                  fontWeight: isActive || !isRead ? 700 : 400,
                  fontSize: 10.5, whiteSpace: 'nowrap', flexShrink: 0,
                  display: 'flex', alignItems: 'center', gap: 6,
                  letterSpacing: 0.5,
                  WebkitTapHighlightColor: 'transparent',
                }}>
                  {!isRead && <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#8b2020', flexShrink: 0 }} />}
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 20px 80px' }}>
        <NotificationSetup />

        {/* Masthead */}
        <div style={{ textAlign: 'center', padding: '40px 0 36px', borderBottom: '1px solid #d8cfbc', marginBottom: 44 }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: 4, color: '#7a6e62', textTransform: 'uppercase', marginBottom: 18 }}>
            {day.full}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16, justifyContent: 'center' }}>
            <div style={{ flex: 1, height: 1, background: '#1a1209' }} />
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#8b2020' }} />
            <div style={{ flex: 1, height: 1, background: '#1a1209' }} />
          </div>
          <div style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(44px, 10vw, 64px)',
            fontWeight: 900,
            color: '#1a1209',
            letterSpacing: '-2px',
            lineHeight: 1,
            marginBottom: 16,
          }}>
            Daily Digest
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22, justifyContent: 'center' }}>
            <div style={{ flex: 1, height: 1, background: '#1a1209' }} />
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#8b2020' }} />
            <div style={{ flex: 1, height: 1, background: '#1a1209' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
            {(digest.sources || []).map(name => {
              const st = SOURCES[name] || { badge: '#ede8df', badgeText: '#3a3228', badgeBorder: '#d8cfbc' };
              return (
                <span key={name} style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 9, padding: '4px 12px', borderRadius: 2,
                  background: st.badge, color: st.badgeText, border: `1px solid ${st.badgeBorder}`,
                  letterSpacing: 1,
                }}>{name}</span>
              );
            })}
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: '#c4b9ac' }}>·</span>
            {readState[day.date] ? (
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: '#a89e92', letterSpacing: 1 }}>
                Read ·{' '}
                <button onClick={(e) => toggleRead(activeDay, e)} style={{
                  background: 'none', border: 'none', padding: 0,
                  textDecoration: 'underline', cursor: 'pointer',
                  fontFamily: "'Space Mono', monospace", fontSize: 9, color: '#a89e92', letterSpacing: 1,
                  WebkitTapHighlightColor: 'transparent',
                }}>Mark unread</button>
              </span>
            ) : (
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: '#8b2020', fontWeight: 700, letterSpacing: 1 }}>
                ● Unread ·{' '}
                <button onClick={(e) => toggleRead(activeDay, e)} style={{
                  background: 'none', border: 'none', padding: 0,
                  textDecoration: 'underline', cursor: 'pointer',
                  fontFamily: "'Space Mono', monospace", fontSize: 9, color: '#a89e92', letterSpacing: 1, fontWeight: 400,
                  WebkitTapHighlightColor: 'transparent',
                }}>Mark read</button>
              </span>
            )}
          </div>
        </div>

        {digest.buckets.map((bucket, i) => <Bucket key={i} bucket={bucket} />)}

        <div style={{
          marginTop: 40, paddingTop: 16,
          borderTop: '1px solid #d8cfbc',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: '#a89e92', letterSpacing: 1.5, textTransform: 'uppercase' }}>
            {digest.createdAt
              ? 'Generated ' + new Date(digest.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
              : 'Generated 7:00 AM'}
          </span>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: '#a89e92', letterSpacing: 1.5, textTransform: 'uppercase' }}>
            {totalStories} stories · {unreadCount > 0 ? `${unreadCount} unread` : 'all read'}
          </span>
        </div>
      </div>
    </div>
  );
}
