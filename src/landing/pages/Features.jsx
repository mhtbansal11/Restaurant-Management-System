import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Grid, Layout, Cpu, LineChart, ShieldCheck, Users,
  DollarSign, Package, ArrowRight, CheckCircle2, Zap,
  ChefHat, BarChart3, Activity, MessageSquare, Clock, Wifi
} from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import { fadeUp, fadeIn, stagger, scaleUp, slideLeft, slideRight, ease } from '../utils/animations';

const modules = [
  {
    icon: Grid,
    color: '#818cf8',
    title: 'Point of Sale (POS)',
    subtitle: 'Built for your peak-hour reality',
    description: 'No generic POS. We configure it around your menu complexity, order volume, and billing flow — dine-in, takeaway, and delivery all in one.',
    features: ['Custom menu layout & categories', 'Table-wise billing & split bills', 'Takeaway & packing order flow', 'Discount, coupon & tax configuration', 'Offline mode with auto-sync', 'Role-based POS access'],
  },
  {
    icon: Layout,
    color: '#8b5cf6',
    title: 'Seating & Floor Plans',
    subtitle: 'Your real floor, digitized',
    description: 'Drag-and-drop floor plan editor that mirrors your exact physical layout. Real-time occupancy, merging tables, and reservation support.',
    features: ['Drag & drop floor plan builder', 'Real-time table status (available, occupied, reserved)', 'Table merge for large groups', 'Section-wise management', 'Reservation & waitlist support', 'Visual seating preview for staff'],
  },
  {
    icon: Cpu,
    color: '#f59e0b',
    title: 'Kitchen Display System (KDS)',
    subtitle: 'Zero ticket confusion in the kitchen',
    description: 'Real-time order queue synced from the POS to your kitchen stations. Color-coded priorities, timers, and station-specific views for your cuisine.',
    features: ['Real-time order push from POS', 'Color-coded priority queues', 'Per-station filtering (grill, fry, drinks)', 'Timer-based order tracking', 'Bump & recall functionality', 'KDS on any screen or tablet'],
  },
  {
    icon: Package,
    color: '#10b981',
    title: 'Inventory Management',
    subtitle: 'Never run out mid-service again',
    description: 'Auto-deduct stock on every order. Get alerted before you run out. Track waste, manage suppliers, and see real cost-per-dish.',
    features: ['Auto stock deduction on orders', 'Low stock threshold alerts', 'Category & unit-based tracking', 'Waste logging & reporting', 'Supplier management', 'Raw material vs. finished goods'],
  },
  {
    icon: Users,
    color: '#ec4899',
    title: 'Staff & Role Management',
    subtitle: 'Right access for every role',
    description: 'Granular role-based access control. Kitchen staff see only orders. Finance sees only reports. Management sees everything.',
    features: ['5 built-in role profiles (Management, Kitchen, POS, Finance, Front Desk)', 'Custom permission sets', 'Staff attendance & shift tracking', 'Profile photos & Aadhaar upload', 'Activity logs per staff', 'Multi-outlet staff visibility'],
  },
  {
    icon: DollarSign,
    color: '#f59e0b',
    title: 'Payments & Billing',
    subtitle: 'Every payment method, handled',
    description: 'Cash, UPI, card — all tracked and reconciled. Daily sales reports, shift-wise closing, and GST-ready invoicing.',
    features: ['Cash, UPI & card payment logging', 'Split payment support', 'GST-compliant invoice generation', 'Daily shift close reports', 'Refund & void tracking', 'Payment method analytics'],
  },
  {
    icon: LineChart,
    color: '#818cf8',
    title: 'Analytics & Reports',
    subtitle: 'Data that tells you what to do next',
    description: 'From best-selling items to peak hour heatmaps — understand your restaurant\'s performance at a glance with AI-powered insights.',
    features: ['Revenue & profit/loss reports', 'Best-selling items dashboard', 'Peak hour heatmap', 'Staff performance metrics', 'Customer repeat rate', 'Export to PDF / CSV'],
  },
  {
    icon: Activity,
    color: '#8b5cf6',
    title: 'AI Forecasting & Chatbot',
    subtitle: 'Intelligence built into operations',
    description: 'Predict tomorrow\'s demand, auto-suggest staff scheduling, and get an AI assistant that answers operational questions in plain language.',
    features: ['7-day demand forecasting', 'Inventory reorder suggestions', 'AI operational chatbot', 'Sales trend detection', 'Anomaly alerts', 'Natural language query support'],
  },
];

