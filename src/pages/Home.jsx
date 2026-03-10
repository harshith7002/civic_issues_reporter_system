import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RiAlertLine, RiMapPinLine, RiRobot2Line, RiBuildingLine, RiCheckDoubleLine, RiArrowRightLine, RiCommunityLine } from 'react-icons/ri';

const FLOATING_ICONS = [
  { icon: '🚧', x: '10%', y: '20%', delay: 0 },
  { icon: '🗑️', x: '80%', y: '15%', delay: 0.5 },
  { icon: '💡', x: '20%', y: '65%', delay: 1 },
  { icon: '🌊', x: '75%', y: '60%', delay: 1.5 },
  { icon: '🕳️', x: '90%', y: '40%', delay: 0.8 },
  { icon: '📍', x: '5%', y: '45%', delay: 1.2 },
];

const STATS = [
  { value: '50K+', label: 'Issues Resolved' },
  { value: '12', label: 'Cities Active' },
  { value: '98%', label: 'AI Accuracy' },
  { value: '2hrs', label: 'Avg Response' },
];

const FEATURES = [
  { icon: <RiAlertLine size={28} />, title: 'Instant Reporting', desc: 'Capture civic issues with your camera in seconds', color: '#ff6b35' },
  { icon: <RiRobot2Line size={28} />, title: 'AI Classification', desc: 'Deep learning auto-detects issue type from images', color: '#00d4ff' },
  { icon: <RiMapPinLine size={28} />, title: 'Geo-Tagging', desc: 'GPS pinpoints exact location for faster resolution', color: '#00e676' },
  { icon: <RiBuildingLine size={28} />, title: 'Smart Routing', desc: 'Auto-routes to the right municipal department', color: '#7c3aed' },
  { icon: <RiCheckDoubleLine size={28} />, title: 'Live Tracking', desc: 'Real-time status updates from reported to resolved', color: '#ffd600' },
  { icon: <RiCommunityLine size={28} />, title: 'Community Map', desc: 'See all issues in your neighborhood on a live map', color: '#ff4081' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Capture & Report', desc: 'Take a photo of the civic issue using your phone camera or webcam.' },
  { step: '02', title: 'AI Detects Issue', desc: 'Our CNN model analyzes the image and classifies the problem instantly.' },
  { step: '03', title: 'Auto-Routing', desc: 'System identifies your city and routes complaint to the right authority.' },
  { step: '04', title: 'Get Resolved', desc: 'Track progress in real-time as the municipality addresses the issue.' },
];

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Hero */}
      <section style={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: '80px 24px 60px',
      }}>
        {/* Animated background */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          {/* Grid */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `
              linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }} />

          {/* Glow orbs */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
            style={{
              position: 'absolute', top: '20%', left: '10%',
              width: 500, height: 500,
              background: 'radial-gradient(circle, rgba(0, 212, 255, 0.15) 0%, transparent 70%)',
              borderRadius: '50%', pointerEvents: 'none',
            }}
          />
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, delay: 2 }}
            style={{
              position: 'absolute', bottom: '20%', right: '10%',
              width: 400, height: 400,
              background: 'radial-gradient(circle, rgba(124, 58, 237, 0.2) 0%, transparent 70%)',
              borderRadius: '50%', pointerEvents: 'none',
            }}
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 7, repeat: Infinity, delay: 4 }}
            style={{
              position: 'absolute', top: '60%', left: '50%',
              width: 300, height: 300,
              background: 'radial-gradient(circle, rgba(255, 107, 53, 0.1) 0%, transparent 70%)',
              borderRadius: '50%', pointerEvents: 'none',
              transform: 'translate(-50%, -50%)',
            }}
          />
        </div>

        {/* Floating icons */}
        {FLOATING_ICONS.map(({ icon, x, y, delay }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 0.6, 0.6, 0],
              scale: [0, 1, 1, 0],
              y: [0, -15, 0, 15, 0],
            }}
            transition={{
              duration: 6,
              delay: delay,
              repeat: Infinity,
              repeatDelay: 2,
            }}
            style={{
              position: 'absolute',
              left: x, top: y,
              fontSize: '2rem',
              filter: 'drop-shadow(0 0 12px rgba(0, 212, 255, 0.5))',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            {icon}
          </motion.div>
        ))}

        {/* Hero Content */}
        <div style={{ textAlign: 'center', maxWidth: 800, position: 'relative', zIndex: 2 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(0, 212, 255, 0.08)',
              border: '1px solid rgba(0, 212, 255, 0.2)',
              borderRadius: 50, padding: '6px 18px',
              fontSize: '0.8rem', color: '#00d4ff',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              marginBottom: 28, fontWeight: 600,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00d4ff', animation: 'pulse-glow 2s infinite' }} />
            AI-Powered Smart City Platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{
              fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              marginBottom: 24,
            }}
          >
            Report Civic Issues.{' '}
            <span style={{
              background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              AI Fixes Them Faster.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              fontSize: '1.15rem',
              color: 'var(--text-secondary)',
              maxWidth: 580,
              margin: '0 auto 40px',
              lineHeight: 1.7,
            }}
          >
            Snap a photo, let AI classify the issue, and watch it get routed to the right
            municipal authority — all in under 30 seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: '0 12px 40px rgba(0, 212, 255, 0.5)' }}
                whileTap={{ scale: 0.97 }}
                style={{
                  background: 'linear-gradient(135deg, #00d4ff, #0066ff)',
                  color: '#000', fontFamily: 'var(--font-display)',
                  fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.01em',
                  padding: '16px 36px', borderRadius: 50, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 10,
                  boxShadow: '0 6px 24px rgba(0, 212, 255, 0.35)',
                }}
              >
                Report an Issue <RiArrowRightLine size={18} />
              </motion.button>
            </Link>
            <Link to="/map">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(12px)',
                  color: '#fff', fontFamily: 'var(--font-display)',
                  fontWeight: 600, fontSize: '0.95rem',
                  padding: '16px 36px', borderRadius: 50, cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}
              >
                <RiMapPinLine /> View Live Map
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{
        background: 'rgba(0, 212, 255, 0.03)',
        borderTop: '1px solid rgba(0, 212, 255, 0.08)',
        borderBottom: '1px solid rgba(0, 212, 255, 0.08)',
        padding: '40px 24px',
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {STATS.map(({ value, label }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              style={{ textAlign: 'center' }}
            >
              <div style={{
                fontSize: 'clamp(2rem, 4vw, 2.8rem)',
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #00d4ff, #fff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>{value}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '100px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 64 }}
        >
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 16 }}>
            Everything you need to fix your city
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto', fontSize: '1.05rem' }}>
            From AI-powered detection to real-time tracking, Jan Sahayak makes civic issue reporting effortless.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {FEATURES.map(({ icon, title, desc, color }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              viewport={{ once: true }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              style={{
                background: 'var(--bg-glass)',
                backdropFilter: 'blur(20px)',
                border: '1px solid var(--border-glass)',
                borderRadius: 20,
                padding: '28px 28px',
                cursor: 'default',
              }}
            >
              <div style={{
                width: 52, height: 52,
                borderRadius: 14,
                background: `${color}18`,
                border: `1px solid ${color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: color, marginBottom: 18,
              }}>
                {icon}
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 10 }}>{title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{
        padding: '100px 24px',
        background: 'rgba(0, 212, 255, 0.02)',
        borderTop: '1px solid rgba(0, 212, 255, 0.06)',
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 64 }}
          >
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 16 }}>
              How it works
            </h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 32 }}>
            {HOW_IT_WORKS.map(({ step, title, desc }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12 }}
                viewport={{ once: true }}
                style={{ position: 'relative' }}
              >
                <div style={{
                  fontSize: '3.5rem', fontFamily: 'var(--font-display)', fontWeight: 800,
                  color: 'rgba(0, 212, 255, 0.1)', lineHeight: 1, marginBottom: 8,
                }}>{step}</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 10, color: '#fff' }}>{title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '100px 24px' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          style={{
            maxWidth: 700, margin: '0 auto', textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(124, 58, 237, 0.1))',
            border: '1px solid rgba(0, 212, 255, 0.15)',
            borderRadius: 32, padding: '64px 40px',
            position: 'relative', overflow: 'hidden',
          }}
        >
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16 }}>
            See a problem? Report it now.
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 36, fontSize: '1.05rem' }}>
            Join thousands of citizens making Indian cities smarter, cleaner, and safer.
          </p>
          <Link to="/login">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 12px 40px rgba(0, 212, 255, 0.4)' }}
              whileTap={{ scale: 0.97 }}
              style={{
                background: 'linear-gradient(135deg, #00d4ff, #0066ff)',
                color: '#000', fontFamily: 'var(--font-display)',
                fontWeight: 800, fontSize: '1.05rem',
                padding: '18px 44px', borderRadius: 50, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 10,
              }}
            >
              Start Reporting <RiArrowRightLine size={20} />
            </motion.button>
          </Link>
        </motion.div>
      </section>

      <footer style={{
        borderTop: '1px solid rgba(0,212,255,0.06)',
        padding: '32px 24px', textAlign: 'center',
        color: 'var(--text-muted)', fontSize: '0.85rem',
      }}>
        <strong style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>Jan Sahayak</strong>
        {' '} — AI-Powered Civic Issue Platform • Built for Smart Indian Cities
      </footer>
    </div>
  );
}