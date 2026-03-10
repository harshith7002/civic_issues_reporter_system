import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RiMapPinLine, RiAlertLine, RiDashboardLine, RiSearchLine, RiLogoutBoxLine, RiMenuLine, RiCloseLine } from 'react-icons/ri';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('js_user') || 'null');

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const logout = () => {
    localStorage.removeItem('js_user');
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: null },
    { to: '/report', label: 'Report Issue', icon: <RiAlertLine /> },
    { to: '/map', label: 'Live Map', icon: <RiMapPinLine /> },
    { to: '/track', label: 'Track', icon: <RiSearchLine /> },
    { to: '/admin', label: 'Admin', icon: <RiDashboardLine /> },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          padding: '0 24px',
          height: 72,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: scrolled ? 'rgba(6, 11, 20, 0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(24px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(0, 212, 255, 0.08)' : 'none',
          transition: 'all 0.4s ease',
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38,
            background: 'linear-gradient(135deg, #00d4ff, #0066ff)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 800,
            color: '#000', fontFamily: 'var(--font-display)',
            boxShadow: '0 4px 20px rgba(0, 212, 255, 0.3)',
          }}>JS</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em', color: '#fff', lineHeight: 1.2 }}>
              Jan Sahayak
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Smart City Platform
            </div>
          </div>
        </Link>

        {/* Desktop Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, '@media(max-width:768px)': { display: 'none' } }} className="desktop-nav">
          {navLinks.map(({ to, label, icon }) => (
            <Link key={to} to={to} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 50,
              fontSize: '0.875rem', fontWeight: 500,
              color: location.pathname === to ? '#00d4ff' : 'var(--text-secondary)',
              background: location.pathname === to ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
              transition: 'all 0.2s ease',
              border: location.pathname === to ? '1px solid rgba(0, 212, 255, 0.2)' : '1px solid transparent',
            }}>
              {icon}<span>{label}</span>
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user ? (
            <>
              <div style={{
                padding: '6px 14px', borderRadius: 50,
                background: 'rgba(0, 212, 255, 0.08)',
                border: '1px solid rgba(0, 212, 255, 0.15)',
                fontSize: '0.82rem', color: 'var(--text-secondary)',
              }}>
                👤 {user.name}
              </div>
              <button onClick={logout} style={{
                background: 'transparent', border: '1px solid rgba(255, 107, 53, 0.3)',
                color: '#ff6b35', borderRadius: 50, padding: '7px 16px',
                fontSize: '0.82rem', cursor: 'pointer', display: 'flex',
                alignItems: 'center', gap: 6, transition: 'all 0.2s',
              }}>
                <RiLogoutBoxLine /> Logout
              </button>
            </>
          ) : (
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  background: 'linear-gradient(135deg, #00d4ff, #0066ff)',
                  color: '#000', fontWeight: 700, fontFamily: 'var(--font-display)',
                  fontSize: '0.875rem', padding: '9px 22px',
                  borderRadius: 50, cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(0, 212, 255, 0.3)',
                }}
              >
                Get Started
              </motion.button>
            </Link>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              display: 'none', background: 'transparent',
              color: 'var(--text-primary)', fontSize: 22, padding: 8,
              borderRadius: 8, border: '1px solid var(--border-glass)',
            }}
            className="mobile-menu-btn"
          >
            {mobileOpen ? <RiCloseLine /> : <RiMenuLine />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed', top: 72, left: 0, right: 0,
              background: 'rgba(6, 11, 20, 0.97)',
              backdropFilter: 'blur(24px)',
              borderBottom: '1px solid var(--border-glass)',
              padding: '16px 24px',
              zIndex: 999, display: 'flex', flexDirection: 'column', gap: 8,
            }}
          >
            {navLinks.map(({ to, label, icon }) => (
              <Link key={to} to={to} onClick={() => setMobileOpen(false)} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 16px', borderRadius: 12,
                fontSize: '0.95rem', fontWeight: 500,
                color: location.pathname === to ? '#00d4ff' : 'var(--text-secondary)',
                background: location.pathname === to ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
              }}>
                {icon}<span>{label}</span>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}