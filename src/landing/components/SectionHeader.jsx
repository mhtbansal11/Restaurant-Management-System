import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { fadeUp, fadeIn, stagger } from '../utils/animations';

export default function SectionHeader({ badge, title, subtitle, light = false }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      variants={stagger(0.12)}
      style={{ textAlign: 'center', marginBottom: 64, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' }}
    >
      {badge && (
        <motion.div
          variants={fadeIn}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, background: '#312e8122', border: '1px solid #6366f144', marginBottom: 16 }}
        >
          <Sparkles size={12} color="#a5b4fc" />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a5b4fc', letterSpacing: '0.06em' }}>{badge}</span>
        </motion.div>
      )}
      <motion.h2
        variants={fadeUp}
        style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 800, marginBottom: 16, lineHeight: 1.15, letterSpacing: '-0.03em' }}
      >{title}</motion.h2>
      {subtitle && (
        <motion.p
          variants={fadeUp}
          style={{ color: '#c3c8d4', fontSize: '1.05rem', lineHeight: 1.7 }}
        >{subtitle}</motion.p>
      )}
    </motion.div>
  );
}
