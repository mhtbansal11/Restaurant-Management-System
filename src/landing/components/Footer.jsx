import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import BrandLogo from '../../components/BrandLogo';

export default function Footer() {
  return (
    <footer style={{ background: '#0b0f19', borderTop: '1px solid #1f2937', paddingTop: 64, paddingBottom: 40 }}>
      <div className="lp-container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 40, marginBottom: 56 }}>
          <div style={{ gridColumn: 'span 2' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, textDecoration: 'none' }}>
              <BrandLogo theme="dark" size={36} style={{ }} />
              <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.03em', color: '#f9fafb' }}>Masala Matrix</span>
            </Link>
            <p style={{ color: '#b4bac8', fontSize: '0.875rem', lineHeight: 1.7, maxWidth: 260 }}>
              Masala Matrix builds systems that run restaurants — and strategies that grow them. Personalized restaurant technology.
            </p>
          </div>

          <div>
            <h4 style={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#aab2c3', marginBottom: 18 }}>Product</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { to: '/features', label: 'Features' },
                { to: '/process', label: 'Process' },
                { to: '/pricing', label: 'Pricing' },
                { to: '/about', label: 'About Us' },
              ].map((l) => (
                <motion.div key={l.to} whileHover={{ x: 4 }}>
                  <Link to={l.to} className="lp-nav-link" style={{ fontSize: '0.875rem', textDecoration: 'none' }}>{l.label}</Link>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#aab2c3', marginBottom: 18 }}>Contact</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <motion.a href="mailto:support@masalamatrix.com" className="lp-nav-link" whileHover={{ color: '#f9fafb' }} style={{ fontSize: '0.875rem' }}>
                support@masalamatrix.com
              </motion.a>
              <motion.a href="https://wa.me/917791073995" className="lp-nav-link" whileHover={{ color: '#f9fafb' }} style={{ fontSize: '0.875rem' }}>
                WhatsApp Consultation
              </motion.a>
              <motion.div whileHover={{ x: 4 }}>
                <Link to="/contact" className="lp-nav-link" style={{ fontSize: '0.875rem', textDecoration: 'none' }}>Contact Us</Link>
              </motion.div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #1f2937', paddingTop: 28, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, fontSize: '0.775rem', color: '#aab2c3' }}>
          <span>© 2026 Masala Matrix. All rights reserved.</span>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Privacy Policy', 'Terms of Use', 'Compliance'].map((l) => (
              <motion.a key={l} href="#" className="lp-nav-link" whileHover={{ color: '#f9fafb' }} style={{ fontSize: '0.775rem' }}>{l}</motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
