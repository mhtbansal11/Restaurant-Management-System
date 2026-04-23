import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogIn } from 'lucide-react';
import BrandLogo from '../../components/BrandLogo';
import { ease } from '../utils/animations';

const links = [
  { to: '/features', label: 'Features' },
  { to: '/process', label: 'Process' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <motion.nav
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease }}
      style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 100,
        background: scrolled ? 'rgba(11,15,25,0.97)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid #1f2937' : '1px solid transparent',
        transition: 'all 0.35s ease',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px' }}>
        <motion.div whileHover={{ scale: 1.04 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <BrandLogo theme="dark" size={38} style={{ boxShadow: '0 0 18px rgba(168,85,247,0.28)' }} />
            <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.03em', color: '#f9fafb' }}>Masala Matrix</span>
          </Link>
        </motion.div>

        {/* Desktop nav */}
        <div className="lp-desktop-nav" style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          {links.map((l) => {
            const active = location.pathname === l.to;
            return (
              <motion.div key={l.to} whileHover={{ y: -1 }}>
                <Link
                  to={l.to}
                  style={{
                    fontSize: '0.9rem', fontWeight: active ? 600 : 500,
                    color: active ? '#f9fafb' : '#c3c8d4',
                    textDecoration: 'none', transition: 'color 0.2s',
                    position: 'relative',
                  }}
                >
                  {l.label}
                  {active && (
                    <motion.div
                      layoutId="nav-underline"
                      style={{ position: 'absolute', bottom: -4, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,#6366f1,#a855f7)', borderRadius: 2 }}
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/login"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: '0.875rem', fontWeight: 600, color: '#a5b4fc',
                textDecoration: 'none', padding: '10px 16px',
                border: '1px solid #6366f144', borderRadius: 999,
                background: '#6366f110',
              }}
            >
              <LogIn size={15} /> Login
            </Link>
          </motion.div>
          <motion.div
            className="lp-desktop-nav"
            whileHover={{ scale: 1.05, boxShadow: '0 0 24px rgba(99,102,241,0.45)' }}
            whileTap={{ scale: 0.97 }}
          >
            <Link
              to="/contact"
              style={{
                display: 'inline-flex', alignItems: 'center',
                fontSize: '0.875rem', padding: '10px 22px', textDecoration: 'none',
                background: 'linear-gradient(135deg,#6366f1,#a855f7)',
                color: 'white', borderRadius: 999, fontWeight: 600,
              }}
            >
              Get Started
            </Link>
          </motion.div>

          <motion.button
            className="lp-mobile-menu-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            whileTap={{ scale: 0.9 }}
            style={{ background: 'none', border: '1px solid #9fa8ba', color: 'white', cursor: 'pointer', padding: '8px', borderRadius: 999 }}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ background: '#0b0f19', borderTop: '1px solid #1f2937', overflow: 'hidden' }}
          >
            <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {links.map((l) => (
                <Link key={l.to} to={l.to} style={{ color: '#c3c8d4', fontSize: '1rem', textDecoration: 'none', fontWeight: 500 }}>
                  {l.label}
                </Link>
              ))}
              <Link to="/login" style={{ color: '#a5b4fc', fontSize: '1rem', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <LogIn size={15} /> Login to Dashboard
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
