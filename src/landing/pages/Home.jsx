import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  motion, AnimatePresence, useScroll, useTransform, useInView,
} from 'framer-motion';
import {
  Utensils, Grid, Cpu, Users, ShieldCheck, CheckCircle2,
  BarChart3, ArrowRight, Rocket, Star, TrendingUp, Zap,
  DollarSign, Package, Activity, Camera, Layout, LineChart,
  ChefHat, Clock, Quote, Wifi, Sparkles, Globe,
} from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import { ease, fadeUp, fadeIn, stagger, scaleUp } from '../utils/animations';

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
  return <span ref={ref}>{count}{suffix}</span>;
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
      style={{ background: '#0d1117', borderRadius: 16, border: '1px solid #1f2937', overflow: 'hidden', boxShadow: '0 50px 100px rgba(0,0,0,0.7),0 0 0 1px rgba(37,99,235,0.12)', fontSize: 12, transformPerspective: 1000 }}
    >
      <div style={{ background: '#111827', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #1f2937' }}>
        {['#ef4444','#f59e0b','#10b981'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
        <span style={{ marginLeft: 8, color: '#4b5563', fontSize: 11 }}>Masala Matrix — Dashboard</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, color: '#10b981', fontSize: 11 }}>
          <Wifi size={10} /><span>Live</span>
        </div>
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{ width: 50, background: '#0b0f19', borderRight: '1px solid #1f2937', padding: '14px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
          {[Grid, Utensils, Users, BarChart3, Package, Activity, ChefHat].map((Icon, i) => (
            <div key={i} style={{ width: 32, height: 32, borderRadius: 8, background: i === 0 ? 'linear-gradient(135deg,#6366f1,#a855f7)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={14} color={i === 0 ? 'white' : '#4b5563'} />
            </div>
          ))}
        </div>
        <div style={{ flex: 1, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {[{ label:'Revenue', value:'₹24,850', color:'#10b981' },{ label:'Orders', value:'47', color:'#818cf8' },{ label:'Tables', value:'8/12', color:'#f59e0b' }].map((s,i) => (
              <motion.div key={i} initial={{ opacity:0,scale:0.85 }} animate={{ opacity:1,scale:1 }} transition={{ delay:0.7+i*0.1 }} style={{ background:'#111827',borderRadius:8,padding:'8px 10px',border:'1px solid #1f2937' }}>
                <div style={{ color:'#6b7280',fontSize:9,marginBottom:3,textTransform:'uppercase',letterSpacing:'0.06em' }}>{s.label}</div>
                <div style={{ color:s.color,fontWeight:700,fontSize:15 }}>{s.value}</div>
              </motion.div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div style={{ background:'#111827',borderRadius:8,padding:10,border:'1px solid #1f2937' }}>
              <div style={{ color:'#9ca3af',fontSize:9,fontWeight:600,marginBottom:8,textTransform:'uppercase',letterSpacing:'0.06em' }}>Floor Plan</div>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:4 }}>
                {tables.map(t => (
                  <div key={t.id} style={{ aspectRatio:'1',borderRadius:4,background:`${sc[t.status]}18`,border:`1px solid ${sc[t.status]}45`,display:'flex',alignItems:'center',justifyContent:'center',color:sc[t.status],fontWeight:700,fontSize:9 }}>T{t.id}</div>
                ))}
              </div>
            </div>
            <div style={{ background:'#111827',borderRadius:8,padding:10,border:'1px solid #1f2937' }}>
              <div style={{ color:'#9ca3af',fontSize:9,fontWeight:600,marginBottom:8,textTransform:'uppercase',letterSpacing:'0.06em' }}>Live Orders</div>
              <div style={{ display:'flex',flexDirection:'column',gap:5 }}>
                {orders.map((o,i) => (
                  <motion.div key={o.id} initial={{ opacity:0,x:16 }} animate={{ opacity:1,x:0 }} transition={{ delay:0.9+i*0.12 }} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'4px 6px',borderRadius:4,background:'#0b0f19' }}>
                    <span style={{ color:'#6b7280',fontSize:9 }}>{o.id}</span>
                    <div style={{ padding:'2px 7px',borderRadius:10,fontSize:8,fontWeight:700,background:`${o.color}22`,color:o.color }}>{o.status}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ background:'#111827',borderRadius:8,padding:10,border:'1px solid #1f2937' }}>
            <div style={{ display:'flex',justifyContent:'space-between',marginBottom:8 }}>
              <span style={{ color:'#9ca3af',fontSize:9,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em' }}>Weekly Revenue</span>
              <span style={{ color:'#10b981',fontSize:9,fontWeight:700 }}>+18.4%</span>
            </div>
            <div style={{ display:'flex',alignItems:'flex-end',gap:4,height:44 }}>
              {bars.map((h,i) => (
                <motion.div key={i} style={{ flex:1,borderRadius:'3px 3px 0 0',transformOrigin:'bottom',height:`${h}%`,background:i===5?'linear-gradient(to top,#6366f1,#a855f7)':'#1f2937' }} initial={{ scaleY:0 }} animate={{ scaleY:1 }} transition={{ delay:1+i*0.07,duration:0.45,ease:'easeOut' }} />
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
      style={{ position: 'absolute', background: '#111827', border: '1px solid #6366f155', borderRadius: 20, padding: '8px 16px', fontSize: '0.78rem', fontWeight: 700, color: '#a5b4fc', boxShadow: '0 8px 30px rgba(37,99,235,0.3)', zIndex: 20, whiteSpace: 'nowrap', ...style }}
    >{children}</motion.div>
  );
}

// ── Feature Card ──────────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, description }) {
  return (
    <motion.div variants={fadeUp} whileHover={{ y: -6, boxShadow: '0 20px 60px rgba(37,99,235,0.12)', borderColor: '#6366f155' }} style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 14, padding: 28, transition: 'border-color 0.3s' }}>
      <motion.div whileHover={{ scale: 1.12, rotate: 5 }} transition={{ type: 'spring', stiffness: 300 }} style={{ width: 44, height: 44, borderRadius: 10, background: 'linear-gradient(135deg,#312e8122,#a855f722)', border: '1px solid #6366f144', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <Icon size={20} color="#818cf8" />
      </motion.div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 10 }}>{title}</h3>
      <p style={{ color: '#9ca3af', fontSize: '0.875rem', lineHeight: 1.7 }}>{description}</p>
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
        <motion.div initial={{ scale: 0, opacity: 0 }} animate={inView ? { scale: 1, opacity: 1 } : {}} transition={{ type: 'spring', stiffness: 300, delay: number * 0.1 }} style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.95rem', flexShrink: 0, zIndex: 1 }}>
          {number}
        </motion.div>
        {!isLast && <motion.div initial={{ scaleY: 0 }} animate={inView ? { scaleY: 1 } : {}} transition={{ duration: 0.5, delay: number * 0.1 + 0.2 }} style={{ width: 2, flex: 1, background: 'linear-gradient(to bottom,#6366f144,transparent)', transformOrigin: 'top', marginTop: 4 }} />}
      </div>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.5, delay: number * 0.1 + 0.1 }} style={{ paddingBottom: isLast ? 0 : 36 }}>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 8 }}>{title}</h4>
        <p style={{ color: '#9ca3af', fontSize: '0.875rem', lineHeight: 1.65 }}>{description}</p>
      </motion.div>
    </div>
  );
}

// ── Marquee ───────────────────────────────────────────────────────────────────
function MarqueeStrip() {
  const items = ['🚀 Real-time Orders','📊 AI Forecasting','🍽️ KDS Integration','💳 Payments','👥 Staff Management','📦 Inventory','🗺️ Floor Plans','📈 Analytics','🤖 Chatbot AI','🔒 Role-based Access'];
  return (
    <div style={{ overflow: 'hidden', background: '#0b0f19', borderTop: '1px solid #1f2937', borderBottom: '1px solid #1f2937', padding: '14px 0', position: 'relative' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 80, background: 'linear-gradient(to right,#0b0f19,transparent)', zIndex: 2 }} />
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, background: 'linear-gradient(to left,#0b0f19,transparent)', zIndex: 2 }} />
      <motion.div animate={{ x: [0, -50 * items.length] }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }} style={{ display: 'flex', gap: 0, width: 'max-content' }}>
        {[...items, ...items].map((item, i) => (
          <span key={i} style={{ color: '#4b5563', fontSize: '0.8rem', fontWeight: 600, padding: '0 28px', whiteSpace: 'nowrap' }}>{item}<span style={{ marginLeft: 28, color: '#1f2937' }}>•</span></span>
        ))}
      </motion.div>
    </div>
  );
}

