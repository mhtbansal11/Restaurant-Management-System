import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import {
  Utensils, Grid, Cpu, Users, ShieldCheck, CheckCircle2,
  BarChart3, ArrowRight, Rocket, Star, TrendingUp, Zap,
  DollarSign, Package, Activity, Layout, LineChart,
  ChefHat, Clock, Quote, Wifi, Sparkles, Globe,
  Bell, CreditCard, Timer, Flame,
} from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import { ease, fadeUp, fadeIn, stagger, scaleUp } from '../utils/animations';

// ── Purple glow atmospheric layer ────────────────────────────────────────────
function HeroBg() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(99,102,241,0.07) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div style={{ position: 'absolute', bottom: -100, left: '50%', transform: 'translateX(-50%)', width: '110%', height: 520, background: 'radial-gradient(ellipse 80% 100% at 50% 100%, rgba(99,102,241,0.22) 0%, rgba(168,85,247,0.1) 45%, transparent 70%)' }} />
      <div style={{ position: 'absolute', top: -80, right: '5%', width: 420, height: 420, background: 'radial-gradient(circle, rgba(168,85,247,0.08), transparent 70%)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: '8%', right: '8%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5) 28%, rgba(168,85,247,0.5) 72%, transparent)' }} />
    </div>
  );
}

