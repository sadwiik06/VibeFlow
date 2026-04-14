import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

/* ─────────────────────────────────────────
   Tiny reusable atoms
───────────────────────────────────────── */

/* Scramble text animation */
const ScrambleText = ({ text, trigger }) => {
    const [display, setDisplay] = useState(text);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
    const frame = useRef(null);

    useEffect(() => {
        if (!trigger) return;
        let iter = 0;
        const total = text.length * 3;
        clearInterval(frame.current);
        frame.current = setInterval(() => {
            setDisplay(
                text.split('').map((c, i) =>
                    i < iter / 3 ? c : chars[Math.floor(Math.random() * chars.length)]
                ).join('')
            );
            if (iter >= total) { setDisplay(text); clearInterval(frame.current); }
            iter++;
        }, 28);
        return () => clearInterval(frame.current);
    }, [trigger, text]);

    return <span>{display}</span>;
};

/* Floating tag pill */
const Tag = ({ children, color = '#6C63FF', bg }) => (
    <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '5px 12px', borderRadius: 99,
        background: bg || color + '15',
        color, fontSize: 12, fontWeight: 700,
        letterSpacing: 0.02, border: `1px solid ${color}28`,
        whiteSpace: 'nowrap',
    }}>{children}</span>
);


/* Phone frame */
const Phone = ({ children, style = {} }) => (
    <div style={{
        width: 200, height: 400, borderRadius: 34,
        background: '#0A0A0A', border: '5px solid #1C1C1C',
        outline: '1px solid #2E2E2E',
        overflow: 'hidden', position: 'relative', flexShrink: 0,
        ...style,
    }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 60, height: 20, background: '#0A0A0A', borderRadius: '0 0 14px 14px', zIndex: 10 }} />
        {children}
    </div>
);