function ModuleCard({ mod, index }) {
  const isEven = index % 2 === 0;
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      variants={stagger(0.1)}
      style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 60, alignItems: 'center', padding: '64px 0', borderBottom: '1px solid #1f2937' }}
    >
      {/* Text side */}
      <motion.div variants={isEven ? slideLeft : slideRight} style={{ order: isEven ? 0 : 1 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: `${mod.color}18`, border: `1px solid ${mod.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <mod.icon size={20} color={mod.color} />
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: mod.color, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Module</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f9fafb' }}>{mod.title}</div>
          </div>
        </div>
        <h3 style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 800, marginBottom: 12, letterSpacing: '-0.03em', lineHeight: 1.2 }}>{mod.subtitle}</h3>
        <p style={{ color: '#9ca3af', fontSize: '1rem', lineHeight: 1.75, marginBottom: 28 }}>{mod.description}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px' }}>
          {mod.features.map((f, i) => (
            <motion.div key={i} variants={fadeUp} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <CheckCircle2 size={14} color={mod.color} style={{ marginTop: 3, flexShrink: 0 }} />
              <span style={{ color: '#d1d5db', fontSize: '0.85rem', lineHeight: 1.5 }}>{f}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Visual side */}
      <motion.div variants={isEven ? slideRight : slideLeft} style={{ order: isEven ? 1 : 0 }}>
        <motion.div
          whileHover={{ y: -8, boxShadow: `0 40px 80px ${mod.color}18` }}
          style={{ background: 'linear-gradient(160deg,#111827,#0d1117)', border: `1px solid ${mod.color}22`, borderRadius: 20, padding: 36, position: 'relative', overflow: 'hidden' }}
        >
          <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, background: `radial-gradient(circle,${mod.color}12,transparent 70%)`, borderRadius: '50%' }} />
          <div style={{ width: 56, height: 56, borderRadius: 16, background: `linear-gradient(135deg,${mod.color},${mod.color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <mod.icon size={26} color="white" />
          </div>
          <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16 }}>{mod.title}</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {mod.features.slice(0, 4).map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#0b0f19', borderRadius: 8, border: '1px solid #1f2937' }}
              >
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: mod.color, flexShrink: 0 }} />
                <span style={{ color: '#9ca3af', fontSize: '0.83rem' }}>{f}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default function Features() {
  return (
    <div>
      {/* Hero */}
      <section style={{ paddingTop: 130, paddingBottom: 80, position: 'relative', overflow: 'hidden', borderBottom: '1px solid #1f2937' }}>
        <motion.div animate={{ scale:[1,1.2,1],opacity:[0.2,0.4,0.2] }} transition={{ duration:7,repeat:Infinity }} style={{ position:'absolute',top:'20%',left:'50%',transform:'translateX(-50%)',width:600,height:600,background:'radial-gradient(circle,#6366f10d,transparent 70%)',borderRadius:'50%',filter:'blur(40px)',pointerEvents:'none' }} />
        <div className="lp-container" style={{ textAlign: 'center' }}>
          <motion.div initial={{ opacity:0,scale:0.8 }} animate={{ opacity:1,scale:1 }} transition={{ duration:0.5 }} style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'7px 14px',borderRadius:20,background:'#312e8122',border:'1px solid #6366f144',marginBottom:24 }}>
            <Zap size={12} color="#a5b4fc" fill="#a5b4fc" />
            <span style={{ fontSize:'0.75rem',fontWeight:700,color:'#a5b4fc',letterSpacing:'0.06em' }}>FULL FEATURE BREAKDOWN</span>
          </motion.div>
          <motion.h1 initial={{ opacity:0,y:40 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.8,ease,delay:0.1 }} style={{ fontSize:'clamp(2.5rem,5vw,4rem)',fontWeight:900,lineHeight:1.08,letterSpacing:'-0.04em',marginBottom:20,maxWidth:800,margin:'0 auto 20px' }}>
            Every module your restaurant needs.
          </motion.h1>
          <motion.p initial={{ opacity:0,y:30 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.7,ease,delay:0.25 }} style={{ color:'#9ca3af',fontSize:'1.15rem',lineHeight:1.7,maxWidth:560,margin:'0 auto 40px' }}>
            8 tightly integrated modules — each configured to match your restaurant's exact workflow.
          </motion.p>
          <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.6,ease,delay:0.4 }} style={{ display:'flex',justifyContent:'center',flexWrap:'wrap',gap:14 }}>
            <motion.div whileHover={{ scale:1.05,boxShadow:'0 0 36px rgba(37,99,235,0.5)' }} whileTap={{ scale:0.97 }}>
              <Link to="/contact" className="lp-btn lp-btn-primary" style={{ fontSize:'1rem',padding:'14px 28px',gap:8,textDecoration:'none',display:'inline-flex',alignItems:'center' }}>
                Request a Demo <ArrowRight size={18} />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}>
              <Link to="/pricing" className="lp-btn lp-btn-secondary" style={{ fontSize:'1rem',padding:'14px 28px',textDecoration:'none',display:'inline-flex',alignItems:'center' }}>
                View Pricing
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Module icons strip */}
        <motion.div initial="hidden" animate="show" variants={stagger(0.07)} style={{ display:'flex',justifyContent:'center',flexWrap:'wrap',gap:12,marginTop:56,maxWidth:700,margin:'56px auto 0' }}>
          {modules.map((m,i) => (
            <motion.div key={i} variants={scaleUp} whileHover={{ scale:1.08,y:-4 }} style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:6,padding:'14px 16px',background:'#111827',border:'1px solid #1f2937',borderRadius:12,cursor:'default',minWidth:80 }}>
              <div style={{ width:32,height:32,borderRadius:8,background:`${m.color}18`,border:`1px solid ${m.color}33`,display:'flex',alignItems:'center',justifyContent:'center' }}>
                <m.icon size={16} color={m.color} />
              </div>
              <span style={{ fontSize:'0.7rem',fontWeight:600,color:'#9ca3af',textAlign:'center',lineHeight:1.3 }}>{m.title.split(' ')[0]}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Module Sections */}
      <section style={{ padding: '0 0 80px' }}>
        <div className="lp-container">
          {modules.map((mod, i) => (
            <ModuleCard key={i} mod={mod} index={i} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 0', background: '#0d1117', borderTop: '1px solid #1f2937' }}>
        <div className="lp-container">
          <motion.div initial={{ opacity:0,y:40 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ duration:0.7,ease }} style={{ background:'linear-gradient(135deg,#312e8122,#a855f718)',border:'1px solid #6366f133',borderRadius:20,padding:'56px 40px',textAlign:'center' }}>
            <h2 style={{ fontSize:'clamp(1.6rem,3.5vw,2.4rem)',fontWeight:800,marginBottom:12,letterSpacing:'-0.03em' }}>Ready to see it in action?</h2>
            <p style={{ color:'#9ca3af',fontSize:'1rem',marginBottom:32 }}>We'll walk you through every module live — for your specific restaurant type.</p>
            <motion.div whileHover={{ scale:1.05 }} whileTap={{ scale:0.97 }}>
              <Link to="/contact" className="lp-btn lp-btn-primary" style={{ fontSize:'1rem',padding:'14px 28px',gap:8,textDecoration:'none',display:'inline-flex',alignItems:'center' }}>
                Book a Free Demo <ArrowRight size={18} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
