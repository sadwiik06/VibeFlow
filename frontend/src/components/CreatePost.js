import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../apiConfig';

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const LocationIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

const ImageIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#25D366" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);

const VideoIcon = () => (
  <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#C7C7C7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const CreatePost = ({ onPostCreated, forceOpen, onClose, hideTrigger }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('post'); // 'post' or 'reel'
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState('');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (forceOpen) setIsOpen(true);
    else if (!forceOpen && isOpen) resetAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceOpen]);

  const handleFile = (file) => {
    if (!file) return;
    if (activeTab === 'reel' && !file.type.startsWith('video/')) {
        setError('Reels must be videos.');
        return;
    }
    setMedia(file);
    setPreview(URL.createObjectURL(file));
    setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async () => {
    if (activeTab === 'post' && !media && !caption.trim()) {
        setError('Please add a photo, video, or write a caption.');
        return;
    }
    if (activeTab === 'reel' && !media) {
        setError('Reels must have a video attached.');
        return;
    }
    
    setLoading(true);
    setError('');
    const fd = new FormData();
    if (media) fd.append('media', media);
    fd.append('caption', caption);
    fd.append('location', location);
    fd.append('type', activeTab);
    
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/api/posts`, fd, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
      });
      onPostCreated(res.data);
      resetAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setIsOpen(false); setMedia(null); setPreview('');
    setCaption(''); setLocation(''); setError('');
    setActiveTab('post');
    if (fileRef.current) fileRef.current.value = '';
    if (onClose) onClose();
  };

  const isSubmitDisabled = loading || (activeTab === 'post' && !media && !caption.trim()) || (activeTab === 'reel' && !media);

  return (
    <>
      <style>{`
        /* ── Trigger bar ── */
        .cp-trigger-bar {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
          cursor: text;
          transition: border-color 0.15s;
        }
        .cp-trigger-bar:hover { border-color: #A8A8A8; }
        .cp-trigger-avatar {
          width: 36px; height: 36px;
          border-radius: 50%; object-fit: cover;
          background: var(--bg); border: 1px solid var(--border);
          flex-shrink: 0;
        }
        .cp-trigger-text {
          flex: 1;
          font-size: 14px;
          color: var(--text-muted);
          background: none;
          border: none;
          outline: none;
          font-family: var(--font-body);
          cursor: pointer;
          text-align: left;
          padding: 0;
        }
        .cp-add-btn {
          background: var(--blue);
          color: #fff;
          border: none;
          border-radius: 6px;
          width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: opacity 0.15s, transform 0.12s var(--spring);
        }
        .cp-add-btn:hover { opacity: 0.85; }
        .cp-add-btn:active { transform: scale(0.92); }

        /* ── Modal overlay ── */
        .cp-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.65);
          z-index: 1000;
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
          animation: fadeIn 0.2s var(--ease);
        }
        .cp-modal {
          background: var(--white);
          border-radius: 16px;
          width: 100%; max-width: 540px;
          overflow: hidden;
          animation: scaleIn 0.25s var(--spring);
          box-shadow: var(--shadow-lg);
          display: flex; flex-direction: column;
          max-height: 90vh;
        }

        /* Header Tabs */
        .cp-tabs {
          display: flex; border-bottom: 1px solid var(--border);
        }
        .cp-tab {
          flex: 1; padding: 16px; text-align: center;
          font-size: 15px; font-weight: 600; font-family: var(--font-body);
          color: var(--text-muted); cursor: pointer;
          background: none; border: none; border-bottom: 2px solid transparent;
          transition: color 0.15s, border-color 0.15s;
        }
        .cp-tab.active { color: var(--text); border-bottom-color: var(--blue); }

        /* Body */
        .cp-modal-body {
          padding: 20px 24px;
          overflow-y: auto;
          flex: 1;
        }

        .cp-header-actions {
          display: flex; justify-content: space-between; align-items: center;
          padding: 0 0 16px;
        }
        .cp-title { font-size: 18px; font-weight: 700; color: var(--text); }
        .cp-modal-close {
          background: #f0f0f0; border: none; border-radius: 50%;
          width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--text); transition: background 0.15s;
        }
        .cp-modal-close:hover { background: #e0e0e0; }

        /* Author Info */
        .cp-author-row { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .cp-author-avatar { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; }
        .cp-author-name { font-weight: 700; font-size: 15px; color: var(--text); }

        /* Text Input */
        .cp-caption-area {
          width: 100%; min-height: 120px;
          border: none; outline: none;
          font-family: var(--font-body); font-size: 18px;
          color: var(--text); resize: none; background: transparent;
        }
        .cp-caption-area::placeholder { color: #8E8E8E; }

        /* Media Add Button */
        .cp-add-media-card {
          border: 1px solid var(--border); border-radius: 12px;
          padding: 16px; display: flex; align-items: center; justify-content: space-between;
          margin-top: 16px; font-weight: 600; font-size: 14px;
        }
        .cp-add-icons { display: flex; gap: 8px; }
        .cp-icon-btn {
          width: 36px; height: 36px; border-radius: 50%; border: none;
          background: #f0f0f0; display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background 0.15s;
        }
        .cp-icon-btn:hover { background: #e0e0e0; }

        /* Drop Zone */
        .drop-zone {
          border: 2px dashed var(--border); border-radius: 12px;
          padding: 60px 20px; text-align: center; cursor: pointer;
          transition: border-color 0.2s, background 0.2s; margin-top: 16px;
        }
        .drop-zone.over { border-color: var(--blue); background: rgba(0,149,246,0.04); }
        .dz-title { font-size: 18px; font-weight: 600; color: var(--text); margin: 16px 0 6px; }
        .dz-sub { font-size: 14px; color: var(--text-muted); margin-bottom: 24px; }
        .dz-btn {
          background: var(--blue); color: #fff; border: none; border-radius: 8px;
          font-weight: 600; padding: 10px 24px; cursor: pointer;
        }

        /* Preview container */
        .cp-preview-wrap { position: relative; margin-top: 16px; border-radius: 12px; overflow: hidden; background: #000; }
        .cp-preview-media { width: 100%; max-height: 400px; object-fit: contain; display: block; }
        .cp-remove-media {
          position: absolute; top: 12px; right: 12px;
          background: rgba(255,255,255,0.9); border: none;
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        /* Location */
        .cp-location-row {
          display: flex; align-items: center; gap: 10px;
          border: 1px solid var(--border); border-radius: 12px;
          padding: 12px 16px; margin-top: 16px; background: transparent;
        }
        .cp-location-input {
          flex: 1; background: none; border: none; outline: none;
          font-family: var(--font-body); font-size: 15px; color: var(--text);
        }
        
        .cp-error {
          background: rgba(237,73,86,0.08); border: 1px solid rgba(237,73,86,0.25);
          border-radius: 8px; color: var(--red); font-size: 14px;
          padding: 12px 16px; margin-top: 16px; font-weight: 500;
        }

        /* Submit Button */
        .cp-submit-btn {
          width: 100%; padding: 14px; margin-top: 20px;
          background: var(--blue); color: #fff;
          border: none; border-radius: 10px;
          font-size: 16px; font-weight: 700; font-family: var(--font-body);
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: opacity 0.15s, transform 0.1s;
        }
        .cp-submit-btn:hover:not(:disabled) { opacity: 0.9; }
        .cp-submit-btn:active:not(:disabled) { transform: scale(0.98); }
        .cp-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .cp-spinner {
          width: 18px; height: 18px; border: 2.5px solid rgba(255,255,255,0.3);
          border-top-color: #fff; border-radius: 50%; animation: spin 0.65s linear infinite;
        }
      `}</style>

      <input
        ref={fileRef}
        type="file"
        accept={activeTab === 'post' ? "image/*,video/*" : "video/*"}
        style={{ display: 'none' }}
        onChange={e => handleFile(e.target.files[0])}
      />

      {!forceOpen && !hideTrigger && (
        <div className="cp-trigger-bar" onClick={() => setIsOpen(true)}>
          <img src={user?.profilePicture || '/default-avatar.png'} alt="" className="cp-trigger-avatar" />
          <button className="cp-trigger-text" type="button">What's on your mind?</button>
          <button className="cp-add-btn" type="button" onClick={e => { e.stopPropagation(); setIsOpen(true); }}>
            <PlusIcon />
          </button>
        </div>
      )}

      {isOpen && (
        <div className="cp-overlay" onClick={e => { if (e.target === e.currentTarget) resetAll(); }}>
          <div className="cp-modal">
            
            <div className="cp-tabs">
              <button className={`cp-tab ${activeTab === 'post' ? 'active' : ''}`} onClick={() => setActiveTab('post')}>Create Post</button>
              <button className={`cp-tab ${activeTab === 'reel' ? 'active' : ''}`} onClick={() => setActiveTab('reel')}>Create Reel</button>
            </div>

            <div className="cp-modal-body">
              <div className="cp-header-actions">
                <div className="cp-title">{activeTab === 'post' ? 'Create a Post' : 'Create a Reel'}</div>
                <button className="cp-modal-close" onClick={resetAll}><CloseIcon /></button>
              </div>

              <div className="cp-author-row">
                <img src={user?.profilePicture || '/default-avatar.png'} alt="" className="cp-author-avatar" />
                <span className="cp-author-name">{user?.username || 'You'}</span>
              </div>

              {activeTab === 'post' ? (
                // --- POST UI ---
                <>
                  <textarea
                    className="cp-caption-area"
                    placeholder="What's on your mind?"
                    value={caption}
                    onChange={e => setCaption(e.target.value)}
                    maxLength={2200}
                  />

                  {preview ? (
                    <div className="cp-preview-wrap">
                      {media?.type.startsWith('image/') ? (
                        <img src={preview} alt="" className="cp-preview-media" />
                      ) : (
                        <video src={preview} controls className="cp-preview-media" />
                      )}
                      <button className="cp-remove-media" onClick={() => { setMedia(null); setPreview(''); }}>
                        <CloseIcon />
                      </button>
                    </div>
                  ) : (
                    <div className="cp-add-media-card" onClick={() => fileRef.current?.click()} style={{ cursor: 'pointer' }}>
                      <span>Add to your post</span>
                      <div className="cp-add-icons">
                        <button type="button" className="cp-icon-btn" title="Photo/Video" style={{ pointerEvents: 'none' }}>
                          <ImageIcon />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                // --- REEL UI ---
                <>
                  <textarea
                    className="cp-caption-area"
                    style={{ minHeight: '80px', marginBottom: '16px' }}
                    placeholder="Describe your Reel..."
                    value={caption}
                    onChange={e => setCaption(e.target.value)}
                    maxLength={2200}
                  />

                  {preview ? (
                    <div className="cp-preview-wrap">
                      <video src={preview} controls className="cp-preview-media" />
                      <button className="cp-remove-media" onClick={() => { setMedia(null); setPreview(''); }}>
                        <CloseIcon />
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`drop-zone${dragOver ? ' over' : ''}`}
                      onDrop={handleDrop}
                      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onClick={() => fileRef.current?.click()}
                    >
                      <VideoIcon />
                      <div className="dz-title">Drag a video here</div>
                      <div className="dz-sub">Your video will be shared as a Reel</div>
                      <button className="dz-btn" type="button" onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}>
                        Select Video
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Common Location input */}
              <div className="cp-location-row">
                <LocationIcon />
                <input className="cp-location-input" type="text" placeholder="Add location (optional)" value={location} onChange={e => setLocation(e.target.value)} />
              </div>

              {error && <div className="cp-error">{error}</div>}

              <button type="button" className="cp-submit-btn" onClick={handleSubmit} disabled={isSubmitDisabled}>
                {loading ? <><div className="cp-spinner" /> Sharing...</> : (activeTab === 'post' ? 'Share Post' : 'Share Reel')}
              </button>

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreatePost;