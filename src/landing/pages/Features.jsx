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
        <p style={{ color: '#c3c8d4', fontSize: '1rem', lineHeight: 1.75, marginBottom: 28 }}>{mod.description}</p>
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
                <span style={{ color: '#c3c8d4', fontSize: '0.83rem' }}>{f}</span>
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
        {/* Atmospheric background */}
        <div style={{ position:'absolute',inset:0,pointerEvents:'none',zIndex:0 }}>
          <div style={{ position:'absolute',inset:0,backgroundImage:'radial-gradient(rgba(99,102,241,0.06) 1px,transparent 1px)',backgroundSize:'38px 38px' }} />
          <div style={{ position:'absolute',bottom:-80,left:'50%',transform:'translateX(-50%)',width:'100%',height:400,background:'radial-gradient(ellipse 70% 80% at 50% 100%,rgba(99,102,241,0.18) 0%,rgba(168,85,247,0.08) 50%,transparent 70%)' }} />
          <svg style={{ position:'absolute',inset:0,width:'100%',height:'100%' }} preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="fl1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6366f1" stopOpacity="0.12"/><stop offset="100%" stopColor="#a855f7" stopOpacity="0.03"/></linearGradient>
              <linearGradient id="fl2" x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#a855f7" stopOpacity="0.1"/><stop offset="100%" stopColor="#6366f1" stopOpacity="0.02"/></linearGradient>
            </defs>
            <line x1="0" y1="60%" x2="25%" y2="0" stroke="url(#fl1)" strokeWidth="1"/>
            <line x1="5%" y1="100%" x2="20%" y2="50%" stroke="url(#fl1)" strokeWidth="0.5"/>
            <line x1="100%" y1="40%" x2="75%" y2="100%" stroke="url(#fl2)" strokeWidth="1"/>
            <line x1="95%" y1="0" x2="80%" y2="45%" stroke="url(#fl2)" strokeWidth="0.5"/>
          </svg>
          {/* Floating module preview chips */}
          <motion.div initial={{ opacity:0,y:-12 }} animate={{ opacity:0.7,y:0 }} transition={{ delay:1,duration:0.8 }}>
            <motion.div animate={{ y:[0,-6,0] }} transition={{ duration:5,repeat:Infinity,ease:'easeInOut' }} style={{ position:'absolute',left:32,top:'30%',background:'rgba(9,10,18,0.9)',backdropFilter:'blur(12px)',border:'1px solid rgba(99,102,241,0.22)',borderRadius:10,padding:'10px 14px',display:'flex',alignItems:'center',gap:10 }}>
              <div style={{ width:28,height:28,borderRadius:7,background:'rgba(99,102,241,0.15)',border:'1px solid rgba(99,102,241,0.3)',display:'flex',alignItems:'center',justifyContent:'center' }}><Grid size={13} color="#818cf8"/></div>
              <div><div style={{ fontSize:10,fontWeight:700,color:'#f9fafb' }}>POS Live</div><div style={{ fontSize:8,color:'#10b981' }}>● 47 orders today</div></div>
            </motion.div>
          </motion.div>
          <motion.div initial={{ opacity:0,y:12 }} animate={{ opacity:0.65,y:0 }} transition={{ delay:1.5,duration:0.8 }}>
            <motion.div animate={{ y:[0,-7,0] }} transition={{ duration:6,repeat:Infinity,ease:'easeInOut',delay:1.5 }} style={{ position:'absolute',left:32,top:'55%',background:'rgba(9,10,18,0.9)',backdropFilter:'blur(12px)',border:'1px solid rgba(16,185,129,0.22)',borderRadius:10,padding:'10px 14px',display:'flex',alignItems:'center',gap:10 }}>
              <div style={{ width:28,height:28,borderRadius:7,background:'rgba(16,185,129,0.12)',border:'1px solid rgba(16,185,129,0.28)',display:'flex',alignItems:'center',justifyContent:'center' }}><Package size={13} color="#10b981"/></div>
              <div><div style={{ fontSize:10,fontWeight:700,color:'#f9fafb' }}>Inventory</div><div style={{ fontSize:8,color:'#f59e0b' }}>⚠ Rice: low stock</div></div>
            </motion.div>
          </motion.div>
          <motion.div initial={{ opacity:0,x:12 }} animate={{ opacity:0.6,x:0 }} transition={{ delay:2,duration:0.8 }}>
            <motion.div animate={{ y:[0,-5,0] }} transition={{ duration:5.5,repeat:Infinity,ease:'easeInOut',delay:0.8 }} style={{ position:'absolute',right:32,top:'25%',background:'rgba(9,10,18,0.9)',backdropFilter:'blur(12px)',border:'1px solid rgba(168,85,247,0.22)',borderRadius:10,padding:'10px 14px',display:'flex',alignItems:'center',gap:10 }}>
              <div style={{ width:28,height:28,borderRadius:7,background:'rgba(168,85,247,0.12)',border:'1px solid rgba(168,85,247,0.28)',display:'flex',alignItems:'center',justifyContent:'center' }}><Activity size={13} color="#a855f7"/></div>
              <div><div style={{ fontSize:10,fontWeight:700,color:'#f9fafb' }}>AI Forecast</div><div style={{ fontSize:8,color:'#a855f7' }}>↑ Busy Fri evening</div></div>
            </motion.div>
          </motion.div>
        </div>
        <div className="lp-container" style={{ textAlign: 'center' }}>
          <motion.div initial={{ opacity:0,scale:0.8 }} animate={{ opacity:1,scale:1 }} transition={{ duration:0.5 }} style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'7px 14px',borderRadius:20,background:'#312e8122',border:'1px solid #6366f144',marginBottom:24 }}>
            <Zap size={12} color="#a5b4fc" fill="#a5b4fc" />
            <span style={{ fontSize:'0.75rem',fontWeight:700,color:'#a5b4fc',letterSpacing:'0.06em' }}>FULL FEATURE BREAKDOWN</span>
          </motion.div>
          <motion.h1 initial={{ opacity:0,y:40 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.8,ease,delay:0.1 }} style={{ fontSize:'clamp(2.5rem,5vw,4rem)',fontWeight:900,lineHeight:1.08,letterSpacing:'-0.04em',marginBottom:20,maxWidth:800,margin:'0 auto 20px' }}>
            Every module your restaurant needs.
          </motion.h1>
          <motion.p initial={{ opacity:0,y:30 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.7,ease,delay:0.25 }} style={{ color:'#c3c8d4',fontSize:'1.15rem',lineHeight:1.7,maxWidth:560,margin:'0 auto 40px' }}>
            8 tightly integrated modules — each configured to match your restaurant's exact workflow.
          </motion.p>
          <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.6,ease,delay:0.4 }} style={{ display:'flex',justifyContent:'center',flexWrap:'wrap',gap:14 }}>
            <motion.div style={{ display:'inline-flex' }} whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}>
              <Link to="/contact" className="lp-btn lp-btn-primary" style={{ fontSize:'1rem',padding:'14px 28px',gap:8,textDecoration:'none',display:'inline-flex',alignItems:'center' }}>
                Request a Demo <ArrowRight size={18} />
              </Link>
            </motion.div>
            <motion.div style={{ display:'inline-flex' }} whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}>
              <Link to="/pricing" className="lp-btn lp-btn-secondary" style={{ fontSize:'1rem',padding:'14px 28px',textDecoration:'none',display:'inline-flex',alignItems:'center' }}>
                View Pricing
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Module icons strip — single horizontal line */}
        <div style={{ overflowX:'auto',overflowY:'visible',scrollbarWidth:'none',WebkitOverflowScrolling:'touch',marginTop:56,paddingTop:12,paddingBottom:4 }}>
          <motion.div initial="hidden" animate="show" variants={stagger(0.07)} style={{ display:'flex',flexWrap:'nowrap',gap:12,width:'max-content',margin:'0 auto',padding:'0 24px' }}>
            {modules.map((m,i) => (
              <motion.div key={i} variants={scaleUp} whileHover={{ scale:1.08,y:-4 }} style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:6,padding:'14px 16px',background:'#111827',border:'1px solid #1f2937',borderRadius:12,cursor:'default',minWidth:90,flexShrink:0 }}>
                <div style={{ width:32,height:32,borderRadius:8,background:`${m.color}18`,border:`1px solid ${m.color}33`,display:'flex',alignItems:'center',justifyContent:'center' }}>
                  <m.icon size={16} color={m.color} />
                </div>
                <span style={{ fontSize:'0.7rem',fontWeight:600,color:'#c3c8d4',textAlign:'center',lineHeight:1.3,whiteSpace:'nowrap' }}>{m.title.split(' ')[0]}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Module Sections */}
      <section style={{ padding: '0 0 80px' }}>
        <div className="lp-container">
          {modules.map((mod, i) => (
            <ModuleCard key={i} mod={mod} index={i} />
          ))}
        </div>
      </section>

      {/* CTA — Crypton panel */}
      <section style={{ padding: '80px 0', background: '#07080f', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="lp-container">
          <motion.div
            initial={{ opacity:0,y:40 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ duration:0.7,ease }}
            style={{ background:'#0a0b14',border:'1px solid rgba(99,102,241,0.12)',borderRadius:24,padding:'72px 40px',textAlign:'center',position:'relative',overflow:'hidden' }}
          >
            {/* Bottom purple radial glow */}
            <div style={{ position:'absolute',bottom:-100,left:'50%',transform:'translateX(-50%)',width:700,height:320,background:'radial-gradient(ellipse at center,rgba(99,102,241,0.28) 0%,rgba(168,85,247,0.12) 40%,transparent 70%)',pointerEvents:'none',zIndex:0 }} />
            {/* Horizontal glow line */}
            <div style={{ position:'absolute',bottom:0,left:'10%',right:'10%',height:1,background:'linear-gradient(90deg,transparent,rgba(99,102,241,0.65) 30%,rgba(168,85,247,0.65) 70%,transparent)',pointerEvents:'none',zIndex:0 }} />
            {/* Subtle top accent */}
            <div style={{ position:'absolute',top:0,left:'30%',right:'30%',height:1,background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)',pointerEvents:'none',zIndex:0 }} />

            <div style={{ position:'relative',zIndex:1 }}>
              <motion.div initial={{ opacity:0,scale:0.8 }} whileInView={{ opacity:1,scale:1 }} viewport={{ once:true }} transition={{ duration:0.5 }} style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'6px 14px',borderRadius:20,background:'rgba(99,102,241,0.12)',border:'1px solid rgba(99,102,241,0.25)',marginBottom:24 }}>
                <Zap size={11} color="#a5b4fc" fill="#a5b4fc" />
                <span style={{ fontSize:'0.72rem',fontWeight:700,color:'#a5b4fc',letterSpacing:'0.07em' }}>FREE DEMO</span>
              </motion.div>
              <h2 style={{ fontSize:'clamp(1.8rem,3.5vw,2.6rem)',fontWeight:900,marginBottom:14,letterSpacing:'-0.04em',lineHeight:1.1 }}>Ready to see it in action?</h2>
              <p style={{ color:'#c3c8d4',fontSize:'1rem',marginBottom:36,maxWidth:480,margin:'0 auto 36px',lineHeight:1.7 }}>We'll walk you through every module live — configured for your specific restaurant type.</p>
              <div style={{ display:'flex',justifyContent:'center',flexWrap:'wrap',gap:14 }}>
                <motion.div style={{ display:'inline-flex' }} whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}>
                  <Link to="/contact" className="lp-btn lp-btn-primary" style={{ fontSize:'1rem',padding:'14px 28px',gap:8,textDecoration:'none',display:'inline-flex',alignItems:'center' }}>
                    Book a Free Demo <ArrowRight size={18} />
                  </Link>
                </motion.div>
                <motion.div style={{ display:'inline-flex' }} whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}>
                  <Link to="/pricing" className="lp-btn lp-btn-secondary" style={{ fontSize:'1rem',padding:'14px 28px',textDecoration:'none',display:'inline-flex',alignItems:'center' }}>
                    View Pricing
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