/* Marquee strip */
const Marquee = ({ items }) => {
    const doubled = [...items, ...items];
    return (
        <div style={{ overflow: 'hidden', width: '100%' }}>
            <div style={{
                display: 'flex', gap: 10,
                animation: 'marquee 22s linear infinite',
                width: 'max-content',
            }}>
                {doubled.map((item, i) => (
                    <div key={i} style={{
                        padding: '8px 18px', borderRadius: 99,
                        background: '#fff', border: '1px solid #E4E4E2',
                        fontSize: 13, fontWeight: 600, color: '#5A5A5A',
                        whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                        {item.text}
                    </div>
                ))}
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────
   Feature card — interactive, fun
───────────────────────────────────────── */
const FeatureCard = ({ icon, title, desc, accent, tag, fun }) => {
    const [hov, setHov] = useState(false);
    const [scramble, setScramble] = useState(false);

    return (
        <div
            onMouseEnter={() => { setHov(true); setScramble(true); setTimeout(() => setScramble(false), 800); }}
            onMouseLeave={() => setHov(false)}
            style={{
                background: '#fff',
                border: `1px solid ${hov ? '#B8B8B6' : '#E4E4E2'}`,
                borderRadius: 22, padding: '26px 24px',
                transition: 'all 0.22s cubic-bezier(0.34,1.3,0.64,1)',
                transform: hov ? 'translateY(-4px) scale(1.01)' : 'none',
                cursor: 'default', position: 'relative', overflow: 'hidden',
            }}
        >
            {/* Accent bleed top-right */}
            <div style={{
                position: 'absolute', top: -20, right: -20,
                width: 80, height: 80, borderRadius: '50%',
                background: accent + '0D',
                transition: 'transform 0.3s ease',
                transform: hov ? 'scale(2.2)' : 'scale(1)',
                pointerEvents: 'none',
            }} />

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
                <div style={{
                    width: 46, height: 46, borderRadius: 13,
                    background: accent + '15',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
                    transform: hov ? 'rotate(-6deg) scale(1.12)' : 'none',
                }}>
                    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        {icon}
                    </svg>
                </div>
                {tag && <Tag color={accent}>{tag}</Tag>}
            </div>

            <div style={{ fontSize: 16, fontWeight: 800, color: '#0A0A0A', letterSpacing: '-0.02em', marginBottom: 7, fontFamily: 'inherit' }}>
                <ScrambleText text={title} trigger={scramble} />
            </div>
            <div style={{ fontSize: 14, color: '#7A7A7A', lineHeight: 1.65, marginBottom: fun ? 16 : 0 }}>{desc}</div>

            {fun && (
                <div style={{
                    marginTop: 4, padding: '10px 14px',
                    background: accent + '0C', borderRadius: 12,
                    border: `1px solid ${accent}20`,
                    fontSize: 13, color: accent, fontWeight: 600, lineHeight: 1.5,
                }}>
                    {fun}
                </div>
            )}
        </div>
    );
};

/* ─────────────────────────────────────────
   Main page
───────────────────────────────────────── */
const LandingPage = () => {
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const onScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const marqueeItems = [
        { text: 'Share reels', color: '#6C63FF' },
        { text: 'Join guilds', color: '#0EA5E9' },
        { text: 'Voice chat', color: '#10B981' },
        { text: 'Real-time DMs', color: '#F59E0B' },
        { text: 'Watch together', color: '#EC4899' },
        { text: 'Find your people', color: '#8B5CF6' },
        { text: 'Zero ads ever', color: '#0A0A0A' },
        { text: 'Post moments', color: '#EF4444' },
    ];

    const features = [
        {
            icon: <><path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z" /><path d="M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" /><path d="M9.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5S8 21.33 8 20.5v-5c0-.83.67-1.5 1.5-1.5z" /><path d="M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14z" /><path d="M14 14.5c0-.83.67-1.5 1.5-1.5h5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-5c-.83 0-1.5-.67-1.5-1.5z" /><path d="M15.5 19H14v1.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z" /><path d="M10 9.5C10 8.67 9.33 8 8.5 8h-5C2.67 8 2 8.67 2 9.5S2.67 11 3.5 11h5c.83 0 1.5-.67 1.5-1.5z" /><path d="M8.5 5H10V3.5C10 2.67 9.33 2 8.5 2S7 2.67 7 3.5 7.67 5 8.5 5z" /></>,
            title: 'Reels', accent: '#6C63FF', tag: 'Vertical video',
            desc: 'Short-form video that actually keeps you in the loop — not in a doom spiral.',
            fun: '✦ Double-tap to like · Swipe to scroll · Watch with friends',
        },
        {
            icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
            title: 'Guilds', accent: '#0EA5E9', tag: 'Communities',
            desc: 'Public or private groups built around the things you love — not the algorithm.',
            fun: '✦ Topic channels · Invite links · Member roles',
        },
        {
            icon: <><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></>,
            title: 'Voice Chat', accent: '#10B981', tag: 'Live audio',
            desc: 'Hop into a voice room with your guild. No scheduling, no links — just talk.',
            fun: '✦ Push-to-talk · Spatial audio · Raise hand queue',
        },
        {
            icon: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></>,
            title: 'Messaging', accent: '#F59E0B', tag: 'Real-time DMs',
            desc: 'DMs with voice notes, read receipts, and typing indicators that actually work.',
            fun: '✦ Voice notes',
        },
        {
            icon: <><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></>,
            title: 'Feed', accent: '#EC4899', tag: 'Chronological',
            desc: 'A curated feed of photos and moments from people you follow. No black box ranking.',
            fun: '✦ Chronological · Like · Comment · Save',
        },
        {
            icon: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>,
            title: 'Watch Together', accent: '#8B5CF6', tag: 'Sync',
            desc: 'Start a watch party, share the link, and scroll reels in real-time with anyone.',
            fun: '✦ Invite link · Live sync · React together',
        },
    ];

    return (
        <>
            <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }

        .lp {
          font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
          background: #F7F7F5;
          color: #0A0A0A;
          overflow-x: hidden;
        }

        /* ── Nav ── */
        .lp-nav {
          position: sticky; top: 0; z-index: 200;
          height: 60px;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 40px;
          background: rgba(247,247,245,0.9);
          backdrop-filter: saturate(180%) blur(14px);
          -webkit-backdrop-filter: saturate(180%) blur(14px);
          border-bottom: 1px solid transparent;
          transition: border-color 0.3s;
        }
        .lp-nav.up { border-bottom-color: #E8E8E6; }
        .lp-logo {
          display: flex; align-items: center; gap: 9px;
          font-size: 19px; font-weight: 900; color: #0A0A0A;
          letter-spacing: -0.04em; text-decoration: none;
          user-select: none;
        }
        .lp-logo-mark {
          width: 28px; height: 28px; border-radius: 8px;
          background: #0A0A0A;
          display: flex; align-items: center; justify-content: center;
        }
        .lp-logo-mark svg { width: 14px; height: 14px; }
        .lp-nav-r { display: flex; align-items: center; gap: 6px; }
        .lp-nav-link {
          padding: 7px 15px; border-radius: 99px;
          font-size: 13px; font-weight: 600; color: '#5A5A5A'; color: #5A5A5A;
          text-decoration: none; transition: all 0.14s;
          border: 1px solid transparent;
        }
        .lp-nav-link:hover { background: #EFEFED; color: #0A0A0A; }
        .lp-nav-cta {
          padding: 8px 18px; border-radius: 99px;
          font-size: 13px; font-weight: 700; color: #fff;
          text-decoration: none; background: #0A0A0A;
          border: 1px solid #0A0A0A;
          transition: all 0.14s; display: inline-flex; align-items: center; gap: 6px;
        }
        .lp-nav-cta:hover { background: #2A2A2A; }

        /* ── Hero ── */
        .lp-hero {
          padding: 96px 24px 56px;
          text-align: center;
          display: flex; flex-direction: column; align-items: center;
        }
        .lp-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 7px 16px; border-radius: 99px;
          background: #fff; border: 1px solid #E4E4E2;
          font-size: 12px; font-weight: 700; color: '#5A5A5A'; color: #5A5A5A;
          letter-spacing: 0.03em; margin-bottom: 32px;
          animation: riseIn 0.5s ease both;
        }
        .lp-badge-pulse {
          width: 7px; height: 7px; border-radius: 50%; background: #10B981;
          box-shadow: 0 0 0 0 rgba(16,185,129,0.5);
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); }
          50% { box-shadow: 0 0 0 7px rgba(16,185,129,0); }
        }

        .lp-h1 {
          font-size: clamp(46px, 7.5vw, 88px);
          font-weight: 900;
          letter-spacing: -0.045em;
          line-height: 0.98;
          color: #0A0A0A;
          max-width: 860px;
          margin-bottom: 26px;
          animation: riseIn 0.55s 0.07s ease both;
        }
        .lp-h1-line2 {
          display: block;
          background: linear-gradient(135deg, #6C63FF 0%, #EC4899 55%, #F59E0B 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .lp-sub {
          font-size: 18px; color: #7A7A7A; line-height: 1.7;
          max-width: 460px; margin: 0 auto 40px;
          animation: riseIn 0.55s 0.14s ease both;
          font-weight: 400;
        }
        .lp-hero-btns {
          display: flex; align-items: center; gap: 12px;
          flex-wrap: wrap; justify-content: center;
          animation: riseIn 0.55s 0.2s ease both;
        }
        .lp-btn-main {
          padding: 15px 30px; border-radius: 99px;
          font-size: 15px; font-weight: 800; color: #fff;
          text-decoration: none; background: #0A0A0A;
          border: 1.5px solid #0A0A0A;
          display: inline-flex; align-items: center; gap: 9px;
          transition: all 0.18s cubic-bezier(0.34,1.3,0.64,1);
          letter-spacing: -0.01em;
        }
        .lp-btn-main:hover { background: #1A1A1A; transform: translateY(-2px) scale(1.02); }
        .lp-btn-main:active { transform: scale(0.97); }
        .lp-btn-out {
          padding: 15px 30px; border-radius: 99px;
          font-size: 15px; font-weight: 700; color: '#0A0A0A'; color: #0A0A0A;
          text-decoration: none; background: #fff;
          border: 1.5px solid #E0E0DE;
          display: inline-flex; align-items: center; gap: 9px;
          transition: all 0.18s cubic-bezier(0.34,1.3,0.64,1);
          letter-spacing: -0.01em;
        }
        .lp-btn-out:hover { border-color: #B0B0AE; transform: translateY(-2px); }

        /* ── Phone trio ── */
        .lp-phones {
          display: flex; align-items: flex-end; justify-content: center;
          gap: 14px; margin-top: 72px;
          animation: riseIn 0.7s 0.28s ease both;
        }
        .lp-phone-dim { opacity: 0.5; transform: scale(0.86) translateY(28px); }

        /* ── Marquee ── */
        .lp-marquee-wrap {
          padding: 28px 0;
          border-top: 1px solid #E8E8E6;
          border-bottom: 1px solid #E8E8E6;
          background: #F7F7F5;
          overflow: hidden;
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        /* ── Sections ── */
        .lp-section {
          max-width: 1080px; margin: 0 auto;
          padding: 80px 24px;
        }
        .lp-eyebrow {
          font-size: 11px; font-weight: 800; color: '#9A9A9A'; color: #9A9A9A;
          letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 14px;
        }
        .lp-title {
          font-size: clamp(28px, 4vw, 46px);
          font-weight: 900; letter-spacing: -0.035em; color: '#0A0A0A'; color: #0A0A0A;
          line-height: 1.08; margin-bottom: 14px;
        }
        .lp-body { font-size: 16px; color: '#7A7A7A'; color: #7A7A7A; line-height: 1.7; max-width: 420px; }

        /* ── Features grid ── */
        .lp-feat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
          gap: 12px;
          margin-top: 52px;
        }

        /* ── Bento ── */
        .lp-bento {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          grid-auto-rows: minmax(0, auto);
          gap: 12px;
          margin-top: 52px;
        }
        .lp-b1 { grid-column: span 7; }
        .lp-b2 { grid-column: span 5; }
        .lp-b3 { grid-column: span 4; }
        .lp-b4 { grid-column: span 4; }
        .lp-b5 { grid-column: span 4; }
        .lp-b6 { grid-column: span 6; }
        .lp-b7 { grid-column: span 6; }

        /* ── How it works ── */
        .lp-steps {
          margin-top: 52px;
          display: grid; grid-template-columns: repeat(3,1fr);
          gap: 2px; background: #E0E0DE;
          border-radius: 24px; overflow: hidden;
        }
        .lp-step {
          background: #fff; padding: 36px 30px;
          position: relative;
        }
        .lp-step-n {
          font-size: 11px; font-weight: 800; color: '#6C63FF'; color: #6C63FF;
          letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 22px;
        }
        .lp-step-t {
          font-size: 19px; font-weight: 900;
          letter-spacing: -0.025em; color: '#0A0A0A'; color: #0A0A0A;
          margin-bottom: 10px; line-height: 1.2;
        }
        .lp-step-d { font-size: 14px; color: '#7A7A7A'; color: #7A7A7A; line-height: 1.65; }

        /* ── CTA ── */
        .lp-cta {
          max-width: 1080px; margin: 0 24px 80px;
          border-radius: 28px; overflow: hidden; position: relative;
          background: #0A0A0A;
          padding: 90px 48px;
          text-align: center;
        }
        @media (min-width: 1128px) { .lp-cta { margin: 0 auto 80px; } }
        .lp-cta-dots {
          position: absolute; inset: 0; opacity: 0.055;
          background-image: radial-gradient(circle, #fff 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
        }
        .lp-cta-ring {
          position: absolute; top: -120px; right: -120px;
          width: 400px; height: 400px; border-radius: 50%;
          border: 1px solid rgba(108,99,255,0.25);
          pointer-events: none;
        }
        .lp-cta-ring2 {
          position: absolute; bottom: -80px; left: -80px;
          width: 280px; height: 280px; border-radius: 50%;
          border: 1px solid rgba(236,72,153,0.2);
          pointer-events: none;
        }
        .lp-cta h2 {
          font-size: clamp(30px, 5vw, 58px);
          font-weight: 900; color: '#fff'; color: #fff;
          letter-spacing: -0.04em; line-height: 1.06;
          margin-bottom: 18px; position: relative;
        }
        .lp-cta p {
          font-size: 17px; color: rgba(255,255,255,0.45);
          line-height: 1.7; margin-bottom: 40px; position: relative;
          max-width: 380px; margin-left: auto; margin-right: auto;
        }
        .lp-cta-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; position: relative; }
        .lp-cta-a {
          padding: 15px 30px; border-radius: 99px;
          background: '#fff'; background: #fff; color: '#0A0A0A'; color: #0A0A0A;
          font-size: 15px; font-weight: 800;
          text-decoration: none; letter-spacing: -0.01em;
          display: inline-flex; align-items: center; gap: 8px;
          transition: all 0.15s;
        }
        .lp-cta-a:hover { background: '#F0F0EE'; background: #F0F0EE; }
        .lp-cta-b {
          padding: 15px 30px; border-radius: 99px;
          background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.75);
          font-size: 15px; font-weight: 700;
          text-decoration: none; letter-spacing: -0.01em;
          display: inline-flex; align-items: center;
          border: 1px solid rgba(255,255,255,0.15);
          transition: all 0.15s;
        }
        .lp-cta-b:hover { background: rgba(255,255,255,0.15); color: '#fff'; color: #fff; }

        /* ── Footer ── */
        .lp-foot {
          padding: 36px 40px;
          border-top: 1px solid #E8E8E6;
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 14px;
        }
        .lp-foot-links { display: flex; gap: 20px; }
        .lp-foot-link { font-size: 13px; color: '#B0B0AE'; color: #B0B0AE; text-decoration: none; transition: color 0.13s; }
        .lp-foot-link:hover { color: '#0A0A0A'; color: #0A0A0A; }

        /* ── Animations ── */
        @keyframes riseIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatY {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-10px); }
        }
        @keyframes spinDisc {
          to { transform: rotate(360deg); }
        }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .lp-nav { padding: 0 20px; }
          .lp-nav-link { display: none; }
          .lp-b1,.lp-b2,.lp-b3,.lp-b4,.lp-b5,.lp-b6,.lp-b7 { grid-column: span 12; }
          .lp-steps { grid-template-columns: 1fr; }
          .lp-phone-dim { display: none; }
          .lp-cta { padding: 60px 28px; margin: 0 16px 60px; }
          .lp-foot { flex-direction: column; align-items: flex-start; padding: 32px 20px; }
        }
        @media (max-width: 580px) {
          .lp-feat-grid { grid-template-columns: 1fr; }
        }
      `}</style>

            <div className="lp">

             
                <nav className={`lp-nav ${scrollY > 20 ? 'up' : ''}`}>
                    <a href="/" className="lp-logo">
                        <div className="lp-logo-mark">
                            <svg viewBox="0 0 14 14" fill="none">
                                <path d="M7 1L12.5 4.5V10.5L7 14L1.5 10.5V4.5L7 1Z" fill="white" />
                            </svg>
                        </div>
                        VibeFlow
                    </a>
                    <div className="lp-nav-r">
                        <a href="#features" className="lp-nav-link">Features</a>
                        <a href="#how" className="lp-nav-link">How it works</a>
                        <Link to="/login" className="lp-nav-link">Sign in</Link>
                        <Link to="/register" className="lp-nav-cta">
                            Get started
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                        </Link>
                    </div>
                </nav>


                <section className="lp-hero">
                    <div className="lp-badge">
                        <div className="lp-badge-pulse" />
                        Join free today
                    </div>

                    <h1 className="lp-h1">
                        Social media,<br />
                        <span className="lp-h1-line2">but make it human</span>
                    </h1>

                    <p className="lp-sub">
                        VibeFlow is where your people are. Share, watch, talk — without the ads, the anxiety, or the algorithm.
                    </p>

                    <div className="lp-hero-btns">
                        <Link to="/register" className="lp-btn-main">
                            Start for free
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                        </Link>
                        <Link to="/login" className="lp-btn-out">Sign in</Link>
                    </div>

                  
                    <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', animation: 'riseIn 0.55s 0.28s ease both' }}>
                        <div style={{ display: 'flex' }}>
                            {['#6C63FF', '#EC4899', '#10B981', '#F59E0B'].map((c, i) => (
                                <div key={i} style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: '2px solid #F7F7F5', marginLeft: i > 0 ? -9 : 0 }} />
                            ))}
                        </div>
                        <span style={{ fontSize: 13, color: '#9A9A9A', fontWeight: 500 }}>
                            Creators, readers, builders — all here
                        </span>
                    </div>

                  
                    <div className="lp-phones">
                        
                        <div className="lp-phone-dim">
                            <Phone>
                                <div style={{ height: '100%', background: '#F7F7F5', paddingTop: 26, paddingLeft: 10, paddingRight: 10, paddingBottom: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <div style={{ fontSize: 8, fontWeight: 800, color: '#9A9A9A', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Feed</div>
                                    {[0, 1].map(i => (
                                        <div key={i} style={{ background: '#fff', borderRadius: 12, border: '1px solid #E4E4E2', overflow: 'hidden' }}>
                                            <div style={{ height: 90, background: ['linear-gradient(135deg,#EEE0FF,#C7D2FE)', 'linear-gradient(135deg,#D1FAE5,#BAE6FD)'][i] }} />
                                            <div style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <div style={{ width: 20, height: 20, borderRadius: '50%', background: ['#6C63FF', '#10B981'][i], flexShrink: 0 }} />
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ height: 6, width: '55%', background: '#F2F2F0', borderRadius: 3, marginBottom: 4 }} />
                                                    <div style={{ height: 5, width: '35%', background: '#F2F2F0', borderRadius: 3 }} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Phone>
                        </div>

                       
                        <div style={{ animation: 'floatY 4s ease-in-out infinite' }}>
                            <Phone style={{ width: 210, height: 430, borderRadius: 36, border: '6px solid #1C1C1C' }}>
                                {/* Reel background */}
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(175deg,#18103A 0%,#0B1C28 55%,#0C1C0F 100%)' }} />
                                {/* Floating blobs */}
                                <div style={{ position: 'absolute', top: 40, left: 20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(108,99,255,0.2)', filter: 'blur(28px)' }} />
                                <div style={{ position: 'absolute', bottom: 80, right: 10, width: 90, height: 90, borderRadius: '50%', background: 'rgba(236,72,153,0.18)', filter: 'blur(22px)' }} />
                                {/* Gradient overlay */}
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 45%)' }} />
                                {/* Progress */}
                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.15)' }}>
                                    <div style={{ width: '42%', height: '100%', background: '#fff', borderRadius: '0 2px 2px 0' }} />
                                </div>
                                {/* User info */}
                                <div style={{ position: 'absolute', bottom: 26, left: 12, right: 52 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#6C63FF,#EC4899)', border: '2px solid rgba(255,255,255,0.8)', flexShrink: 0 }} />
                                        <div>
                                            <div style={{ height: 8, width: 68, background: 'rgba(255,255,255,0.85)', borderRadius: 4, marginBottom: 4 }} />
                                            <div style={{ height: 6, width: 48, background: 'rgba(255,255,255,0.35)', borderRadius: 3 }} />
                                        </div>
                                    </div>
                                    <div style={{ height: 6, width: '88%', background: 'rgba(255,255,255,0.45)', borderRadius: 3, marginBottom: 5 }} />
                                    <div style={{ height: 6, width: '65%', background: 'rgba(255,255,255,0.3)', borderRadius: 3 }} />
                                </div>
                                {/* Action buttons */}
                                <div style={{ position: 'absolute', bottom: 30, right: 10, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
                                    {[
                                        { bg: 'rgba(237,73,86,0.3)', inner: '#ed4956' },
                                        { bg: 'rgba(255,255,255,0.12)', inner: 'rgba(255,255,255,0.7)' },
                                        { bg: 'rgba(255,255,255,0.12)', inner: 'rgba(255,255,255,0.7)' },
                                    ].map((b, i) => (
                                        <div key={i} style={{ width: 38, height: 38, borderRadius: '50%', background: b.bg, border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <div style={{ width: 16, height: 16, borderRadius: i === 0 ? '50%' : 3, background: b.inner }} />
                                        </div>
                                    ))}
                                    {/* Spinning disc */}
                                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#111', border: '2px solid rgba(255,255,255,0.5)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'spinDisc 3s linear infinite' }}>
                                        <div style={{ width: '65%', height: '65%', borderRadius: '50%', background: 'linear-gradient(135deg,#6C63FF,#EC4899)' }} />
                                    </div>
                                </div>
                                
                                <div style={{ position: 'absolute', top: 28, right: 14, width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ width: 12, height: 12, borderRadius: 2, background: 'rgba(255,255,255,0.6)' }} />
                                </div>
                            </Phone>
                        </div>

                      
                        <div className="lp-phone-dim">
                            <Phone>
                                <div style={{ height: '100%', background: '#fff', paddingTop: 26, paddingLeft: 10, paddingRight: 10, paddingBottom: 10 }}>
                                    <div style={{ fontSize: 8, fontWeight: 800, color: '#9A9A9A', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>Guilds</div>
                                    {[
                                        { bg: '#EEE0FF', c: '#7C3AED' },
                                        { bg: '#DBEAFE', c: '#2563EB' },
                                        { bg: '#D1FAE5', c: '#059669' },
                                    ].map((g, i) => (
                                        <div key={i} style={{ background: '#fff', border: '1px solid #E4E4E2', borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>
                                            <div style={{ height: 48, background: g.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <div style={{ width: 22, height: 22, borderRadius: 6, background: g.c + '30', border: `1px solid ${g.c}40` }} />
                                            </div>
                                            <div style={{ padding: '6px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <div style={{ height: 6, width: 50, background: '#F2F2F0', borderRadius: 3, marginBottom: 4 }} />
                                                    <div style={{ height: 5, width: 32, background: '#F2F2F0', borderRadius: 3 }} />
                                                </div>
                                                <div style={{ padding: '2px 6px', background: g.bg, borderRadius: 99, fontSize: 7, fontWeight: 700, color: g.c }}>JOIN</div>
                                            </div>
                                        </div>
                                    ))}
                                    {/* Voice chat pill */}
                                    <div style={{ marginTop: 6, padding: '8px 10px', background: '#DCFCE7', borderRadius: 10, border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <div style={{ width: 8, height: 8, borderRadius: 2, background: '#fff' }} />
                                        </div>
                                        <div>
                                            <div style={{ height: 5, width: 40, background: '#6EE7B7', borderRadius: 3, marginBottom: 3 }} />
                                            <div style={{ height: 4, width: 28, background: '#A7F3D0', borderRadius: 3 }} />
                                        </div>
                                        <div style={{ marginLeft: 'auto', display: 'flex', gap: 2 }}>
                                            {[0, 1, 2].map(i => (
                                                <div key={i} style={{ width: 2, borderRadius: 99, background: '#10B981', height: [8, 12, 6][i], alignSelf: 'center' }} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Phone>
                        </div>
                    </div>
                </section>

                
                <div className="lp-marquee-wrap">
                    <Marquee items={marqueeItems} />
                </div>

                
                <section className="lp-section" id="features">
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
                        <div>
                            <div className="lp-eyebrow">What's inside</div>
                            <h2 className="lp-title">Everything you<br />actually want</h2>
                        </div>
                        <p className="lp-body" style={{ maxWidth: 320, paddingBottom: 6 }}>
                            We built the features people ask for — and skipped everything else.
                        </p>
                    </div>
                    <div className="lp-feat-grid">
                        {features.map(f => <FeatureCard key={f.title} {...f} />)}
                    </div>
                </section>

          
                <section style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px 80px' }}>
                    <div className="lp-bento">

                     
                        <div className="lp-b1" style={{ background: '#0A0A0A', borderRadius: 22, padding: '32px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 220 }}>
                            <div>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 99, background: 'rgba(108,99,255,0.2)', border: '1px solid rgba(108,99,255,0.35)', marginBottom: 18 }}>
                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6C63FF', boxShadow: '0 0 0 3px rgba(108,99,255,0.3)' }} />
                                    <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Live now</span>
                                </div>
                                <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: '-0.035em', lineHeight: 1.15, maxWidth: 320 }}>
                                    Watch reels together, react at the same time
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 28 }}>
                                <div style={{ display: 'flex' }}>
                                    {['#6C63FF', '#EC4899', '#10B981', '#F59E0B'].map((c, i) => (
                                        <div key={i} style={{ width: 30, height: 30, borderRadius: '50%', background: c, border: '2px solid #0A0A0A', marginLeft: i > 0 ? -9 : 0 }} />
                                    ))}
                                </div>
                                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>Start a watch party with one link</span>
                            </div>
                        </div>

                      
                        <div className="lp-b2" style={{ background: '#10B981', borderRadius: 22, padding: '32px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 220, overflow: 'hidden', position: 'relative' }}>
                          
                            <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 3, alignItems: 'flex-end', height: 50, opacity: 0.25 }}>
                                {[12, 22, 36, 48, 30, 18, 40, 28, 16, 34, 20].map((h, i) => (
                                    <div key={i} style={{ width: 4, borderRadius: 99, background: '#fff', height: h }} />
                                ))}
                            </div>
                            <div>
                                <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Voice chat</div>
                                <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
                                    Just talk.<br />No links needed.
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 20, position: 'relative' }}>
                                <Tag color="#fff" bg="rgba(255,255,255,0.2)">Push to talk</Tag>
                                <Tag color="#fff" bg="rgba(255,255,255,0.2)">Guild rooms</Tag>
                            </div>
                        </div>

                        <div className="lp-b3" style={{ background: '#fff', border: '1px solid #E4E4E2', borderRadius: 22, padding: '28px', overflow: 'hidden' }}>
                            <div style={{ fontSize: 11, fontWeight: 800, color: '#9A9A9A', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>Guilds</div>
                            <div style={{ fontSize: 17, fontWeight: 900, color: '#0A0A0A', letterSpacing: '-0.025em', lineHeight: 1.3, marginBottom: 16 }}>
                                Communities around what you love
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                                {[
                                    { t: 'Photography', c: '#7C3AED' },
                                    { t: 'Music', c: '#DB2777' },
                                    { t: 'Gaming', c: '#2563EB' },
                                    { t: 'Travel', c: '#059669' },
                                    { t: 'Food', c: '#D97706' },
                                    { t: 'Dev', c: '#0A0A0A' },
                                ].map(({ t, c }) => (
                                    <span key={t} style={{ padding: '4px 11px', borderRadius: 99, fontSize: 12, fontWeight: 700, background: c + '12', color: c, border: `1px solid ${c}22` }}>{t}</span>
                                ))}
                            </div>
                        </div>

                        <div className="lp-b4" style={{ background: '#F7F7F5', border: '1px solid #E4E4E2', borderRadius: 22, padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div style={{ width: 40, height: 40, borderRadius: 11, background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                            </div>
                            <div>
                                <div style={{ fontSize: 17, fontWeight: 900, color: '#0A0A0A', letterSpacing: '-0.02em', lineHeight: 1.3, marginBottom: 8 }}>Your data. Your rules.</div>
                                <div style={{ fontSize: 13, color: '#7A7A7A', lineHeight: 1.65 }}>No ads, no trackers, no third-party data selling. Ever.</div>
                            </div>
                        </div>

                        <div className="lp-b5" style={{ background: '#6C63FF', borderRadius: 22, padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden', position: 'relative' }}>
                            <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
                            <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Feed</div>
                            <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
                                Chronological. No black-box ranking.
                            </div>
                            <div style={{ marginTop: 18, display: 'flex', gap: 2 }}>
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i < 3 ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.2)' }} />
                                ))}
                            </div>
                        </div>

                        
                        <div className="lp-b6" style={{ background: '#fff', border: '1px solid #E4E4E2', borderRadius: 22, padding: '28px', overflow: 'hidden' }}>
                            <div style={{ fontSize: 11, fontWeight: 800, color: '#9A9A9A', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>Messaging</div>
                         
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {[
                                    { own: false, text: 'Hey! Did you see that reel?', w: '72%' },
                                    { own: true, text: 'Omg yes 😭 sending you the link', w: '78%' },
                                    { own: false, text: 'Voice note incoming...', w: '55%', voice: true },
                                ].map((m, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: m.own ? 'flex-end' : 'flex-start' }}>
                                        <div style={{
                                            padding: m.voice ? '10px 14px' : '10px 14px',
                                            borderRadius: m.own ? '18px 18px 5px 18px' : '18px 18px 18px 5px',
                                            background: m.own ? '#0A0A0A' : '#F2F2F0',
                                            maxWidth: m.w, fontSize: 13, fontWeight: 500,
                                            color: m.own ? '#fff' : '#0A0A0A',
                                            display: 'flex', alignItems: 'center', gap: 8,
                                        }}>
                                            {m.voice
                                                ? <><div style={{ width: 28, height: 28, borderRadius: '50%', background: '#F59E0B20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /></svg>
                                                </div>
                                                    <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                                        {[4, 8, 12, 6, 10, 8, 4].map((h, i) => <div key={i} style={{ width: 2, height: h, background: '#F59E0B', borderRadius: 99 }} />)}
                                                    </div>
                                                    <span style={{ fontSize: 11, color: '#9A9A9A' }}>0:08</span>
                                                </>
                                                : m.text
                                            }
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                       
                        <div className="lp-b7" style={{ background: '#F7F7F5', border: '1px solid #E4E4E2', borderRadius: 22, padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div style={{ fontSize: 22, fontWeight: 900, color: '#0A0A0A', letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: 16 }}>
                                Your feed is empty.<br />
                                <span style={{ color: '#C0C0BE' }}>It's waiting for you.</span>
                            </div>
                            <Link to="/register" style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                padding: '12px 22px', borderRadius: 99,
                                background: '#0A0A0A', color: '#fff',
                                fontSize: 14, fontWeight: 800, textDecoration: 'none',
                                letterSpacing: '-0.01em', alignSelf: 'flex-start',
                                transition: 'all 0.15s',
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = '#2A2A2A'}
                                onMouseLeave={e => e.currentTarget.style.background = '#0A0A0A'}
                            >
                                Create account
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                            </Link>
                        </div>

                    </div>
                </section>

            
                <section className="lp-section" style={{ paddingTop: 20 }} id="how">
                    <div className="lp-eyebrow">How it works</div>
                    <h2 className="lp-title">Three steps.<br />That's really it.</h2>
                    <div className="lp-steps">
                        {[
                            { n: '01', t: 'Create your account', d: 'Sign up in 30 seconds. No credit card, no forms, no nonsense. Just pick a username and you\'re in.', icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></> },
                            { n: '02', t: 'Find your people', d: 'Follow friends, browse guilds, or let suggestions point the way. Your feed fills up fast.', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></> },
                            { n: '03', t: 'Share, watch & talk', d: 'Post reels, join a voice room, slide into DMs. Everything works together — no separate apps.', icon: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></> },
                        ].map(s => (
                            <div key={s.n} className="lp-step">
                                <div className="lp-step-n">{s.n}</div>
                                <div style={{ width: 42, height: 42, borderRadius: 12, background: '#F7F7F5', border: '1px solid #E4E4E2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6C63FF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">{s.icon}</svg>
                                </div>
                                <div className="lp-step-t">{s.t}</div>
                                <div className="lp-step-d">{s.d}</div>
                            </div>
                        ))}
                    </div>
                </section>

                
                <div className="lp-cta">
                    <div className="lp-cta-dots" />
                    <div className="lp-cta-ring" />
                    <div className="lp-cta-ring2" />
                    <h2>Ready to find<br />your people?</h2>
                    <p>No algorithm. No ads. Just VibeFlow.<br />Free, forever.</p>
                    <div className="lp-cta-btns">
                        <Link to="/register" className="lp-cta-a">
                            Create free account
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                        </Link>
                        <Link to="/login" className="lp-cta-b">Sign in instead</Link>
                    </div>
                </div>

                {/* ──────────── FOOTER ──────────── */}
                <footer className="lp-foot">
                    <a href="/" className="lp-logo" style={{ fontSize: 16 }}>
                        <div className="lp-logo-mark" style={{ width: 24, height: 24, borderRadius: 6 }}>
                            <svg viewBox="0 0 14 14" fill="none" style={{ width: 11, height: 11 }}>
                                <path d="M7 1L12.5 4.5V10.5L7 14L1.5 10.5V4.5L7 1Z" fill="white" />
                            </svg>
                        </div>
                        VibeFlow
                    </a>
                    
                    <span style={{ fontSize: 13, color: '#C0C0BE' }}>© 2026 VibeFlow</span>
                </footer>

            </div>
        </>
    );
};

export default LandingPage;