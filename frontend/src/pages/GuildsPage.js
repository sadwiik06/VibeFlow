import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../apiConfig';

const ACCENT_PALETTES = [
  { bg: '#EEE0FF', text: '#6B21A8' },
  { bg: '#DBEAFE', text: '#1D4ED8' },
  { bg: '#D1FAE5', text: '#065F46' },
  { bg: '#FEE2E2', text: '#991B1B' },
  { bg: '#FEF3C7', text: '#92400E' },
  { bg: '#FCE7F3', text: '#9D174D' },
];

const GuildCard = ({ guild }) => {
  const palette = ACCENT_PALETTES[guild.name.charCodeAt(0) % ACCENT_PALETTES.length];
  const [hover, setHover] = useState(false);
  return (
    <Link to={`/guilds/${guild._id}`} style={{ textDecoration: 'none', display: 'flex' }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div style={{
        background: '#fff', border: `1px solid ${hover ? '#B0B0AE' : '#E4E4E2'}`,
        borderRadius: '16px', overflow: 'hidden', width: '100%',
        transition: 'all 0.18s ease', transform: hover ? 'translateY(-2px)' : 'none',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ height: '84px', background: palette.bg, position: 'relative', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {guild.coverImage
            ? <img src={guild.coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
            : <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(255,255,255,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🛡️</div>
          }
          <div style={{ position: 'absolute', top: 8, right: 8, padding: '2px 7px', borderRadius: '99px', fontSize: '10px', fontWeight: '700', background: guild.type === 'public' ? '#D1FAE5' : '#FEE2E2', color: guild.type === 'public' ? '#065F46' : '#991B1B' }}>
            {guild.type.toUpperCase()}
          </div>
        </div>
        <div style={{ padding: '14px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#0A0A0A', marginBottom: '5px', letterSpacing: '-0.01em' }}>{guild.name}</div>
          <div style={{ fontSize: '12px', color: '#9A9A9A', lineHeight: '1.5', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '12px' }}>
            {guild.description || 'No description provided'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#9A9A9A' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              {guild.memberCount || guild.members?.length || 0}
            </span>
            {guild.topic && <span style={{ padding: '2px 8px', borderRadius: '99px', fontSize: '11px', background: palette.bg, color: palette.text, fontWeight: '500' }}>{guild.topic}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
};

const GuildsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [guilds, setGuilds] = useState([]);
  const [myGuilds, setMyGuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('public');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', topic: '', type: 'public' });
  const token = localStorage.getItem('token');

  useEffect(() => { fetchGuilds(); fetchMyGuilds(); }, []);

  const fetchGuilds = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/guilds`, { headers: { Authorization: `Bearer ${token}` } });
      setGuilds(res.data);
    } catch (err) { } finally { setLoading(false); }
  };

  const fetchMyGuilds = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/guilds/my`, { headers: { Authorization: `Bearer ${token}` } });
      setMyGuilds(res.data);
    } catch (err) { }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/guilds`, form, { headers: { Authorization: `Bearer ${token}` } });
      navigate(`/guilds/${res.data._id}`);
    } catch (err) { alert(err.response?.data?.message || 'Failed'); } finally { setCreating(false); }
  };

  const filtered = guilds.filter(g => {
    const q = search.toLowerCase();
    const match = g.name.toLowerCase().includes(q) || g.description?.toLowerCase().includes(q) || g.topic?.toLowerCase().includes(q);
    if (activeFilter === 'public') return match && g.type === 'public';
    if (activeFilter === 'private') return match && g.type === 'private';
    return match;
  });

  const topics = [...new Set(guilds.map(g => g.topic).filter(Boolean))].slice(0, 5);

  const inputStyle = { width: '100%', boxSizing: 'border-box', padding: '10px 14px', border: '1px solid #E4E4E2', borderRadius: '10px', fontSize: '14px', color: '#0A0A0A', fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.15s', background: '#fff' };

  return (
    <>
      <style>{`
        .gp { background: #F7F7F5; min-height: calc(100vh - 60px); }
        .gp-inner { max-width: 1020px; margin: 0 auto; padding: 28px 20px 80px; }
        .gp-bento { display: grid; grid-template-columns: 1fr 1fr 160px; gap: 12px; margin-bottom: 28px; }
        .gp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 12px; }
        .gp-my { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none; }
        .gp-my::-webkit-scrollbar { display: none; }
        .gp-chip { padding: 6px 14px; border-radius: 99px; border: 1px solid #E4E4E2; background: #fff; font-size: 12px; font-weight: 500; color: #9A9A9A; cursor: pointer; font-family: inherit; transition: all 0.12s; }
        .gp-chip:hover { border-color: #0A0A0A; color: #0A0A0A; }
        .gp-chip.on { background: #0A0A0A; border-color: #0A0A0A; color: #fff; }
        .gp-chip.ac { background: #6C63FF; border-color: #6C63FF; color: #fff; }
        .gp-modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .gp-modal { background: #fff; border-radius: 20px; width: 100%; max-width: 460px; padding: 28px; position: relative; animation: fadeUp 0.2s ease; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
        @media(max-width:680px) { .gp-bento { grid-template-columns: 1fr 1fr; } }
        @media(max-width:480px) { .gp-bento { grid-template-columns: 1fr; } .gp-inner { padding: 16px 12px 80px; } }
      `}</style>

      <div className="gp">
        <div className="gp-inner">

          {/* Bento hero */}
          <div className="gp-bento">
            <div style={{ background: '#0A0A0A', borderRadius: '16px', padding: '26px 28px', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '150px', gridColumn: '1' }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: '8px' }}>VibeFlow Guilds</div>
                <div style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.03em', lineHeight: 1.15 }}>Find your<br />community</div>
              </div>
              <button onClick={() => setShowCreate(true)} style={{ alignSelf: 'flex-start', marginTop: '18px', padding: '9px 18px', background: '#fff', color: '#0A0A0A', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.01em' }}>
                + New Guild
              </button>
            </div>

            <div style={{ background: '#fff', border: '1px solid #E4E4E2', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#9A9A9A', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Discover</div>
              <div>
                <div style={{ fontSize: '34px', fontWeight: '800', color: '#0A0A0A', letterSpacing: '-0.04em', lineHeight: 1 }}>{guilds.length}</div>
                <div style={{ fontSize: '12px', color: '#9A9A9A', marginTop: '4px' }}>Total guilds</div>
              </div>
            </div>

            <div style={{ background: '#6C63FF', border: 'none', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Joined</div>
              <div>
                <div style={{ fontSize: '34px', fontWeight: '800', color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>{myGuilds.length}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>Your guilds</div>
              </div>
            </div>
          </div>

          {/* My Guilds strip */}
          {myGuilds.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#9A9A9A', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px' }}>Your guilds</div>
              <div className="gp-my">
                {myGuilds.map(guild => {
                  const p = ACCENT_PALETTES[guild.name.charCodeAt(0) % ACCENT_PALETTES.length];
                  return (
                    <Link key={guild._id} to={`/guilds/${guild._id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
                      <div style={{ background: '#fff', border: '1px solid #E4E4E2', borderRadius: '12px', padding: '9px 14px', display: 'flex', alignItems: 'center', gap: '9px', transition: 'border-color 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = '#6C63FF'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = '#E4E4E2'}
                      >
                        <div style={{ width: 28, height: 28, borderRadius: '7px', background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>🛡️</div>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#0A0A0A', whiteSpace: 'nowrap' }}>{guild.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Filters */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '20px' }}>
            <input
              style={{ flex: 1, minWidth: '160px', maxWidth: '280px', padding: '8px 14px', border: '1px solid #E4E4E2', borderRadius: '99px', fontSize: '13px', color: '#0A0A0A', background: '#fff', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.15s' }}
              placeholder="Search guilds…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={e => e.target.style.borderColor = '#6C63FF'}
              onBlur={e => e.target.style.borderColor = '#E4E4E2'}
            />
            {['public', 'private'].map(f => (
              <button key={f} className={`gp-chip ${activeFilter === f ? 'on' : ''}`} onClick={() => setActiveFilter(f)}>
                {f === 'public' ? 'Public' : 'Private'}
              </button>
            ))}
            {topics.map(t => (
              <button key={t} className={`gp-chip ${search === t ? 'ac' : ''}`} onClick={() => setSearch(search === t ? '' : t)}>{t}</button>
            ))}
          </div>

          <div style={{ fontSize: '10px', fontWeight: '700', color: '#9A9A9A', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '14px' }}>
            Discover · {filtered.length} guilds
          </div>

          {loading ? (
            <div className="gp-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ height: '200px', background: '#fff', border: '1px solid #E4E4E2', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.7),transparent)', animation: 'shimmer 1.4s ease infinite' }} />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ background: '#fff', border: '1px solid #E4E4E2', borderRadius: '16px', padding: '56px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔍</div>
              <div style={{ fontWeight: '700', fontSize: '15px', color: '#0A0A0A', marginBottom: '6px' }}>No guilds found</div>
              <div style={{ fontSize: '13px', color: '#9A9A9A' }}>Try a different search or create your own</div>
            </div>
          ) : (
            <div className="gp-grid">
              {filtered.map(guild => <GuildCard key={guild._id} guild={guild} />)}
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <div className="gp-modal-bg" onClick={() => setShowCreate(false)}>
          <div className="gp-modal" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowCreate(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: '1px solid #E4E4E2', borderRadius: '8px', width: '30px', height: '30px', cursor: 'pointer', color: '#9A9A9A', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            <div style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.02em', color: '#0A0A0A', marginBottom: '4px' }}>Create a Guild</div>
            <div style={{ fontSize: '13px', color: '#9A9A9A', marginBottom: '22px' }}>Build your own community</div>
            <form onSubmit={handleCreate}>
              {[['Guild Name *', 'name', 'Photography Lovers'], ['Description', 'description', 'What is this about?']].map(([label, key, ph]) => (
                <div key={key} style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#5A5A5A', marginBottom: '6px' }}>{label}</label>
                  {key === 'description'
                    ? <textarea style={{ ...inputStyle }} placeholder={ph} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} rows={3} onFocus={e => e.target.style.borderColor = '#6C63FF'} onBlur={e => e.target.style.borderColor = '#E4E4E2'} />
                    : <input style={{ ...inputStyle }} placeholder={ph} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} required={key === 'name'} onFocus={e => e.target.style.borderColor = '#6C63FF'} onBlur={e => e.target.style.borderColor = '#E4E4E2'} />
                  }
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#5A5A5A', marginBottom: '6px' }}>Topic</label>
                  <input style={{ ...inputStyle }} placeholder="Photography" value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} onFocus={e => e.target.style.borderColor = '#6C63FF'} onBlur={e => e.target.style.borderColor = '#E4E4E2'} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#5A5A5A', marginBottom: '6px' }}>Type</label>
                  <select style={{ ...inputStyle, appearance: 'auto', cursor: 'pointer' }} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>
              <button type="submit" disabled={creating || !form.name.trim()} style={{ width: '100%', padding: '12px', background: creating || !form.name.trim() ? '#C0C0BE' : '#0A0A0A', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: creating || !form.name.trim() ? 'not-allowed' : 'pointer', fontFamily: 'inherit', letterSpacing: '-0.01em', transition: 'background 0.15s' }}>
                {creating ? 'Creating…' : 'Create Guild'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default GuildsPage;