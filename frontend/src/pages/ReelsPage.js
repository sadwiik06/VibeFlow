import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import ReelItem from '../components/ReelItem';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../apiConfig';

const ReelsPage = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const containerRef = useRef(null);
  const activeIndexRef = useRef(activeIndex);
  const isAutoScrolling = useRef(false);
  const scrollTimeoutRef = useRef(null);
  const token = localStorage.getItem('token');
  const { socket } = useChat();
  const { user } = useAuth();

  useEffect(() => {
      activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  /* Watch party */
  const query = new URLSearchParams(window.location.search);
  const watchSessionId = query.get('watchSession');
  const [inSession, setInSession] = useState(!!watchSessionId);
  const [syncStatus, setSyncStatus] = useState(watchSessionId ? 'Connecting…' : null);
  const [guestCount, setGuestCount] = useState(0);

  const fetchReels = useCallback(async (pageNum = 1) => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/reels?page=${pageNum}&limit=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = res.data.reels || res.data;
      pageNum === 1 ? setReels(data) : setReels(p => [...p, ...data]);
      setHasMore(res.data.hasMore ?? data.length === 10);
    } catch {}
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchReels(); }, [fetchReels]);

  // Real-time: listen for new reels from other users
  useEffect(() => {
    if (!socket || !user) return;
    const handleNewReel = (reel) => {
      // Skip own reels (already added locally if applicable)
      if (reel.user?._id === user._id) return;
      setReels(prev => [reel, ...prev]);
    };
    socket.on('new reel', handleNewReel);
    return () => socket.off('new reel', handleNewReel);
  }, [socket, user]);

  /* Intersection observer for active reel */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
          const idx = Number(entry.target.dataset.index);
          if (idx !== activeIndexRef.current) {
            setActiveIndex(idx);
            if (inSession && socket && !isAutoScrolling.current) {
              socket.emit('watch sync', {
                sessionId: watchSessionId || 'host',
                action: 'next',
                payload: { index: idx },
              });
            }
          }
          if (idx >= reels.length - 3 && hasMore) {
            const next = page + 1;
            setPage(next);
            fetchReels(next);
          }
        }
      }),
      { root: container, threshold: 0.6 }
    );
    container.querySelectorAll('.rp-item').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [reels, hasMore, page, inSession, socket, watchSessionId, fetchReels]);

  /* Watch party socket listeners */
  useEffect(() => {
    if (!socket) return;
    if (watchSessionId) {
      socket.emit('join watch session', { sessionId: watchSessionId }, (res) => {
        if (res.error) setSyncStatus(`Notice: ${res.error}`);
        else {
          setSyncStatus('Connected');
          if (res.currentReelIndex !== undefined)
            setTimeout(() => scrollToReel(res.currentReelIndex), 500);
        }
      });
    }
    const onSync = ({ action, payload }) => {
      if (action === 'next' || action === 'prev') scrollToReel(payload.index);
    };
    socket.on('watch sync', onSync);
    socket.on('watch guest joined', () => { setGuestCount(n => n + 1); setSyncStatus('Guest joined'); });
    socket.on('watch guest left',   () => { setGuestCount(n => Math.max(0, n - 1)); setSyncStatus('Guest left'); });
    return () => {
      if (watchSessionId) socket.emit('leave watch session', { sessionId: watchSessionId });
      socket.off('watch sync', onSync);
      socket.off('watch guest joined');
      socket.off('watch guest left');
    };
  }, [socket, watchSessionId]);

  const scrollToReel = useCallback((idx) => {
    setActiveIndex(idx);
    isAutoScrolling.current = true;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    
    const el = containerRef.current?.querySelector(`[data-index="${idx}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth' });

    scrollTimeoutRef.current = setTimeout(() => {
        isAutoScrolling.current = false;
    }, 1000);
  }, []);

  const handleStartParty = () => {
    if (!socket) return;
    socket.emit('create watch session', (res) => {
      const link = `${window.location.origin}/reels?watchSession=${res.sessionId}`;
      if (navigator.share) {
        navigator.share({ title: 'Watch reels together!', url: link }).catch(() => {});
      } else {
        navigator.clipboard.writeText(link);
      }
      window.history.pushState(null, '', `/reels?watchSession=${res.sessionId}`);
      setInSession(true);
      setSyncStatus('Waiting for guest…');
    });
  };

  const handleEndParty = () => {
    if (socket && watchSessionId)
      socket.emit('leave watch session', { sessionId: watchSessionId });
    window.history.pushState(null, '', '/reels');
    setInSession(false);
    setSyncStatus(null);
    setGuestCount(0);
  };

  const handleReelSync = useCallback((action, payload) => {
    if (!inSession || !socket) return;
    socket.emit('watch sync', { sessionId: watchSessionId || 'host', action, payload });
  }, [inSession, socket, watchSessionId]);

  /* Loading screen */
  if (loading) return (
    <div style={{
      height: '100%', background: '#FAFAFA',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: '16px',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        border: '2.5px solid rgba(0,0,0,0.1)',
        borderTopColor: '#6C63FF',
        animation: 'spin 0.75s linear infinite',
      }} />
      <span style={{ fontSize: '13px', color: 'rgba(0,0,0,0.35)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        Loading
      </span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  /* Empty screen */
  if (!reels.length) return (
    <div style={{
      height: '100%', background: '#FAFAFA',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: '14px', padding: '32px', textAlign: 'center',
    }}>
      <div style={{
        width: 60, height: 60, borderRadius: '16px',
        background: 'rgba(0,0,0,0.05)',
        border: '1px solid rgba(0,0,0,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="23 7 16 12 23 17 23 7"/>
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
        </svg>
      </div>
      <div style={{ fontSize: '16px', fontWeight: '700', color: 'rgba(0,0,0,0.65)', letterSpacing: '-0.02em' }}>No reels yet</div>
      <div style={{ fontSize: '13px', color: 'rgba(0,0,0,0.3)', lineHeight: 1.6 }}>Follow people to see their reels here</div>
    </div>
  );

  const canGoPrev = activeIndex > 0;
  const canGoNext = activeIndex < reels.length - 1;

  return (
    <>
      <style>{`
        /* ── Page shell ── */
        .rp-shell {
          height: 100dvh;
          max-height: 100vh;
          width: 100%;
          background: #FAFAFA;
          display: flex;
          align-items: stretch;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        /* ── Left sidebar ── */
        .rp-left {
          width: 200px; flex-shrink: 0;
          display: flex; flex-direction: column;
          align-items: flex-end; justify-content: center;
          padding-right: 28px; gap: 14px;
        }

        /* ── Video column ── */
        .rp-col {
          position: relative;
          height: 100%;
          width: 100%;
          max-width: 390px;
          flex-shrink: 0;
        }

        /* ── Right sidebar ── */
        .rp-right {
          width: 200px; flex-shrink: 0;
          display: flex; flex-direction: column;
          align-items: flex-start; justify-content: center;
          padding-left: 28px; gap: 16px;
        }

        /* ── Scroll container ── */
        .rp-scroller {
          height: 100%;
          width: 100%;
          overflow-y: scroll;
          scroll-snap-type: y mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .rp-scroller::-webkit-scrollbar { display: none; }

        /* ── Each reel cell ── */
        .rp-item {
          scroll-snap-align: start;
          height: 100%;
          width: 100%;
          position: relative;
          flex-shrink: 0;
        }

        /* ── Navigation arrows ── */
        .rp-nav {
          width: 52px; height: 52px; border-radius: 50%;
          background: rgba(0,0,0,0.07);
          border: 1px solid rgba(0,0,0,0.12);
          color: #000;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: background 0.18s, transform 0.15s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s;
          backdrop-filter: blur(8px);
          -webkit-tap-highlight-color: transparent;
        }
        .rp-nav:hover:not(:disabled) { background: rgba(0,0,0,0.16); transform: scale(1.08); }
        .rp-nav:active:not(:disabled) { transform: scale(0.94); }
        .rp-nav:disabled { opacity: 0.2; cursor: default; }

        /* ── Watch party button ── */
        .rp-party-btn {
          display: flex; align-items: center; gap: 10px;
          padding: 13px 20px; border-radius: 99px;
          background: #6C63FF; border: none; color: #fff;
          font-size: 14px; font-weight: 700; font-family: inherit;
          cursor: pointer; white-space: nowrap;
          transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1), opacity 0.15s;
          letter-spacing: -0.01em;
        }
        .rp-party-btn:hover { opacity: 0.88; transform: scale(1.04); }
        .rp-party-btn:active { transform: scale(0.96); }

        /* ── Watch session badge ── */
        .rp-session-badge {
          background: rgba(108,99,255,0.1);
          border: 1px solid rgba(108,99,255,0.45);
          border-radius: 14px;
          padding: 12px 16px;
          color: #000;
          display: flex; flex-direction: column; gap: 8px;
          min-width: 160px;
        }
        .rp-session-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #6C63FF;
          box-shadow: 0 0 0 0 rgba(108,99,255,0.4);
          animation: sessionPulse 2s ease-in-out infinite;
          flex-shrink: 0;
        }
        @keyframes sessionPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(108,99,255,0.5); }
          50%      { box-shadow: 0 0 0 6px rgba(108,99,255,0); }
        }
        .rp-end-btn {
          background: rgba(0,0,0,0.1); border: 1px solid rgba(0,0,0,0.15);
          border-radius: 8px; color: rgba(0,0,0,0.7);
          font-size: 12px; font-weight: 600; font-family: inherit;
          padding: 5px 10px; cursor: pointer;
          transition: background 0.15s;
        }
        .rp-end-btn:hover { background: rgba(0,0,0,0.18); }



        /* ── End-of-feed ── */
        .rp-end {
          height: 80px;
          display: flex; align-items: center; justify-content: center;
          color: rgba(0,0,0,0.18);
          font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase;
        }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .rp-left { display: none; }
          .rp-right { display: none; }
          .rp-col { max-width: 100%; }

          /* Watch party button floats top-right on mobile */
          .rp-mobile-party {
            position: absolute; top: 16px; right: 16px; z-index: 50;
          }
        }
        @media (min-width: 901px) {
          .rp-mobile-party { display: none; }
        }
        @media (max-width: 768px) {
          .rp-shell {
            height: calc(100dvh - 65px);
            max-height: calc(100vh - 65px);
          }
        }
      `}</style>

      <div className="rp-shell">

        {/* ── Left sidebar ── */}
        <div className="rp-left">
          <button
            className="rp-nav"
            disabled={!canGoPrev}
            onClick={() => scrollToReel(activeIndex - 1)}
            title="Previous reel"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15"/>
            </svg>
          </button>
          <button
            className="rp-nav"
            disabled={!canGoNext}
            onClick={() => scrollToReel(activeIndex + 1)}
            title="Next reel"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
        </div>

        {/* ── Reel scroller ── */}
        <div className="rp-col">
          <div className="rp-scroller" ref={containerRef}>
            {reels.map((reel, i) => (
              <div key={reel._id} className="rp-item" data-index={i}>
                <ReelItem
                  reel={reel}
                  isActive={i === activeIndex}
                  watchSessionId={watchSessionId}
                  onSyncAction={handleReelSync}
                />
              </div>
            ))}
            {!hasMore && <div className="rp-end">All caught up</div>}
          </div>
        </div>

        {/* ── Right sidebar ── */}
        <div className="rp-right">
          {inSession ? (
            <div className="rp-session-badge">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="rp-session-dot" />
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#000' }}>Watch Party</span>
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(0,0,0,0.55)' }}>
                {syncStatus || (guestCount > 0 ? `${guestCount} watching` : 'Waiting for guest…')}
              </div>
              {guestCount > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgba(0,0,0,0.5)' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  {guestCount} guest{guestCount > 1 ? 's' : ''}
                </div>
              )}
              <button className="rp-end-btn" onClick={handleEndParty}>End party</button>
            </div>
          ) : (
            <button className="rp-party-btn" onClick={handleStartParty}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              Watch Together
              <span style={{ marginLeft: '6px', background: '#ffd700', color: '#000', fontSize: '9px', fontWeight: '800', padding: '2px 5px', borderRadius: '4px', letterSpacing: '0.5px', verticalAlign: 'middle' }}>NEW</span>
            </button>
          )}
        </div>

        {/* ── Mobile: floating party button ── */}
        <div className="rp-mobile-party">
          {inSession ? (
            <div style={{
              background: 'rgba(108,99,255,0.85)',
              border: '1px solid rgba(108,99,255,0.6)',
              borderRadius: '99px', padding: '8px 14px',
              display: 'flex', alignItems: 'center', gap: '7px',
              backdropFilter: 'blur(8px)',
            }}>
              <div className="rp-session-dot" style={{ width: 6, height: 6 }} />
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#fff' }}>
                {guestCount > 0 ? `${guestCount} watching` : syncStatus || 'Watch Party'}
              </span>
              <button onClick={handleEndParty} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '16px', cursor: 'pointer', lineHeight: 1, padding: 0 }}>×</button>
            </div>
          ) : (
            <button className="rp-party-btn" onClick={handleStartParty} style={{ padding: '9px 16px', fontSize: '13px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              Watch Together
              <span style={{ marginLeft: '6px', background: '#ffd700', color: '#000', fontSize: '9px', fontWeight: '800', padding: '2px 5px', borderRadius: '4px', letterSpacing: '0.5px', verticalAlign: 'middle' }}>NEW</span>
            </button>
          )}
        </div>

      </div>
    </>
  );
};

/* ── Keyboard shortcuts ── */
const ReelsPageWithKeys = (props) => {
  const pageRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      const container = document.querySelector('.rp-scroller');
      if (!container) return;
      if (e.code === 'ArrowDown' || e.code === 'KeyJ') {
        e.preventDefault();
        const items = container.querySelectorAll('.rp-item');
        const idx = Math.min(
          Array.from(items).findIndex(el => el.getBoundingClientRect().top >= 0) + 1,
          items.length - 1
        );
        items[idx]?.scrollIntoView({ behavior: 'smooth' });
      }
      if (e.code === 'ArrowUp' || e.code === 'KeyK') {
        e.preventDefault();
        const items = container.querySelectorAll('.rp-item');
        const idx = Math.max(
          Array.from(items).findIndex(el => el.getBoundingClientRect().top >= -10) - 1,
          0
        );
        items[idx]?.scrollIntoView({ behavior: 'smooth' });
      }
      if (e.code === 'Space') {
        e.preventDefault();
        const activeVideo = container.querySelector('.rp-item[data-active="true"] video')
          || document.querySelector('.ri-video');
        if (activeVideo) activeVideo.click();
      }
      if (e.code === 'KeyM') {
        const activeVideo = document.querySelector('.ri-video');
        if (activeVideo) {
          const muteBtn = document.querySelector('.ri-mute');
          muteBtn?.click();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return <ReelsPage {...props} />;
};

export default ReelsPageWithKeys;