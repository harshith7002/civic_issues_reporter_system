import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { RiSearchLine, RiCheckLine, RiTimeLine, RiAlertLine, RiMapPinLine } from 'react-icons/ri';

const API = 'http://localhost:8000';

const CATEGORY_META = {
  pothole: { label: 'Pothole', emoji: '🕳️', color: '#ff6b35' },
  garbage: { label: 'Garbage', emoji: '🗑️', color: '#00e676' },
  streetlight: { label: 'Street Light', emoji: '💡', color: '#ffd600' },
  drainage: { label: 'Drainage', emoji: '🌊', color: '#00d4ff' },
  water_leakage: { label: 'Water Leakage', emoji: '💧', color: '#7c3aed' },
};

const STATUS_STEPS = [
  { key: 'reported', label: 'Reported', desc: 'Your complaint has been logged', icon: <RiAlertLine /> },
  { key: 'assigned', label: 'Assigned', desc: 'Routed to the right authority', icon: <RiTimeLine /> },
  { key: 'in_progress', label: 'In Progress', desc: 'Municipal team is working on it', icon: '⚙️' },
  { key: 'resolved', label: 'Resolved', desc: 'Issue has been fixed!', icon: <RiCheckLine /> },
];

export default function TrackComplaint() {
  const [query, setQuery] = useState('');
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setComplaint(null);
    try {
      const res = await axios.get(`${API}/api/complaints/${query.trim().toUpperCase()}`);
      setComplaint(res.data);
    } catch {
      // Demo fallback
      if (query.length > 5) {
        setComplaint({
          complaint_id: query.toUpperCase(),
          user_name: 'Demo User',
          category: 'pothole',
          status: 'assigned',
          city: 'Mumbai',
          address: 'Bandra West, Mumbai, Maharashtra',
          municipality_name: 'BMC',
          department: 'Road Department',
          confidence: 0.87,
          created_at: new Date().toISOString(),
        });
      } else {
        setError('Complaint not found. Please check the ID and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const stepIndex = complaint ? STATUS_STEPS.findIndex(s => s.key === complaint.status) : -1;
  const cat = complaint ? CATEGORY_META[complaint.category] : null;

  return (
    <div style={{ minHeight: '100vh', padding: '96px 24px 60px', maxWidth: 700, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>
            Track Your Complaint
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Enter your complaint ID to check the current status
          </p>
        </div>

        {/* Search */}
        <div style={{
          background: 'rgba(13,24,41,0.8)', border: '1px solid rgba(0,212,255,0.1)',
          borderRadius: 20, padding: 28, marginBottom: 24,
        }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <RiSearchLine style={{
                position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)', fontSize: 18,
              }} />
              <input
                className="form-input"
                style={{ paddingLeft: 46, letterSpacing: '0.04em', textTransform: 'uppercase' }}
                placeholder="e.g. JS2024001ABC"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && search()}
              />
            </div>
            <motion.button
              onClick={search}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                background: 'linear-gradient(135deg, #00d4ff, #0066ff)',
                color: '#000', fontFamily: 'var(--font-display)', fontWeight: 800,
                padding: '14px 28px', borderRadius: 12, cursor: 'pointer',
                whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              {loading ? <div className="spinner" style={{ width: 18, height: 18 }} /> : <><RiSearchLine /> Track</>}
            </motion.button>
          </div>
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                marginTop: 12, padding: '10px 14px', borderRadius: 10,
                background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.25)',
                fontSize: '0.85rem', color: '#ff6b35',
              }}
            >
              {error}
            </motion.div>
          )}
        </div>

        {/* Result */}
        <AnimatePresence>
          {complaint && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              style={{
                background: 'rgba(13,24,41,0.8)', border: '1px solid rgba(0,212,255,0.1)',
                borderRadius: 20, padding: 28,
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                    Complaint ID
                  </div>
                  <div style={{ fontSize: '1.3rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: '#00e676' }}>
                    {complaint.complaint_id}
                  </div>
                </div>
                {cat && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: `${cat.color}10`, border: `1px solid ${cat.color}25`,
                    borderRadius: 12, padding: '10px 16px',
                  }}>
                    <span style={{ fontSize: '1.5rem' }}>{cat.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 700, color: cat.color }}>{cat.label}</div>
                      {complaint.confidence && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {Math.round(complaint.confidence * 100)}% AI confidence
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Details row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 28 }}>
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '12px 16px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Reported By</div>
                  <div style={{ fontWeight: 600 }}>{complaint.user_name}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '12px 16px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Municipality</div>
                  <div style={{ fontWeight: 600 }}>{complaint.municipality_name || 'N/A'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{complaint.department}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '12px 16px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Location</div>
                  <div style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <RiMapPinLine style={{ color: '#00d4ff', flexShrink: 0, marginTop: 2 }} />
                    {complaint.address?.slice(0, 60)}{complaint.address?.length > 60 ? '...' : ''}
                  </div>
                </div>
              </div>

              {/* Status timeline */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16, fontWeight: 600 }}>
                  Progress
                </div>
                <div style={{ position: 'relative' }}>
                  {/* Track line */}
                  <div style={{
                    position: 'absolute', top: 18, left: 18, right: 18, height: 2,
                    background: 'rgba(255,255,255,0.06)',
                  }} />
                  <div style={{
                    position: 'absolute', top: 18, left: 18,
                    height: 2,
                    width: `${stepIndex >= 0 ? (stepIndex / (STATUS_STEPS.length - 1)) * 100 : 0}%`,
                    background: 'linear-gradient(90deg, #00d4ff, #00e676)',
                    transition: 'width 0.8s ease',
                    maxWidth: 'calc(100% - 36px)',
                  }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                    {STATUS_STEPS.map((step, i) => {
                      const done = i <= stepIndex;
                      const active = i === stepIndex;
                      return (
                        <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 }}>
                          <motion.div
                            animate={active ? { scale: [1, 1.15, 1] } : {}}
                            transition={{ duration: 2, repeat: Infinity }}
                            style={{
                              width: 36, height: 36, borderRadius: '50%',
                              background: done ? (active ? 'linear-gradient(135deg, #00d4ff, #0066ff)' : 'rgba(0,230,118,0.2)') : 'rgba(255,255,255,0.06)',
                              border: done ? (active ? 'none' : '2px solid #00e676') : '2px solid rgba(255,255,255,0.1)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: done ? (active ? '#000' : '#00e676') : 'var(--text-muted)',
                              fontSize: 14, fontWeight: 700,
                              boxShadow: active ? '0 4px 20px rgba(0,212,255,0.4)' : 'none',
                              zIndex: 1, position: 'relative',
                            }}
                          >
                            {step.icon}
                          </motion.div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: done ? 700 : 500, color: done ? (active ? '#00d4ff' : '#00e676') : 'var(--text-muted)' }}>
                              {step.label}
                            </div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2, maxWidth: 80, lineHeight: 1.3 }}>
                              {step.desc}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {complaint.created_at && (
                <div style={{ marginTop: 20, fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                  Filed: {new Date(complaint.created_at).toLocaleString('en-IN')}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}