export default function Home() {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 400], [0, -60]);

  return (
    <div>
      {/* ── Hero ── */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: 90, paddingBottom: 60, position: 'relative', overflow: 'hidden' }}>
        <motion.div animate={{ scale: [1,1.15,1], opacity: [0.3,0.5,0.3] }} transition={{ duration: 6, repeat: Infinity }} style={{ position: 'absolute', top: '15%', left: '10%', width: 400, height: 400, background: 'radial-gradient(circle,#6366f122,transparent 70%)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }} />
        <motion.div animate={{ scale: [1,1.2,1], opacity: [0.2,0.35,0.2] }} transition={{ duration: 8, repeat: Infinity, delay: 2 }} style={{ position: 'absolute', bottom: '10%', right: '5%', width: 500, height: 500, background: 'radial-gradient(circle,#a855f718,transparent 70%)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div className="lp-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 60, alignItems: 'center' }}>
            <motion.div style={{ y: heroY }}>
              <motion.div initial={{ opacity:0,scale:0.8 }} animate={{ opacity:1,scale:1 }} transition={{ duration:0.5 }} style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'7px 14px',borderRadius:20,background:'#312e8122',border:'1px solid #6366f144',marginBottom:24 }}>
                <Zap size={12} color="#a5b4fc" fill="#a5b4fc" />
                <span style={{ fontSize:'0.75rem',fontWeight:700,color:'#a5b4fc',letterSpacing:'0.06em' }}>PERSONALIZED RESTAURANT TECHNOLOGY</span>
              </motion.div>
              <motion.h1 initial={{ opacity:0,y:50 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.8,ease,delay:0.15 }} style={{ fontSize:'clamp(2.5rem,5vw,4.2rem)',fontWeight:900,lineHeight:1.08,letterSpacing:'-0.04em',marginBottom:24 }}>
                Software that{' '}
                <motion.span initial={{ backgroundSize:'0% 3px' }} animate={{ backgroundSize:'100% 3px' }} transition={{ delay:1.2,duration:0.8 }} style={{ color:'#818cf8',backgroundImage:'linear-gradient(#6366f1,#6366f1)',backgroundRepeat:'no-repeat',backgroundPosition:'0 100%' }}>fits</motion.span>{' '}
                your restaurant.{' '}
                <span style={{ color:'#9ca3af' }}>Not the other way.</span>
              </motion.h1>
              <motion.p initial={{ opacity:0,y:30 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.7,ease,delay:0.35 }} style={{ color:'#9ca3af',fontSize:'1.15rem',lineHeight:1.7,marginBottom:36,maxWidth:480 }}>
                From ordering to kitchens to payments — we engineer technology tailored to <em style={{ color:'#d1d5db' }}>your</em> unique workflow.
              </motion.p>
              <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.6,ease,delay:0.5 }} style={{ display:'flex',flexWrap:'wrap',gap:14 }}>
                <motion.div whileHover={{ scale:1.05,boxShadow:'0 0 36px rgba(37,99,235,0.5)' }} whileTap={{ scale:0.97 }}>
                  <Link to="/contact" className="lp-btn lp-btn-primary" style={{ fontSize:'1rem',padding:'14px 28px',gap:8,textDecoration:'none',display:'inline-flex',alignItems:'center' }}>
                    Request a Consultation <ArrowRight size={18} />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}>
                  <Link to="/process" className="lp-btn lp-btn-secondary" style={{ fontSize:'1rem',padding:'14px 28px',textDecoration:'none',display:'inline-flex',alignItems:'center' }}>
                    See How It Works
                  </Link>
                </motion.div>
              </motion.div>
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.9 }} style={{ display:'flex',gap:28,marginTop:40,flexWrap:'wrap' }}>
                {[{ value:'200+',label:'Restaurants' },{ value:'1M+',label:'Orders Processed' },{ value:'99.9%',label:'Uptime' }].map((s,i) => (
                  <div key={i}>
                    <div style={{ fontSize:'1.35rem',fontWeight:800 }}>{s.value}</div>
                    <div style={{ fontSize:'0.78rem',color:'#6b7280',fontWeight:500 }}>{s.label}</div>
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

      {/* ── Stats ── */}
      <section style={{ padding:'80px 0',borderBottom:'1px solid #1f2937' }}>
        <div className="lp-container">
          <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger(0.15)} style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:32 }}>
            {[
              { target:200,suffix:'+',label:'Restaurants Served',icon:Utensils,color:'#818cf8' },
              { target:99,suffix:'%',label:'Uptime Guarantee',icon:Zap,color:'#10b981' },
              { target:42,suffix:'%',label:'Avg Revenue Growth',icon:TrendingUp,color:'#f59e0b' },
              { target:1000000,suffix:'+',label:'Orders Processed',icon:Activity,color:'#8b5cf6' },
            ].map((s,i) => (
              <motion.div key={i} variants={scaleUp} whileHover={{ y:-4 }} style={{ background:'#111827',border:'1px solid #1f2937',borderRadius:14,padding:'28px 24px',textAlign:'center' }}>
                <div style={{ width:44,height:44,borderRadius:10,background:`${s.color}18`,border:`1px solid ${s.color}33`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px' }}>
                  <s.icon size={20} color={s.color} />
                </div>
                <div style={{ fontSize:'2.2rem',fontWeight:900,color:s.color,letterSpacing:'-0.04em',lineHeight:1 }}>
                  <AnimatedCounter target={s.target} suffix={s.suffix} />
                </div>
                <div style={{ color:'#6b7280',fontSize:'0.825rem',marginTop:6,fontWeight:500 }}>{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Solutions ── */}
      <section id="solutions" style={{ padding:'100px 0',borderBottom:'1px solid #1f2937',background:'#0d1117' }}>
        <div className="lp-container">
          <SectionHeader badge="FULL ECOSYSTEM" title="A Solution, Not Just a Product." subtitle="Masala Matrix is a custom-configured ecosystem built around how your restaurant actually runs. Nothing extra, nothing missing." />
          <motion.div initial="hidden" whileInView="show" viewport={{ once:true,margin:'-60px' }} variants={stagger(0.08)} style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:20 }}>
            {[
              { icon:Grid,title:'Tailored POS',description:'Built for your peak hour volume and menu complexity — not a generic template.' },
              { icon:Layout,title:'Interactive Seating',description:'Dynamic floor plans that mirror your actual physical table layout in real-time.' },
              { icon:Cpu,title:'Custom KDS',description:'Sync front-of-house with specialized kitchen stations for your specific cuisine.' },
              { icon:LineChart,title:'AI Forecasting',description:'Predict future demand to optimize staff scheduling and inventory levels.' },
              { icon:ShieldCheck,title:'Secure Cloud',description:'Enterprise-grade security with real-time backups and 99.9% uptime SLA.' },
              { icon:Users,title:'CRM & Growth',description:'Understand your regulars and drive return visits with targeted loyalty campaigns.' },
            ].map((f,i) => <FeatureCard key={i} {...f} />)}
          </motion.div>
          <motion.div initial={{ opacity:0,y:20 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:0.4 }} style={{ textAlign:'center',marginTop:48 }}>
            <Link to="/features" className="lp-btn lp-btn-secondary" style={{ textDecoration:'none',display:'inline-flex',alignItems:'center',gap:8 }}>
              Explore All Features <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Why Us ── */}
      <section id="why-us" style={{ padding:'100px 0',borderBottom:'1px solid #1f2937' }}>
        <div className="lp-container">
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:64,alignItems:'center' }}>
            <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger(0.12)}>
              <motion.div variants={fadeIn} style={{ display:'inline-flex',alignItems:'center',gap:6,padding:'6px 14px',borderRadius:20,background:'#312e8122',border:'1px solid #6366f144',marginBottom:20 }}>
                <Sparkles size={12} color="#a5b4fc" />
                <span style={{ fontSize:'0.75rem',fontWeight:700,color:'#a5b4fc',letterSpacing:'0.06em' }}>OUR EDGE</span>
              </motion.div>
              <motion.h2 variants={fadeUp} style={{ fontSize:'clamp(1.8rem,3.5vw,2.5rem)',fontWeight:800,lineHeight:1.15,marginBottom:20,letterSpacing:'-0.03em' }}>
                Most software forces you to change.{' '}<span style={{ color:'#818cf8' }}>We don't.</span>
              </motion.h2>
              <motion.p variants={fadeUp} style={{ color:'#9ca3af',fontSize:'1.05rem',lineHeight:1.7,marginBottom:32 }}>
                We don't sell "one-size-fits-all" tools. We observe, understand, and engineer systems tailored to how your restaurant actually runs.
              </motion.p>
              <motion.div variants={stagger(0.1)} style={{ display:'flex',flexDirection:'column',gap:14 }}>
                {['Your restaurant layout','Kitchen workflow & stations','Staff roles & permissions','Payment preferences'].map((item,i) => (
                  <motion.div key={i} variants={fadeUp} style={{ display:'flex',alignItems:'center',gap:12 }}>
                    <div style={{ width:28,height:28,borderRadius:'50%',background:'#312e8133',border:'1px solid #6366f144',display:'flex',alignItems:'center',justifyContent:'center' }}>
                      <CheckCircle2 size={14} color="#818cf8" />
                    </div>
                    <span style={{ fontWeight:500,color:'#d1d5db' }}>{item}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
            <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger(0.15)} style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,alignItems:'start' }}>
              {[
                { icon:Users,label:'Customer Flow',value:'↑ 34%',color:'#818cf8',offset:0 },
                { icon:BarChart3,label:'Order Volume',value:'↑ 28%',color:'#10b981',offset:28 },
                { icon:Clock,label:'Table Turnover',value:'↑ 22%',color:'#f59e0b',offset:14 },
                { icon:DollarSign,label:'Revenue/Table',value:'↑ 41%',color:'#8b5cf6',offset:42 },
              ].map((card,i) => (
                <motion.div key={i} variants={scaleUp} whileHover={{ y:-6,boxShadow:`0 20px 50px ${card.color}22` }} style={{ background:'#111827',border:'1px solid #1f2937',borderRadius:14,padding:28,textAlign:'center',marginTop:card.offset }}>
                  <div style={{ width:44,height:44,borderRadius:10,background:`${card.color}18`,border:`1px solid ${card.color}33`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px' }}>
                    <card.icon size={20} color={card.color} />
                  </div>
                  <div style={{ fontSize:'1.5rem',fontWeight:900,color:card.color,letterSpacing:'-0.03em' }}>{card.value}</div>
                  <div style={{ fontSize:'0.78rem',color:'#6b7280',marginTop:5,fontWeight:500 }}>{card.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Process Preview ── */}
      <section id="process" style={{ padding:'100px 0',borderBottom:'1px solid #1f2937' }}>
        <div className="lp-container">
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:64,alignItems:'flex-start' }}>
            <div>
              <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger(0.1)}>
                <motion.div variants={fadeIn} style={{ display:'inline-flex',alignItems:'center',gap:6,padding:'6px 14px',borderRadius:20,background:'#312e8122',border:'1px solid #6366f144',marginBottom:20 }}>
                  <Sparkles size={12} color="#a5b4fc" />
                  <span style={{ fontSize:'0.75rem',fontWeight:700,color:'#a5b4fc',letterSpacing:'0.06em' }}>OUR APPROACH</span>
                </motion.div>
                <motion.h2 variants={fadeUp} style={{ fontSize:'clamp(1.8rem,3.5vw,2.5rem)',fontWeight:800,lineHeight:1.15,marginBottom:16,letterSpacing:'-0.03em' }}>How we make it work</motion.h2>
                <motion.p variants={fadeUp} style={{ color:'#9ca3af',fontSize:'1.05rem',lineHeight:1.7,marginBottom:48 }}>A systematic process to build technology that truly fits — every time.</motion.p>
              </motion.div>
              <div style={{ display:'flex',flexDirection:'column' }}>
                {[
                  { title:'Observe',description:'We study your operations end-to-end before writing a single line of code.' },
                  { title:'Design',description:'We map every workflow that removes friction from your daily service.' },
                  { title:'Build',description:'We configure and customize the system specifically for your team.' },
                  { title:'Deploy',description:'We onboard staff, test during live hours, and refine in real-time.' },
                  { title:'Scale',description:'As you grow, Masala Matrix evolves with you — no rebuilds, no compromises.',isLast:true },
                ].map((step,i) => <ProcessStep key={i} number={i+1} {...step} />)}
              </div>
              <motion.div initial={{ opacity:0,y:20 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:0.4 }} style={{ marginTop:32 }}>
                <Link to="/process" className="lp-btn lp-btn-secondary" style={{ textDecoration:'none',display:'inline-flex',alignItems:'center',gap:8 }}>
                  See Detailed Process <ArrowRight size={16} />
                </Link>
              </motion.div>
            </div>
            <div style={{ position:'sticky',top:100 }}>
              <motion.div initial={{ opacity:0,scale:0.9 }} whileInView={{ opacity:1,scale:1 }} viewport={{ once:true }} transition={{ duration:0.7,ease }} style={{ background:'linear-gradient(160deg,#111827,#0f172a)',border:'1px solid #6366f144',borderRadius:20,padding:40,textAlign:'center' }}>
                <motion.div animate={{ rotate:[0,5,-5,0] }} transition={{ duration:4,repeat:Infinity }} style={{ width:72,height:72,borderRadius:20,background:'linear-gradient(135deg,#6366f1,#a855f7)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 24px' }}>
                  <Rocket size={32} color="white" />
                </motion.div>
                <h3 style={{ fontSize:'1.5rem',fontWeight:800,marginBottom:12 }}>Built for Scale</h3>
                <p style={{ color:'#9ca3af',lineHeight:1.7,marginBottom:28,fontSize:'0.925rem' }}>Whether you run 1 location or 50, the system scales cleanly without adding complexity.</p>
                <Link to="/contact" className="lp-btn lp-btn-primary" style={{ width:'100%',justifyContent:'center',fontWeight:700,textDecoration:'none',display:'flex' }}>
                  Talk to a Consultant <ArrowRight size={16} style={{ marginLeft:6 }} />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ padding:'100px 0',borderBottom:'1px solid #1f2937',background:'#0d1117' }}>
        <div className="lp-container">
          <SectionHeader badge="CUSTOMER STORIES" title="Trusted by restaurant owners." subtitle="Hear what our customers say about how Masala Matrix transformed their operations." />
          <motion.div initial="hidden" whileInView="show" viewport={{ once:true,margin:'-60px' }} variants={stagger(0.15)} style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:20 }}>
            {[
              { quote:'We used the POS data to identify which slow-day items to promote via Instagram. Our revenue jumped 42% in the first two months.',name:'Arjun Mehta',role:'Owner, The Tandoor House',rating:5 },
              { quote:'The KDS alone saved us 15 minutes per service. Our kitchen team finally knows exactly what to cook and when.',name:'Priya Sharma',role:'Head Chef, Spice Route',rating:5 },
              { quote:'Setup was fast, staff trained in a day. Masala Matrix felt like it was built just for our dhaba — because it was.',name:'Ramesh Verma',role:'Owner, Verma\'s Dhaba',rating:5 },
            ].map((t,i) => (
              <motion.div key={i} variants={scaleUp} whileHover={{ y:-4 }} style={{ background:'#111827',border:'1px solid #1f2937',borderRadius:14,padding:28 }}>
                <div style={{ display:'flex',gap:4,marginBottom:16 }}>
                  {Array.from({ length:t.rating }).map((_,j) => <Star key={j} size={14} color="#f59e0b" fill="#f59e0b" />)}
                </div>
                <Quote size={20} color="#6366f144" style={{ marginBottom:12 }} />
                <p style={{ color:'#d1d5db',fontSize:'0.9rem',lineHeight:1.75,marginBottom:20,fontStyle:'italic' }}>{t.quote}</p>
                <div style={{ display:'flex',alignItems:'center',gap:12,borderTop:'1px solid #1f2937',paddingTop:16 }}>
                  <div style={{ width:38,height:38,borderRadius:'50%',background:'linear-gradient(135deg,#6366f1,#a855f7)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:'0.85rem' }}>{t.name[0]}</div>
                  <div>
                    <div style={{ fontWeight:700,fontSize:'0.875rem' }}>{t.name}</div>
                    <div style={{ fontSize:'0.775rem',color:'#6b7280' }}>{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Pricing Preview ── */}
      <section id="pricing" style={{ padding:'100px 0',borderBottom:'1px solid #1f2937' }}>
        <div className="lp-container">
          <SectionHeader badge="PRICING" title="Flexible plans for every size." subtitle="Custom configuration included in every plan. No hidden fees." />
          <motion.div initial="hidden" whileInView="show" viewport={{ once:true,margin:'-60px' }} variants={stagger(0.15)} style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:24,maxWidth:960,margin:'0 auto' }}>
            {[
              { tier:'Core',subtitle:'For Single-Outlet Restaurants',features:['Custom POS Configuration','Dine-in / Takeaway Workflows','Basic Inventory Control','Standard Analytics','24/7 Priority Support'],popular:false },
              { tier:'Growth',subtitle:'For Growing Multi-Unit Brands',features:['Everything in Core','Advanced KDS Sync','Social Growth Marketing','Centralized Management','AI Demand Forecasting'],popular:true },
              { tier:'Scale',subtitle:'For Enterprises & Franchises',features:['Custom Enterprise Solutions','Franchise Management','Dedicated Growth Partner','White-label Option','Open API Access'],popular:false },
            ].map((p,i) => (
              <motion.div key={i} variants={fadeUp} whileHover={{ y:p.popular?-12:-6,boxShadow:p.popular?'0 30px 80px rgba(37,99,235,0.25)':'0 20px 50px rgba(0,0,0,0.3)' }} style={{ background:p.popular?'linear-gradient(160deg,#111827,#0f172a)':'#111827',border:p.popular?'1px solid #6366f188':'1px solid #1f2937',borderRadius:16,padding:32,position:'relative',display:'flex',flexDirection:'column' }}>
                {p.popular && <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring',delay:0.6 }} style={{ position:'absolute',top:-14,left:'50%',transform:'translateX(-50%)',background:'linear-gradient(135deg,#6366f1,#a855f7)',color:'white',fontSize:'0.7rem',fontWeight:800,padding:'5px 14px',borderRadius:20,letterSpacing:'0.08em',whiteSpace:'nowrap' }}>★ MOST POPULAR</motion.div>}
                <h3 style={{ fontSize:'1.5rem',fontWeight:800,marginBottom:6 }}>{p.tier}</h3>
                <p style={{ color:'#9ca3af',fontSize:'0.875rem',marginBottom:24 }}>{p.subtitle}</p>
                <ul style={{ flex:1,display:'flex',flexDirection:'column',gap:14,marginBottom:28,paddingTop:20,borderTop:'1px solid #1f2937' }}>
                  {p.features.map((f,j) => (
                    <li key={j} style={{ display:'flex',alignItems:'flex-start',gap:10 }}>
                      <CheckCircle2 size={15} color="#6366f1" style={{ marginTop:2,flexShrink:0 }} />
                      <span style={{ color:'#d1d5db',fontSize:'0.875rem' }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/contact" className={`lp-btn ${p.popular?'lp-btn-primary':'lp-btn-secondary'}`} style={{ justifyContent:'center',fontWeight:700,textDecoration:'none',display:'flex',alignItems:'center',gap:6 }}>
                  {p.tier==='Scale'?'Contact Sales':'Get Started'} <ArrowRight size={15} />
                </Link>
              </motion.div>
            ))}
          </motion.div>
          <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} style={{ textAlign:'center',marginTop:32 }}>
            <Link to="/pricing" className="lp-nav-link" style={{ fontSize:'0.875rem',display:'inline-flex',alignItems:'center',gap:6,textDecoration:'none' }}>
              View full pricing comparison <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding:'100px 0' }}>
        <div className="lp-container">
          <motion.div initial={{ opacity:0,y:50 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ duration:0.8,ease }} style={{ background:'linear-gradient(135deg,#312e8122 0%,#a855f718 100%)',border:'1px solid #6366f133',borderRadius:24,padding:'clamp(48px,8vw,80px)',textAlign:'center',position:'relative',overflow:'hidden' }}>
            <motion.div animate={{ scale:[1,1.3,1],opacity:[0.3,0.5,0.3] }} transition={{ duration:5,repeat:Infinity }} style={{ position:'absolute',top:'-40%',left:'50%',transform:'translateX(-50%)',width:500,height:500,background:'radial-gradient(circle,#6366f115,transparent 70%)',borderRadius:'50%',pointerEvents:'none' }} />
            <motion.div initial={{ scale:0 }} whileInView={{ scale:1 }} viewport={{ once:true }} transition={{ type:'spring',delay:0.2 }} style={{ width:64,height:64,borderRadius:18,background:'linear-gradient(135deg,#6366f1,#a855f7)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 28px' }}>
              <Rocket size={28} color="white" />
            </motion.div>
            <h2 style={{ fontSize:'clamp(1.8rem,4vw,3rem)',fontWeight:900,marginBottom:16,lineHeight:1.15,letterSpacing:'-0.03em',maxWidth:700,margin:'0 auto 16px' }}>
              Tired of adjusting your restaurant to fit software?
            </h2>
            <p style={{ color:'#9ca3af',fontSize:'1.1rem',marginBottom:36,maxWidth:520,margin:'16px auto 36px' }}>
              It's time for software that <em style={{ color:'#a5b4fc' }}>fits you.</em> Let's talk.
            </p>
            <motion.div whileHover={{ scale:1.06,boxShadow:'0 0 50px rgba(37,99,235,0.55)' }} whileTap={{ scale:0.97 }}>
              <Link to="/contact" className="lp-btn lp-btn-primary" style={{ fontSize:'1.1rem',padding:'16px 36px',gap:10,position:'relative',textDecoration:'none',display:'inline-flex',alignItems:'center' }}>
                Talk to Masala Matrix <ArrowRight size={20} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
