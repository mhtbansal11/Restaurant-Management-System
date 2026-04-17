import React from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import LandingNavbar from './components/Navbar';
import LandingFooter from './components/Footer';
import './landing.css';

function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function LandingLayout({ children }) {
  const location = useLocation();
  return (
    <div className="landing-root">
      <LandingNavbar />
      <main>
        <AnimatePresence mode="wait">
          <PageWrapper key={location.pathname}>
            {children}
          </PageWrapper>
        </AnimatePresence>
      </main>
      <LandingFooter />
    </div>
  );
}
