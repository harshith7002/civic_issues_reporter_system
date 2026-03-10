import React from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RiCheckDoubleLine, RiMapPinLine, RiSearchLine, RiArrowRightLine } from 'react-icons/ri';

const CATEGORY_META = {
  pothole: { label: 'Pothole', emoji: '🕳️', color: '#ff6b35' },
  garbage: { label: 'Garbage', emoji: '🗑️', color: '#00e676' },
  streetlight: { label: 'Street Light', emoji: '💡', color: '#ffd600' },
  drainage: { label: 'Drainage', emoji: '🌊', color: '#00d4ff' },
  water_leakage: { label: 'Water Leakage', emoji: '💧', color: '#7c3aed' },
};

export default function Success() {
  const { id } = useParams();
  const { state } = useLocation();

  const cat = CATEGORY_META[state?.category] || { label: state?.category || 'Issue', emoji: '⚠️', color: '#00d4ff' };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '80px 24px 40px',
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '100%', maxWidth: 520, textAlign: 'center',
          background: 'rgba(13, 24, 41, 0.8)',
          backdropFilter: 'blur(32px)',
          border: '1px solid rgba(0, 230, 118, 0.15)',
          borderRadius: 28, padding: '52px 40px',
        }}
      >
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5, type: 'spring', stiffness: 200 }}
          style={{
            width: 80, height: 80,
            background: 'linear-gradient(135deg, rgba(0,230,118,0.2), rgba(0,230,118,0.1))',
            border: '2px solid rgba(0, 230, 118, 0.4)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: 32,
          }}
        >
          ✅
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>
            Complaint Registered!
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>
            Your civic issue has been logged and routed to the right authority.
          </p>

          {/* Complaint ID */}
          <div style={{
            background: 'rgba(0, 230, 118, 0.06)',
            border: '1px solid rgba(0, 230, 118, 0.2)',
            borderRadius: 14, padding: '16px 20px',
            marginBottom: 20,
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              Complaint ID
            </div>
            <div style={{
              fontSize: '1.4rem', fontFamily: 'var(--font-display)', fontWeight: 800,
              letterSpacing: '0.04em', color: '#00e676',
            }}>
              {id}
            </div>
          </div>

          {/* Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
            <div style={{
              background: `${cat.color}10`,
              border: `1px solid ${cat.color}25`,
              borderRadius: 12, padding: '14px',
            }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Issue Type</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{cat.emoji}</span>
                <span style={{ fontWeight: 700, color: cat.color, fontSize: '0.9rem' }}>{cat.label}</span>
              </div>
              {state?.confidence && (
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  {Math.round(state.confidence * 100)}% AI confidence
                </div>
              )}
            </div>

            <div style={{
              background: 'rgba(124, 58, 237, 0.08)',
              border: '1px solid rgba(124, 58, 237, 0.2)',
              borderRadius: 12, padding: '14px',
            }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Routed To</div>
              <div style={{ fontWeight: 700, color: '#a78bfa', fontSize: '0.9rem' }}>
                {state?.municipality || 'Municipal Corp'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                {state?.department || ''}
              </div>
            </div>

            {state?.city && (
              <div style={{
                gridColumn: '1 / -1',
                background: 'rgba(0, 212, 255, 0.06)',
                border: '1px solid rgba(0, 212, 255, 0.15)',
                borderRadius: 12, padding: '14px',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <RiMapPinLine style={{ color: '#00d4ff' }} />
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>City</div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{state.city}</div>
                </div>
              </div>
            )}
          </div>

          {/* Status */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255, 107, 53, 0.1)',
            border: '1px solid rgba(255, 107, 53, 0.25)',
            borderRadius: 50, padding: '6px 16px',
            fontSize: '0.8rem', color: '#ff6b35', fontWeight: 600,
            marginBottom: 32, letterSpacing: '0.04em',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff6b35', animation: 'pulse-glow 2s infinite' }} />
            Status: REPORTED
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Link to="/track" state={{ id }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: '100%', background: 'linear-gradient(135deg, #00d4ff, #0066ff)',
                  color: '#000', fontFamily: 'var(--font-display)', fontWeight: 800,
                  fontSize: '0.95rem', padding: '14px', borderRadius: 12, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                <RiSearchLine /> Track This Complaint
              </motion.button>
            </Link>
            <Link to="/report">
              <button style={{
                width: '100%', background: 'transparent',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--text-secondary)', padding: '13px', borderRadius: 12,
                cursor: 'pointer', fontFamily: 'var(--font-body)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontSize: '0.9rem',
              }}>
                Report Another Issue <RiArrowRightLine />
              </button>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}