// ── Animated restaurant-system graphics overlay ───────────────────────────────
function HeroGraphics() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>

      {/* ── SVG: floor-plan silhouette + connection lines ── */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="hgLine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.04" />
          </linearGradient>
          <linearGradient id="hgLine2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.03" />
          </linearGradient>
        </defs>
        {/* Diagonal accent lines */}
        <line x1="0" y1="55%" x2="28%" y2="0" stroke="url(#hgLine)" strokeWidth="1" />
        <line x1="6%" y1="100%" x2="22%" y2="48%" stroke="url(#hgLine)" strokeWidth="0.6" />
        <line x1="100%" y1="38%" x2="72%" y2="100%" stroke="url(#hgLine2)" strokeWidth="1" />
        <line x1="94%" y1="0" x2="78%" y2="42%" stroke="url(#hgLine2)" strokeWidth="0.6" />

        {/* Restaurant floor-plan – top left, very subtle */}
        <g transform="translate(28, 140)" opacity="0.18">
          {/* Table rows */}
          {[[0,0],[52,0],[104,0],[0,36],[52,36],[104,36]].map(([x,y],i) => (
            <rect key={i} x={x} y={y} width="38" height="26" rx="5" fill="none" stroke="#6366f1" strokeWidth="0.9" />
          ))}
          {/* Aisles */}
          <line x1="0" y1="30" x2="142" y2="30" stroke="#6366f1" strokeWidth="0.4" strokeDasharray="4 4" />
          <line x1="0" y1="66" x2="142" y2="66" stroke="#6366f1" strokeWidth="0.4" strokeDasharray="4 4" />
          {/* Kitchen */}
          <rect x="0" y="80" width="142" height="28" rx="4" fill="none" stroke="#f59e0b" strokeWidth="0.7" strokeDasharray="5 3" opacity="0.7" />
          <text x="71" y="98" textAnchor="middle" fontSize="8" fill="#f59e0b" opacity="0.7" fontFamily="Inter,sans-serif">KITCHEN</text>
          {/* Occupied dots */}
          {[[19,13],[71,13],[119,13],[19,49]].map(([x,y],i) => (
            <circle key={i} cx={x} cy={y} r="2.5" fill="#10b981" opacity="0.7" />
          ))}
        </g>

        {/* Revenue sparkline – right side */}
        <g transform="translate(0, 0)" opacity="0.35">
          <polyline
            points="88%,18% 90%,13% 92%,15% 94%,9% 96%,11% 98%,6% 100%,8%"
            fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </g>
      </svg>

      {/* ── KPI chip — top right corner ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 0.65, y: 0 }}
        transition={{ delay: 2.6, duration: 0.7 }}
        style={{
          position: 'absolute', right: 28, top: '22%',
          background: 'rgba(9,10,18,0.92)', backdropFilter: 'blur(14px)',
          border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10,
          padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}
      >
        <TrendingUp size={13} color="#818cf8" />
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#818cf8' }}>+18.4%</div>
          <div style={{ fontSize: 9, color: '#aab2c3' }}>This week</div>
        </div>
      </motion.div>

      {/* ── Floating revenue card — bottom right ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 0.8, y: 0 }}
        transition={{ delay: 2.4, duration: 0.8 }}
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', right: 28, bottom: '16%', background: 'rgba(9,10,18,0.92)', backdropFilter: 'blur(14px)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 12, padding: '10px 14px', minWidth: 160, boxShadow: '0 10px 32px rgba(0,0,0,0.5)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
            <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2.2, repeat: Infinity }} style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
            <span style={{ fontSize: 8, fontWeight: 700, color: '#10b981', letterSpacing: '0.07em' }}>TODAY'S REVENUE</span>
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#f9fafb', letterSpacing: '-0.02em' }}>₹24,850</div>
          <div style={{ fontSize: 9, color: '#10b981', marginTop: 2 }}>↑ 18.4% vs last week</div>
        </motion.div>
      </motion.div>
    </div>
  );
}

// ── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = 16;
    const increment = target / (1800 / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, step);
    return () => clearInterval(timer);
  }, [isInView, target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ── Dashboard Mockup ──────────────────────────────────────────────────────────
function DashboardMockup() {
  const tables = [
    { id: 1, status: 'occupied' }, { id: 2, status: 'available' },
    { id: 3, status: 'occupied' }, { id: 4, status: 'reserved' },
    { id: 5, status: 'available' }, { id: 6, status: 'occupied' },
  ];
  const sc = { occupied: '#ef4444', available: '#10b981', reserved: '#f59e0b' };
  const orders = [
    { id: '#042', status: 'cooking', color: '#f59e0b' },
    { id: '#043', status: 'ready', color: '#10b981' },
    { id: '#044', status: 'new', color: '#818cf8' },
  ];
  const bars = [38, 62, 44, 78, 52, 92, 68];
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 1.1, ease, delay: 0.5 }}
      style={{ background: '#0a0b14', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', boxShadow: '0 40px 90px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.08)', fontSize: 12, transformPerspective: 1000 }}
    >
      <div style={{ background: '#0c0d18', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {['#ef4444', '#f59e0b', '#10b981'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
        <span style={{ marginLeft: 8, color: '#9fa8ba', fontSize: 11 }}>Masala Matrix — Dashboard</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, color: '#10b981', fontSize: 11 }}>
          <Wifi size={10} /><span>Live</span>
        </div>
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{ width: 50, background: '#07080f', borderRight: '1px solid rgba(255,255,255,0.04)', padding: '14px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
          {[Grid, Utensils, Users, BarChart3, Package, Activity, ChefHat].map((Icon, i) => (
            <div key={i} style={{ width: 32, height: 32, borderRadius: 8, background: i === 0 ? 'linear-gradient(135deg,#6366f1,#a855f7)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={14} color={i === 0 ? 'white' : '#9fa8ba'} />
            </div>
          ))}
        </div>
        <div style={{ flex: 1, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {[{ label: 'Revenue', value: '₹24,850', color: '#10b981' }, { label: 'Orders', value: '47', color: '#818cf8' }, { label: 'Tables', value: '8/12', color: '#f59e0b' }].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 + i * 0.1 }} style={{ background: '#0c0d18', borderRadius: 8, padding: '8px 10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ color: '#9fa8ba', fontSize: 9, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                <div style={{ color: s.color, fontWeight: 700, fontSize: 15 }}>{s.value}</div>
              </motion.div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div style={{ background: '#0c0d18', borderRadius: 8, padding: 10, border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ color: '#b4bac8', fontSize: 9, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Floor Plan</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 4 }}>
                {tables.map(t => (
                  <div key={t.id} style={{ aspectRatio: '1', borderRadius: 4, background: `${sc[t.status]}18`, border: `1px solid ${sc[t.status]}45`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: sc[t.status], fontWeight: 700, fontSize: 9 }}>T{t.id}</div>
                ))}
              </div>
            </div>
            <div style={{ background: '#0c0d18', borderRadius: 8, padding: 10, border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ color: '#b4bac8', fontSize: 9, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Live Orders</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {orders.map((o, i) => (
                  <motion.div key={o.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 + i * 0.12 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 6px', borderRadius: 4, background: '#07080f' }}>
                    <span style={{ color: '#9fa8ba', fontSize: 9 }}>{o.id}</span>
                    <div style={{ padding: '2px 7px', borderRadius: 10, fontSize: 8, fontWeight: 700, background: `${o.color}22`, color: o.color }}>{o.status}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ background: '#0c0d18', borderRadius: 8, padding: 10, border: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: '#b4bac8', fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Weekly Revenue</span>
              <span style={{ color: '#10b981', fontSize: 9, fontWeight: 700 }}>+18.4%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 44 }}>
              {bars.map((h, i) => (
                <motion.div key={i} style={{ flex: 1, borderRadius: '3px 3px 0 0', transformOrigin: 'bottom', height: `${h}%`, background: i === 5 ? 'linear-gradient(to top,#6366f1,#a855f7)' : 'rgba(255,255,255,0.06)' }} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 1 + i * 0.07, duration: 0.45, ease: 'easeOut' }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Floating Badge ────────────────────────────────────────────────────────────
function FloatingBadge({ children, style }) {
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      style={{ position: 'absolute', background: '#0c0d18', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 50, padding: '7px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#a5b4fc', boxShadow: '0 8px 24px rgba(99,102,241,0.2)', zIndex: 20, whiteSpace: 'nowrap', ...style }}
    >{children}</motion.div>
  );
}

// ── Feature Card ──────────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, description, color = '#818cf8' }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -5, boxShadow: '0 20px 60px rgba(99,102,241,0.12)', borderColor: 'rgba(99,102,241,0.25)' }}
      style={{ background: '#0c0d18', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: 28, transition: 'border-color 0.3s, box-shadow 0.3s' }}
    >
      <motion.div whileHover={{ scale: 1.1, rotate: 4 }} transition={{ type: 'spring', stiffness: 300 }} style={{ width: 44, height: 44, borderRadius: 10, background: `${color}14`, border: `1px solid ${color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
        <Icon size={20} color={color} />
      </motion.div>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 9 }}>{title}</h3>
      <p style={{ color: '#b4bac8', fontSize: '0.85rem', lineHeight: 1.7 }}>{description}</p>
    </motion.div>
  );
}

// ── Process Step ──────────────────────────────────────────────────────────────
function ProcessStep({ number, title, description, isLast }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <div ref={ref} style={{ display: 'flex', gap: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <motion.div initial={{ scale: 0, opacity: 0 }} animate={inView ? { scale: 1, opacity: 1 } : {}} transition={{ type: 'spring', stiffness: 300, delay: number * 0.1 }} style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.95rem', flexShrink: 0 }}>
          {number}
        </motion.div>
        {!isLast && <motion.div initial={{ scaleY: 0 }} animate={inView ? { scaleY: 1 } : {}} transition={{ duration: 0.5, delay: number * 0.1 + 0.2 }} style={{ width: 2, flex: 1, background: 'linear-gradient(to bottom,rgba(99,102,241,0.3),transparent)', transformOrigin: 'top', marginTop: 4 }} />}
      </div>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.5, delay: number * 0.1 + 0.1 }} style={{ paddingBottom: isLast ? 0 : 36 }}>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 8 }}>{title}</h4>
        <p style={{ color: '#b4bac8', fontSize: '0.875rem', lineHeight: 1.65 }}>{description}</p>
      </motion.div>
    </div>
  );
}

// ── Marquee ───────────────────────────────────────────────────────────────────
function MarqueeStrip() {
  const items = ['🚀 Real-time Orders', '📊 AI Forecasting', '🍽️ KDS Integration', '💳 Payments', '👥 Staff Management', '📦 Inventory', '🗺️ Floor Plans', '📈 Analytics', '🤖 Chatbot AI', '🔒 Role-based Access'];
  return (
    <div style={{ overflow: 'hidden', background: '#0a0b14', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)', padding: '14px 0', position: 'relative' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 80, background: 'linear-gradient(to right,#0a0b14,transparent)', zIndex: 2 }} />
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, background: 'linear-gradient(to left,#0a0b14,transparent)', zIndex: 2 }} />
      <motion.div animate={{ x: [0, -50 * items.length] }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }} style={{ display: 'flex', gap: 0, width: 'max-content' }}>
        {[...items, ...items].map((item, i) => (
          <span key={i} style={{ color: '#2d3548', fontSize: '0.8rem', fontWeight: 600, padding: '0 28px', whiteSpace: 'nowrap' }}>{item}<span style={{ marginLeft: 28, color: '#1a1e2a' }}>•</span></span>
        ))}
      </motion.div>
    </div>
  );
}

// ── Animated POS Receipt ──────────────────────────────────────────────────────
function AnimatedReceipt() {
  const items = [
    { name: 'Butter Chicken', qty: 2, price: 360 },
    { name: 'Garlic Naan', qty: 4, price: 120 },
    { name: 'Dal Makhani', qty: 1, price: 180 },
    { name: 'Mango Lassi', qty: 2, price: 140 },
  ];
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, ease }}
      style={{ background: 'linear-gradient(180deg,#0f1220,#090a12)', borderRadius: 16, padding: '24px 20px', color: '#f9fafb', fontFamily: "'Courier New', monospace", position: 'relative', overflow: 'hidden', border: '1px solid rgba(99,102,241,0.18)', boxShadow: '0 30px 80px rgba(0,0,0,0.55), 0 0 42px rgba(99,102,241,0.12)' }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: 'repeating-linear-gradient(90deg,rgba(99,102,241,0.45) 0px,rgba(99,102,241,0.45) 8px,rgba(168,85,247,0.25) 8px,rgba(168,85,247,0.25) 10px)', borderBottom: '1px solid rgba(99,102,241,0.22)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 0%,rgba(99,102,241,0.12),transparent 42%)', pointerEvents: 'none' }} />
      <div style={{ textAlign: 'center', marginBottom: 14, marginTop: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.06em', color: '#f9fafb' }}>MASALA MATRIX</div>
        <div style={{ fontSize: 10, color: '#c3c8d4', marginTop: 2 }}>Table #5 · Rahul</div>
        <div style={{ fontSize: 10, color: '#b4bac8', marginTop: 2 }}>23 Apr 2026 · 7:45 PM</div>
      </div>
      <div style={{ borderTop: '1px dashed rgba(195,200,212,0.28)', borderBottom: '1px dashed rgba(195,200,212,0.28)', padding: '12px 0', marginBottom: 10 }}>
        {items.map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.4 + i * 0.18 }} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 11, marginBottom: 7 }}>
            <span style={{ color: '#d1d5db' }}>{item.qty}× {item.name}</span>
            <span style={{ fontWeight: 700, color: '#f9fafb' }}>₹{item.price}</span>
          </motion.div>
        ))}
      </div>
      {[['Subtotal', '₹800'], ['GST (5%)', '₹40']].map(([k, v]) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#b4bac8', marginBottom: 4 }}>
          <span>{k}</span><span>{v}</span>
        </div>
      ))}
      <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 1.3 }} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 900, borderTop: '1px solid rgba(99,102,241,0.24)', paddingTop: 8, marginTop: 6, color: '#f9fafb' }}>
        <span>TOTAL</span><span style={{ color: '#a5b4fc' }}>₹840</span>
      </motion.div>
      <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={inView ? { opacity: 1, scale: 1 } : {}} transition={{ delay: 1.6, type: 'spring', stiffness: 280 }} style={{ textAlign: 'center', marginTop: 14, padding: '8px 12px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)', borderRadius: 999, color: '#34d399', fontSize: 11, fontWeight: 800, letterSpacing: '0.04em', boxShadow: '0 4px 18px rgba(16,185,129,0.18)' }}>
        ✓ PAYMENT RECEIVED
      </motion.div>
    </motion.div>
  );
}

// ── Live Order Feed ───────────────────────────────────────────────────────────
function LiveOrderFeed() {
  const notifications = [
    { icon: Bell, color: '#818cf8', title: 'New Order #046', sub: 'Table 3 · 3 items', delay: 0 },
    { icon: Flame, color: '#ef4444', title: '#043 Ready!', sub: 'KDS → Waiting pickup', delay: 0.2 },
    { icon: CreditCard, color: '#10b981', title: 'Payment ₹1,240', sub: 'Table 7 · UPI · Done', delay: 0.4 },
    { icon: Timer, color: '#f59e0b', title: 'Table 2 · 42 min', sub: 'Average dine time', delay: 0.6 },
  ];
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {notifications.map((n, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: 28 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ delay: n.delay, duration: 0.5, ease }} whileHover={{ x: -3 }} style={{ background: '#0c0d18', border: '1px solid rgba(255,255,255,0.05)', borderLeft: `3px solid ${n.color}`, borderRadius: 10, padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `${n.color}14`, border: `1px solid ${n.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <n.icon size={14} color={n.color} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#f9fafb' }}>{n.title}</div>
            <div style={{ fontSize: 11, color: '#aab2c3', marginTop: 2 }}>{n.sub}</div>
          </div>
          <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity, delay: n.delay }} style={{ width: 7, height: 7, borderRadius: '50%', background: n.color, boxShadow: `0 0 7px ${n.color}`, flexShrink: 0 }} />
        </motion.div>
      ))}
    </div>
  );
}

// ── KDS Preview ───────────────────────────────────────────────────────────────
function KDSPreview() {
  const kdsOrders = [
    { id: '#046', items: ['Paneer Tikka ×2', 'Lassi ×1'], status: 'new', color: '#818cf8', elapsed: '0:32' },
    { id: '#044', items: ['Dal Tadka ×1', 'Butter Roti ×3'], status: 'cooking', color: '#f59e0b', elapsed: '4:12' },
    { id: '#041', items: ['Biryani ×2'], status: 'ready', color: '#10b981', elapsed: '8:55' },
  ];
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, scale: 0.93 }} animate={inView ? { opacity: 1, scale: 1 } : {}} transition={{ duration: 0.7, ease }} style={{ background: '#0a0b14', borderRadius: 14, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
      <div style={{ background: '#0c0d18', padding: '11px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Flame size={13} color="#f59e0b" /><span style={{ fontSize: 12, fontWeight: 700, color: '#f9fafb' }}>Kitchen Display</span>
        </div>
        <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ fontSize: 10, color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>● LIVE</motion.div>
      </div>
      <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {kdsOrders.map((order, i) => (
          <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.3 + i * 0.14 }} style={{ background: '#0c0d18', borderRadius: 9, border: `1px solid ${order.color}20`, borderLeft: `3px solid ${order.color}`, padding: '9px 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#f9fafb' }}>{order.id}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 10, color: '#aab2c3' }}>{order.elapsed}</span>
                <div style={{ padding: '2px 7px', borderRadius: 8, fontSize: 9, fontWeight: 700, background: `${order.color}16`, color: order.color }}>{order.status.toUpperCase()}</div>
              </div>
            </div>
            {order.items.map((item, j) => (
              <div key={j} style={{ fontSize: 11, color: '#b4bac8', marginBottom: 1 }}>· {item}</div>
            ))}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
export default function Home() {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 400], [0, -50]);

  return (
    <div>

      {/* ═══════════════════════════════════════ HERO ══════════════════════════ */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: 90, paddingBottom: 60, position: 'relative', overflow: 'hidden', background: '#0a0b14' }}>
        <HeroBg />
        <HeroGraphics />
        <div className="lp-container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 60, alignItems: 'center' }}>

            <motion.div style={{ y: heroY }}>
              <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 50, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', marginBottom: 24 }}>
                <Zap size={11} color="#a5b4fc" fill="#a5b4fc" />
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#a5b4fc', letterSpacing: '0.07em' }}>PERSONALIZED RESTAURANT TECHNOLOGY</span>
              </motion.div>
              <motion.h1 initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 0.15 }} style={{ fontSize: 'clamp(2.4rem,5vw,4.2rem)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-0.04em', marginBottom: 24 }}>
                Software that{' '}
                <motion.span initial={{ backgroundSize: '0% 3px' }} animate={{ backgroundSize: '100% 3px' }} transition={{ delay: 1.2, duration: 0.8 }} style={{ color: '#818cf8', backgroundImage: 'linear-gradient(#6366f1,#6366f1)', backgroundRepeat: 'no-repeat', backgroundPosition: '0 100%' }}>fits</motion.span>{' '}
                your restaurant.{' '}
                <span style={{ color: '#9fa8ba', marginTop:'1rem' }}>Not the other way.</span>
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease, delay: 0.3 }} style={{ color: '#b4bac8', fontSize: '1.05rem', lineHeight: 1.75, marginBottom: 36, maxWidth: 480 }}>
                From ordering to kitchens to payments — technology tailored to <em style={{ color: '#d1d5db' }}>your</em> unique workflow. Not the other way around.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease, delay: 0.45 }} style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                <motion.div style={{ display: 'inline-flex' }} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Link to="/contact" className="lp-btn lp-btn-primary" style={{ fontSize: '0.975rem', padding: '13px 28px', gap: 8, textDecoration: 'none' }}>
                    Request a Consultation <ArrowRight size={17} />
                  </Link>
                </motion.div>
                <motion.div style={{ display: 'inline-flex' }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link to="/process" className="lp-btn lp-btn-secondary" style={{ fontSize: '0.975rem', padding: '13px 28px', textDecoration: 'none' }}>
                    See How It Works
                  </Link>
                </motion.div>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} style={{ display: 'flex', gap: 32, marginTop: 40, flexWrap: 'wrap' }}>
                {[{ value: '200+', label: 'Restaurants' }, { value: '1M+', label: 'Orders Processed' }, { value: '99.9%', label: 'Uptime' }].map((s, i) => (
                  <div key={i}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{s.value}</div>
                    <div style={{ fontSize: '0.75rem', color: '#aab2c3', fontWeight: 500, marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <div style={{ position: 'relative', padding: '28px 24px 28px 28px' }}>
              <FloatingBadge style={{ top: 0, right: 16 }}>🟢 Live Orders</FloatingBadge>
              <FloatingBadge style={{ bottom: 50, left: 0 }}>📊 +18% Revenue</FloatingBadge>
              <FloatingBadge style={{ bottom: 0, right: 16 }}>⚡ KDS Synced</FloatingBadge>
              <DashboardMockup />
            </div>
          </div>
        </div>
      </section>

      <MarqueeStrip />

      {/* ═══════════════════════════════════════ STATS ═════════════════════════ */}
      <section style={{ padding: '80px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="lp-container">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger(0.12)} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 20 }}>
            {[
              { target: 200, suffix: '+', label: 'Restaurants Served', icon: Utensils, color: '#818cf8' },
              { target: 99, suffix: '%', label: 'Uptime Guarantee', icon: Zap, color: '#10b981' },
              { target: 42, suffix: '%', label: 'Avg Revenue Growth', icon: TrendingUp, color: '#f59e0b' },
              { target: 1000000, suffix: '+', label: 'Orders Processed', icon: Activity, color: '#a855f7' },
            ].map((s, i) => (
              <motion.div key={i} variants={scaleUp} whileHover={{ y: -4, boxShadow: `0 20px 50px ${s.color}12`, borderColor: `${s.color}28` }} style={{ background: '#0c0d18', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 14, padding: '28px 24px', textAlign: 'center', transition: 'border-color 0.3s, box-shadow 0.3s' }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: `${s.color}12`, border: `1px solid ${s.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <s.icon size={20} color={s.color} />
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: s.color, letterSpacing: '-0.04em', lineHeight: 1 }}>
                  <AnimatedCounter target={s.target} suffix={s.suffix} />
                </div>
                <div style={{ color: '#aab2c3', fontSize: '0.8rem', marginTop: 8, fontWeight: 500 }}>{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════ POS IN ACTION ═════════════════════ */}
      <section style={{ padding: '100px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', background: '#09090f' }}>
        <div className="lp-container">
          <SectionHeader badge="POS IN ACTION" title="From order to payment in seconds." subtitle="Watch how Masala Matrix handles a real table — from the moment a guest orders to the final receipt." />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 40, alignItems: 'start' }}>

            {/* Left column — richer context around the receipt */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Table info header */}
              <motion.div initial={{ opacity: 0, y: -16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ background: '#0c0d18', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Utensils size={16} color="#818cf8" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#f9fafb' }}>Table 5 · 4 Guests</div>
                  <div style={{ fontSize: 11, color: '#aab2c3', marginTop: 2 }}>Seated 7:20 PM · 32 min ago</div>
                </div>
                <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', flexShrink: 0 }} />
              </motion.div>

              {/* Receipt with glow */}
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', inset: -20, background: 'radial-gradient(circle,rgba(99,102,241,0.1),transparent 70%)', borderRadius: '50%', filter: 'blur(16px)', pointerEvents: 'none' }} />
                <AnimatedReceipt />
              </div>

              {/* Payment method picker */}
              <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }} style={{ background: '#0c0d18', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: '14px 18px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#aab2c3', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Payment Method</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[{ label: 'UPI', color: '#10b981', active: true }, { label: 'Card', color: '#818cf8', active: false }, { label: 'Cash', color: '#f59e0b', active: false }].map((m, i) => (
                    <div key={i} style={{ flex: 1, textAlign: 'center', padding: '9px 6px', borderRadius: 9, background: m.active ? `${m.color}12` : 'rgba(255,255,255,0.02)', border: `1px solid ${m.active ? `${m.color}30` : 'rgba(255,255,255,0.04)'}` }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: m.active ? m.color : '#9fa8ba' }}>{m.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bell size={13} color="white" />
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Live Notifications</span>
                </div>
                <LiveOrderFeed />
              </div>
              <KDSPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════ SOLUTIONS — 8 cards ═══════════════ */}
      <section id="solutions" style={{ padding: '100px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="lp-container">
          <SectionHeader badge="FULL ECOSYSTEM" title="A Solution, Not Just a Product." subtitle="Masala Matrix is a custom-configured ecosystem built around how your restaurant actually runs. Nothing extra, nothing missing." />
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={stagger(0.07)} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16 }}>
            {[
              { icon: Grid,        title: 'Tailored POS',          description: 'Built for your peak hour volume and menu complexity — not a generic template.' },
              { icon: Layout,      title: 'Interactive Seating',   description: 'Dynamic floor plans that mirror your actual physical table layout in real-time.' },
              { icon: Cpu,         title: 'Custom KDS',            description: 'Sync front-of-house with specialized kitchen stations for your specific cuisine.' },
              { icon: LineChart,   title: 'AI Forecasting',        description: 'Predict future demand to optimize staff scheduling and inventory levels.' },
              { icon: ShieldCheck, title: 'Secure Cloud',          description: 'Enterprise-grade security with real-time backups and 99.9% uptime SLA.' },
              { icon: Users,       title: 'CRM & Growth',          description: 'Understand your regulars and drive return visits with targeted loyalty campaigns.' },
              { icon: Package,     title: 'Inventory Management',  description: 'Auto-deduct stock on every order, track waste, and get low-stock alerts instantly.' },
              { icon: Globe,       title: 'Multi-Outlet Control',  description: 'Manage every branch from one dashboard — menus, staff, reports, and more.' },
            ].map((f, i) => <FeatureCard key={i} {...f} />)}
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} style={{ textAlign: 'center', marginTop: 44 }}>
            <Link to="/features" className="lp-btn lp-btn-secondary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Explore All Features <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════ WHY US ═════════════════════════ */}
      <section id="why-us" style={{ padding: '100px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', background: '#09090f' }}>
        <div className="lp-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 64, alignItems: 'center' }}>
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger(0.12)}>
              <motion.div variants={fadeIn} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 50, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', marginBottom: 20 }}>
                <Sparkles size={11} color="#a5b4fc" />
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#a5b4fc', letterSpacing: '0.07em' }}>OUR EDGE</span>
              </motion.div>
              <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(1.8rem,3.5vw,2.5rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: 20, letterSpacing: '-0.03em' }}>
                Most software forces you to change.{' '}<span style={{ color: '#818cf8' }}>We don't.</span>
              </motion.h2>
              <motion.p variants={fadeUp} style={{ color: '#b4bac8', fontSize: '1rem', lineHeight: 1.75, marginBottom: 32 }}>
                We don't sell "one-size-fits-all" tools. We observe, understand, and engineer systems tailored to how your restaurant actually runs.
              </motion.p>
              <motion.div variants={stagger(0.1)} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['Your restaurant layout', 'Kitchen workflow & stations', 'Staff roles & permissions', 'Payment preferences'].map((item, i) => (
                  <motion.div key={i} variants={fadeUp} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <CheckCircle2 size={13} color="#818cf8" />
                    </div>
                    <span style={{ fontWeight: 500, color: '#d1d5db', fontSize: '0.925rem' }}>{item}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger(0.15)} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignItems: 'start' }}>
              {[
                { icon: Users, label: 'Customer Flow', value: '↑ 34%', color: '#818cf8', offset: 0 },
                { icon: BarChart3, label: 'Order Volume', value: '↑ 28%', color: '#10b981', offset: 28 },
                { icon: Clock, label: 'Table Turnover', value: '↑ 22%', color: '#f59e0b', offset: 14 },
                { icon: DollarSign, label: 'Revenue/Table', value: '↑ 41%', color: '#a855f7', offset: 42 },
              ].map((card, i) => (
                <motion.div key={i} variants={scaleUp} whileHover={{ y: -6, boxShadow: `0 20px 50px ${card.color}18`, borderColor: `${card.color}28` }} style={{ background: '#0c0d18', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 14, padding: 24, textAlign: 'center', marginTop: card.offset, transition: 'border-color 0.3s, box-shadow 0.3s' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${card.color}12`, border: `1px solid ${card.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <card.icon size={18} color={card.color} />
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: card.color, letterSpacing: '-0.03em' }}>{card.value}</div>
                  <div style={{ fontSize: '0.75rem', color: '#aab2c3', marginTop: 5, fontWeight: 500 }}>{card.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ PROCESS ═══════════════════════ */}
      <section id="process" style={{ padding: '100px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="lp-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 64, alignItems: 'flex-start' }}>
            <div>
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger(0.1)}>
                <motion.div variants={fadeIn} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 50, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', marginBottom: 20 }}>
                  <Sparkles size={11} color="#a5b4fc" />
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#a5b4fc', letterSpacing: '0.07em' }}>OUR APPROACH</span>
                </motion.div>
                <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(1.8rem,3.5vw,2.5rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: 16, letterSpacing: '-0.03em' }}>How we make it work</motion.h2>
                <motion.p variants={fadeUp} style={{ color: '#b4bac8', fontSize: '1rem', lineHeight: 1.75, marginBottom: 48 }}>A systematic process to build technology that truly fits — every time.</motion.p>
              </motion.div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {[
                  { title: 'Observe', description: 'We study your operations end-to-end before writing a single line of code.' },
                  { title: 'Design', description: 'We map every workflow that removes friction from your daily service.' },
                  { title: 'Build', description: 'We configure and customize the system specifically for your team.' },
                  { title: 'Deploy', description: 'We onboard staff, test during live hours, and refine in real-time.' },
                  { title: 'Scale', description: 'As you grow, Masala Matrix evolves with you — no rebuilds, no compromises.', isLast: true },
                ].map((step, i) => <ProcessStep key={i} number={i + 1} {...step} />)}
              </div>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} style={{ marginTop: 32 }}>
                <Link to="/process" className="lp-btn lp-btn-secondary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  See Detailed Process <ArrowRight size={16} />
                </Link>
              </motion.div>
            </div>
            <div style={{ position: 'sticky', top: 100 }}>
              <motion.div initial={{ opacity: 0, scale: 0.92 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, ease }} style={{ background: '#0c0d18', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 20, padding: 40, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', bottom: -60, left: '50%', transform: 'translateX(-50%)', width: '90%', height: 200, background: 'radial-gradient(ellipse, rgba(99,102,241,0.18), transparent 70%)', pointerEvents: 'none' }} />
                <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }} style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <Rocket size={28} color="white" />
                </motion.div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 12 }}>Built for Scale</h3>
                <p style={{ color: '#b4bac8', lineHeight: 1.75, marginBottom: 28, fontSize: '0.9rem' }}>Whether you run 1 location or 50, the system scales cleanly without adding complexity.</p>
                <Link to="/contact" className="lp-btn lp-btn-primary" style={{ width: '100%', justifyContent: 'center', fontWeight: 700, textDecoration: 'none', display: 'flex' }}>
                  Talk to a Consultant <ArrowRight size={16} style={{ marginLeft: 6 }} />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════ TESTIMONIALS ══════════════════════ */}
      <section style={{ padding: '100px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', background: '#09090f' }}>
        <div className="lp-container">
          <SectionHeader badge="CUSTOMER STORIES" title="Trusted by restaurant owners." subtitle="Hear what our customers say about how Masala Matrix transformed their operations." />
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={stagger(0.15)} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
            {[
              { quote: 'We used the POS data to identify which slow-day items to promote via Instagram. Our revenue jumped 42% in the first two months.', name: 'Arjun Mehta', role: 'Owner, The Tandoor House', rating: 5 },
              { quote: 'The KDS alone saved us 15 minutes per service. Our kitchen team finally knows exactly what to cook and when.', name: 'Priya Sharma', role: 'Head Chef, Spice Route', rating: 5 },
              { quote: "Setup was fast, staff trained in a day. Masala Matrix felt like it was built just for our dhaba — because it was.", name: "Ramesh Verma", role: "Owner, Verma's Dhaba", rating: 5 },
            ].map((t, i) => (
              <motion.div key={i} variants={scaleUp} whileHover={{ y: -4, borderColor: 'rgba(255,255,255,0.1)' }} style={{ background: '#0c0d18', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: 28, transition: 'border-color 0.3s' }}>
                <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
                  {Array.from({ length: t.rating }).map((_, j) => <Star key={j} size={13} color="#f59e0b" fill="#f59e0b" />)}
                </div>
                <Quote size={18} color="rgba(99,102,241,0.18)" style={{ marginBottom: 12 }} />
                <p style={{ color: '#c3c8d4', fontSize: '0.875rem', lineHeight: 1.8, marginBottom: 20, fontStyle: 'italic' }}>{t.quote}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 16 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>{t.name[0]}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{t.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#aab2c3' }}>{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═════════════════════════════════ PRICING PREVIEW ═════════════════════ */}
      <section id="pricing" style={{ padding: '100px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="lp-container">
          <SectionHeader badge="PRICING" title="Flexible plans for every size." subtitle="Custom configuration included in every plan. No hidden fees." />
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={stagger(0.15)} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 20, maxWidth: 960, margin: '0 auto' }}>
            {[
              { tier: 'Core', subtitle: 'For Single-Outlet Restaurants', features: ['Custom POS Configuration', 'Dine-in / Takeaway Workflows', 'Basic Inventory Control', 'Standard Analytics', '24/7 Priority Support'], popular: false },
              { tier: 'Growth', subtitle: 'For Growing Multi-Unit Brands', features: ['Everything in Core', 'Advanced KDS Sync', 'Social Growth Marketing', 'Centralized Management', 'AI Demand Forecasting'], popular: true },
              { tier: 'Scale', subtitle: 'For Enterprises & Franchises', features: ['Custom Enterprise Solutions', 'Franchise Management', 'Dedicated Growth Partner', 'White-label Option', 'Open API Access'], popular: false },
            ].map((p, i) => (
              <motion.div key={i} variants={fadeUp} whileHover={{ y: p.popular ? -10 : -5, boxShadow: p.popular ? '0 30px 80px rgba(99,102,241,0.18)' : '0 20px 50px rgba(0,0,0,0.3)', borderColor: p.popular ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)' }} style={{ background: '#0c0d18', border: p.popular ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 32, position: 'relative', display: 'flex', flexDirection: 'column', transition: 'border-color 0.3s, box-shadow 0.3s' }}>
                {p.popular && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.6 }} style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#6366f1,#a855f7)', color: 'white', fontSize: '0.68rem', fontWeight: 800, padding: '5px 14px', borderRadius: 50, letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>★ MOST POPULAR</motion.div>}
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 6 }}>{p.tier}</h3>
                <p style={{ color: '#aab2c3', fontSize: '0.85rem', marginBottom: 24 }}>{p.subtitle}</p>
                <ul style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  {p.features.map((f, j) => (
                    <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <CheckCircle2 size={14} color="#6366f1" style={{ marginTop: 2, flexShrink: 0 }} />
                      <span style={{ color: '#c3c8d4', fontSize: '0.85rem' }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/contact" className={`lp-btn ${p.popular ? 'lp-btn-primary' : 'lp-btn-secondary'}`} style={{ justifyContent: 'center', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {p.tier === 'Scale' ? 'Contact Sales' : 'Get Started'} <ArrowRight size={14} />
                </Link>
              </motion.div>
            ))}
          </motion.div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} style={{ textAlign: 'center', marginTop: 28 }}>
            <Link to="/pricing" className="lp-nav-link" style={{ fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              View full pricing comparison <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════ CTA — Crypton panel ════════════════════════════════ */}
      <section style={{ padding: '80px 0 100px' }}>
        <div className="lp-container">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease }}
            style={{ background: '#0a0b14', border: '1px solid rgba(99,102,241,0.12)', borderRadius: 24, padding: 'clamp(48px,8vw,80px)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}
          >
            <div style={{ position: 'absolute', bottom: -80, left: '50%', transform: 'translateX(-50%)', width: '85%', height: 300, background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.28) 0%, rgba(168,85,247,0.12) 45%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: 0, left: '12%', right: '12%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.65) 30%, rgba(168,85,247,0.65) 70%, transparent)' }} />
            <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ type: 'spring', delay: 0.2 }} style={{ width: 60, height: 60, borderRadius: 16, background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
              <Rocket size={26} color="white" />
            </motion.div>
            <h2 style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 900, marginBottom: 16, lineHeight: 1.15, letterSpacing: '-0.03em', maxWidth: 680, margin: '0 auto 16px' }}>
              Tired of adjusting your restaurant to fit software?
            </h2>
            <p style={{ color: '#b4bac8', fontSize: '1.05rem', maxWidth: 500, margin: '16px auto 36px' }}>
              It's time for software that <em style={{ color: '#a5b4fc' }}>fits you.</em> Let's talk.
            </p>
            <motion.div style={{ display: 'inline-flex' }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link to="/contact" className="lp-btn lp-btn-primary" style={{ fontSize: '1.05rem', padding: '15px 40px', gap: 10, textDecoration: 'none' }}>
                Book a Free Demo <ArrowRight size={19} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
