import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ArrowRight, Zap, Search, Pencil, Wrench, Rocket, TrendingUp, ChevronDown, Clock, Users, ShieldCheck, MessageSquare } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import { fadeUp, fadeIn, stagger, scaleUp, ease } from '../utils/animations';

const steps = [
  {
    number: '01',
    icon: Search,
    color: '#818cf8',
    title: 'Observe',
    tagline: 'We understand before we build.',
    duration: '1–2 days',
    description: 'We spend time studying your restaurant — either on-site or through a detailed virtual walkthrough. We map every touchpoint: how orders flow, how your kitchen is organized, how staff communicate, and where things break down.',
    deliverables: ['Full workflow documentation', 'Pain point analysis', 'Staff interview notes', 'Peak hour observation report'],
    outcome: 'A crystal-clear picture of how your restaurant actually runs — not how it should on paper.',
  },
  {
    number: '02',
    icon: Pencil,
    color: '#8b5cf6',
    title: 'Design',
    tagline: 'Every workflow mapped to remove friction.',
    duration: '2–3 days',
    description: 'Using our observations, we design the complete system architecture — custom screens, user flows, role permissions, and kitchen routing. You review and approve everything before we build.',
    deliverables: ['Custom POS screen mockups', 'Floor plan layout design', 'Role & permission matrix', 'KDS station routing plan'],
    outcome: 'A blueprint that your team sees and approves before a single configuration change is made.',
  },
  {
    number: '03',
    icon: Wrench,
    color: '#f59e0b',
    title: 'Build',
    tagline: 'Configuration, not just installation.',
    duration: '3–5 days',
    description: 'We configure and customize the full Masala Matrix system for your restaurant. This includes menu setup, floor plans, user accounts, KDS routing, inventory categories, and payment settings — all tailored to your workflow.',
    deliverables: ['Complete menu & pricing setup', 'Floor plan in system', 'Staff accounts & roles configured', 'Inventory & KDS ready'],
    outcome: 'A fully operational system ready for soft testing — nothing generic, nothing left for you to figure out.',
  },
  {
    number: '04',
    icon: Rocket,
    color: '#10b981',
    title: 'Deploy',
    tagline: 'Go live with zero disruption.',
    duration: '1–2 days',
    description: 'We deploy during a low-traffic window and run parallel to your existing process for one full service. We train your team, handle real-time issues, and make live adjustments until everyone is confident.',
    deliverables: ['Live deployment', 'Full staff training session', 'Real-time support during first service', 'Post-deployment checklist'],
    outcome: 'Your team is comfortable and the system is running. No two-hour downtime, no confused staff.',
  },
  {
    number: '05',
    icon: TrendingUp,
    color: '#ec4899',
    title: 'Scale',
    tagline: 'Grow without rebuilding.',
    duration: 'Ongoing',
    description: 'As your restaurant evolves — new outlets, new menu items, new staff, new workflows — Masala Matrix evolves with you. We provide ongoing support, feature updates, and growth marketing integration.',
    deliverables: ['Monthly performance reviews', 'New outlet onboarding', 'Feature requests & updates', 'Growth marketing integration'],
    outcome: 'A system that grows as you grow — with a team that stays invested in your success long-term.',
  },
];

const faqs = [
  { q: 'How long does the full setup take?', a: 'For a single-outlet restaurant, the complete process from Observe to Deploy takes 8–12 days. Multi-outlet setups take 3–4 weeks. We work around your schedule to minimize disruption.' },
  { q: 'Do we need to shut down during deployment?', a: 'No. We deploy during off-peak hours and run Masala Matrix in parallel with your existing process during the first service. Your operations continue without interruption.' },
  { q: 'What happens if something breaks after go-live?', a: 'We offer 24/7 priority support for the first 30 days after deployment. After that, all plans include same-day response support. We stay accountable long after launch.' },
  { q: 'Can we customize things after deployment?', a: 'Yes, always. As your menu, layout, or team changes, we make updates. Regular plan holders get ongoing updates included. No extra charges for routine changes.' },
];

function StepCard({ step, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <div ref={ref} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 48, alignItems: 'flex-start', padding: '60px 0', borderBottom: '1px solid #1f2937' }}>
      {/* Left: step info */}
      <motion.div initial={{ opacity:0,x:-40 }} animate={inView?{ opacity:1,x:0 }:{}} transition={{ duration:0.7,ease,delay:index*0.05 }}>
        <div style={{ display:'flex',alignItems:'center',gap:16,marginBottom:24 }}>
          <motion.div
            initial={{ scale:0 }}
            animate={inView?{ scale:1 }:{}}
            transition={{ type:'spring',stiffness:250,delay:0.1 }}
            style={{ width:64,height:64,borderRadius:18,background:`linear-gradient(135deg,${step.color},${step.color}88)`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}
          >
            <step.icon size={28} color="white" />
          </motion.div>
          <div>
            <div style={{ fontSize:'0.7rem',fontWeight:700,color:step.color,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:2 }}>Step {step.number}</div>
            <h3 style={{ fontSize:'1.8rem',fontWeight:900,letterSpacing:'-0.03em',lineHeight:1 }}>{step.title}</h3>
          </div>
        </div>
        <p style={{ fontSize:'1.1rem',fontWeight:600,color:'#d1d5db',marginBottom:12,fontStyle:'italic' }}>"{step.tagline}"</p>
        <p style={{ color:'#c3c8d4',fontSize:'0.975rem',lineHeight:1.75,marginBottom:24 }}>{step.description}</p>
        <div style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'6px 14px',borderRadius:20,background:`${step.color}15`,border:`1px solid ${step.color}33` }}>
          <Clock size={12} color={step.color} />
          <span style={{ fontSize:'0.78rem',fontWeight:700,color:step.color }}>Timeline: {step.duration}</span>
        </div>
      </motion.div>

      {/* Right: deliverables + outcome */}
      <motion.div initial={{ opacity:0,x:40 }} animate={inView?{ opacity:1,x:0 }:{}} transition={{ duration:0.7,ease,delay:index*0.05+0.15 }}>
        <div style={{ background:'#111827',border:`1px solid ${step.color}22`,borderRadius:16,padding:28,marginBottom:16 }}>
          <div style={{ fontSize:'0.72rem',fontWeight:700,color:'#b4bac8',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:14 }}>Deliverables</div>
          <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
            {step.deliverables.map((d,i) => (
              <motion.div key={i} initial={{ opacity:0,x:16 }} animate={inView?{ opacity:1,x:0 }:{}} transition={{ delay:0.3+i*0.08 }} style={{ display:'flex',alignItems:'flex-start',gap:10 }}>
                <div style={{ width:20,height:20,borderRadius:'50%',background:`${step.color}22`,border:`1px solid ${step.color}44`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1 }}>
                  <div style={{ width:6,height:6,borderRadius:'50%',background:step.color }} />
                </div>
                <span style={{ color:'#d1d5db',fontSize:'0.875rem',lineHeight:1.5 }}>{d}</span>
              </motion.div>
            ))}
          </div>
        </div>
        <div style={{ background:`${step.color}0d`,border:`1px solid ${step.color}33`,borderRadius:12,padding:20 }}>
          <div style={{ fontSize:'0.72rem',fontWeight:700,color:step.color,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:8 }}>Outcome</div>
          <p style={{ color:'#d1d5db',fontSize:'0.9rem',lineHeight:1.65 }}>{step.outcome}</p>
        </div>
      </motion.div>
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      style={{ border:'1px solid #1f2937',borderRadius:28,overflow:'hidden' }}
      whileHover={{ borderColor:'#9fa8ba' }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{ width:'100%',background:'#111827',border:'none',color:'#f9fafb',padding:'20px 24px',display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer',textAlign:'left',gap:16,borderRadius:28 }}
      >
        <span style={{ fontWeight:600,fontSize:'0.975rem' }}>{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration:0.3 }}>
          <ChevronDown size={18} color="#b4bac8" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height:0,opacity:0 }}
            animate={{ height:'auto',opacity:1 }}
            exit={{ height:0,opacity:0 }}
            transition={{ duration:0.3 }}
            style={{ overflow:'hidden' }}
          >
            <div style={{ padding:'0 24px 20px',color:'#c3c8d4',fontSize:'0.9rem',lineHeight:1.75,background:'#111827',borderTop:'1px solid #1f2937' }}>
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Process() {
  return (
    <div>
      {/* Hero */}
      <section style={{ paddingTop:130,paddingBottom:80,position:'relative',overflow:'hidden',borderBottom:'1px solid #1f2937',background:'#0d1117' }}>
        {/* Atmospheric background */}
        <div style={{ position:'absolute',inset:0,pointerEvents:'none',zIndex:0 }}>
          <div style={{ position:'absolute',inset:0,backgroundImage:'radial-gradient(rgba(168,85,247,0.05) 1px,transparent 1px)',backgroundSize:'40px 40px' }} />
          <div style={{ position:'absolute',top:'-15%',right:'5%',width:500,height:500,background:'radial-gradient(circle,rgba(168,85,247,0.1),transparent 70%)' }} />
          <div style={{ position:'absolute',bottom:0,left:'20%',right:'20%',height:1,background:'linear-gradient(90deg,transparent,rgba(99,102,241,0.25),transparent)' }} />
          <svg style={{ position:'absolute',inset:0,width:'100%',height:'100%' }} preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="pc1" x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#a855f7" stopOpacity="0.1"/><stop offset="100%" stopColor="#6366f1" stopOpacity="0.02"/></linearGradient>
              <linearGradient id="pc2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6366f1" stopOpacity="0.08"/><stop offset="100%" stopColor="#a855f7" stopOpacity="0.01"/></linearGradient>
            </defs>
            <line x1="100%" y1="35%" x2="72%" y2="100%" stroke="url(#pc1)" strokeWidth="1"/>
            <line x1="95%" y1="0" x2="77%" y2="45%" stroke="url(#pc1)" strokeWidth="0.5"/>
            <line x1="0" y1="55%" x2="23%" y2="0" stroke="url(#pc2)" strokeWidth="0.8"/>
          </svg>
          {/* Floating timeline chips */}
          <motion.div initial={{ opacity:0,x:-16 }} animate={{ opacity:0.65,x:0 }} transition={{ delay:1,duration:0.8 }}>
            <motion.div animate={{ y:[0,-6,0] }} transition={{ duration:5,repeat:Infinity,ease:'easeInOut' }} style={{ position:'absolute',left:32,top:'28%',background:'rgba(9,10,18,0.9)',backdropFilter:'blur(12px)',border:'1px solid rgba(99,102,241,0.22)',borderRadius:10,padding:'10px 16px' }}>
              <div style={{ fontSize:8,color:'#818cf8',fontWeight:700,letterSpacing:'0.07em',marginBottom:3 }}>TYPICAL TIMELINE</div>
              <div style={{ fontSize:13,fontWeight:800,color:'#f9fafb' }}>7–12 days to go live</div>
            </motion.div>
          </motion.div>
          <motion.div initial={{ opacity:0,x:16 }} animate={{ opacity:0.6,x:0 }} transition={{ delay:1.6,duration:0.8 }}>
            <motion.div animate={{ y:[0,-7,0] }} transition={{ duration:5.5,repeat:Infinity,ease:'easeInOut',delay:1.2 }} style={{ position:'absolute',right:32,top:'30%',background:'rgba(9,10,18,0.9)',backdropFilter:'blur(12px)',border:'1px solid rgba(16,185,129,0.22)',borderRadius:10,padding:'10px 16px',display:'flex',alignItems:'center',gap:8 }}>
              <motion.div animate={{ scale:[1,1.3,1] }} transition={{ duration:2,repeat:Infinity }} style={{ width:7,height:7,borderRadius:'50%',background:'#10b981',boxShadow:'0 0 7px #10b981' }} />
              <div><div style={{ fontSize:10,fontWeight:700,color:'#f9fafb' }}>Zero downtime deployment</div><div style={{ fontSize:8,color:'#10b981' }}>Go live during quiet hours</div></div>
            </motion.div>
          </motion.div>
        </div>
        <div className="lp-container" style={{ textAlign:'center' }}>
          <motion.div initial={{ opacity:0,scale:0.8 }} animate={{ opacity:1,scale:1 }} transition={{ duration:0.5 }} style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'7px 14px',borderRadius:20,background:'#312e8122',border:'1px solid #6366f144',marginBottom:24 }}>
            <Zap size={12} color="#a5b4fc" fill="#a5b4fc" />
            <span style={{ fontSize:'0.75rem',fontWeight:700,color:'#a5b4fc',letterSpacing:'0.06em' }}>OUR PROCESS</span>
          </motion.div>
          <motion.h1 initial={{ opacity:0,y:40 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.8,ease,delay:0.1 }} style={{ fontSize:'clamp(2.5rem,5vw,4rem)',fontWeight:900,lineHeight:1.08,letterSpacing:'-0.04em',marginBottom:20,maxWidth:720,margin:'0 auto 20px' }}>
            How we build software that actually fits.
          </motion.h1>
          <motion.p initial={{ opacity:0,y:30 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.7,ease,delay:0.25 }} style={{ color:'#c3c8d4',fontSize:'1.15rem',lineHeight:1.7,maxWidth:520,margin:'0 auto 48px' }}>
            A 5-step process designed to eliminate the risk of buying software that doesn't work for your restaurant.
          </motion.p>

          {/* Step numbers strip */}
          <motion.div initial="hidden" animate="show" variants={stagger(0.08)} style={{ display:'flex',justifyContent:'center',alignItems:'center',gap:0,flexWrap:'wrap',maxWidth:600,margin:'0 auto' }}>
            {steps.map((s, i) => (
              <React.Fragment key={i}>
                <motion.div variants={scaleUp} style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:8,padding:'12px 16px' }}>
                  <div style={{ width:44,height:44,borderRadius:'50%',background:`${s.color}18`,border:`1px solid ${s.color}44`,display:'flex',alignItems:'center',justifyContent:'center' }}>
                    <s.icon size={18} color={s.color} />
                  </div>
                  <span style={{ fontSize:'0.72rem',fontWeight:700,color:'#b4bac8' }}>{s.title}</span>
                </motion.div>
                {i < steps.length - 1 && <div style={{ width:32,height:1,background:'linear-gradient(90deg,#1f2937,#9fa8ba)',flexShrink:0 }} />}
              </React.Fragment>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Steps */}
      <section style={{ padding:'20px 0 0' }}>
        <div className="lp-container">
          {steps.map((step, i) => <StepCard key={i} step={step} index={i} />)}
        </div>
      </section>

      {/* Support promise */}
      <section style={{ padding:'80px 0',background:'#0d1117',borderTop:'1px solid #1f2937',borderBottom:'1px solid #1f2937' }}>
        <div className="lp-container">
          <SectionHeader badge="SUPPORT" title="We stay accountable." subtitle="Unlike most software companies, our relationship doesn't end at go-live." />
          <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger(0.12)} style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:20 }}>
            {[
              { icon:Clock,color:'#818cf8',title:'24/7 First Month',desc:'Round-the-clock support for 30 days post-deployment. We\'re on call.' },
              { icon:MessageSquare,color:'#10b981',title:'Same-Day Response',desc:'After the first month, all plans include same-day support response.' },
              { icon:TrendingUp,color:'#f59e0b',title:'Monthly Reviews',desc:'We review your performance data and suggest improvements.' },
              { icon:Users,color:'#8b5cf6',title:'Dedicated Contact',desc:'You get a named point of contact — not a generic support queue.' },
            ].map((s,i) => (
              <motion.div key={i} variants={scaleUp} whileHover={{ y:-4 }} style={{ background:'#111827',border:'1px solid #1f2937',borderRadius:14,padding:28 }}>
                <div style={{ width:44,height:44,borderRadius:10,background:`${s.color}18`,border:`1px solid ${s.color}33`,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16 }}>
                  <s.icon size={20} color={s.color} />
                </div>
                <h4 style={{ fontWeight:700,marginBottom:8,fontSize:'0.975rem' }}>{s.title}</h4>
                <p style={{ color:'#c3c8d4',fontSize:'0.85rem',lineHeight:1.65 }}>{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding:'80px 0',borderBottom:'1px solid #1f2937' }}>
        <div className="lp-container" style={{ maxWidth:760,margin:'0 auto' }}>
          <SectionHeader badge="FAQ" title="Common questions." subtitle="Everything you need to know before starting." />
          <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
            {faqs.map((faq,i) => <FaqItem key={i} {...faq} />)}
          </div>
        </div>
      </section>

      {/* CTA — Crypton panel */}
      <section style={{ padding:'80px 0',background:'#07080f',borderTop:'1px solid rgba(255,255,255,0.04)' }}>
        <div className="lp-container">
          <motion.div
            initial={{ opacity:0,y:40 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ duration:0.7 }}
            style={{ background:'#0a0b14',border:'1px solid rgba(99,102,241,0.12)',borderRadius:24,padding:'72px 40px',textAlign:'center',position:'relative',overflow:'hidden' }}
          >
            <div style={{ position:'absolute',bottom:-100,left:'50%',transform:'translateX(-50%)',width:700,height:320,background:'radial-gradient(ellipse at center,rgba(99,102,241,0.28) 0%,rgba(168,85,247,0.12) 40%,transparent 70%)',pointerEvents:'none',zIndex:0 }} />
            <div style={{ position:'absolute',bottom:0,left:'10%',right:'10%',height:1,background:'linear-gradient(90deg,transparent,rgba(99,102,241,0.65) 30%,rgba(168,85,247,0.65) 70%,transparent)',pointerEvents:'none',zIndex:0 }} />
            <div style={{ position:'absolute',top:0,left:'30%',right:'30%',height:1,background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)',pointerEvents:'none',zIndex:0 }} />
            <div style={{ position:'relative',zIndex:1 }}>
              <h2 style={{ fontSize:'clamp(1.6rem,3.5vw,2.4rem)',fontWeight:900,marginBottom:12,letterSpacing:'-0.04em' }}>Ready to start your process?</h2>
              <p style={{ color:'#c3c8d4',fontSize:'1rem',marginBottom:36,maxWidth:480,margin:'12px auto 36px',lineHeight:1.7 }}>The first step is a free 30-minute consultation. No commitment, no sales pitch — just a conversation about your restaurant.</p>
              <motion.div style={{ display:'inline-flex' }} whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}>
                <Link to="/contact" className="lp-btn lp-btn-primary" style={{ fontSize:'1rem',padding:'14px 28px',gap:8,textDecoration:'none',display:'inline-flex',alignItems:'center' }}>
                  Book Free Demo <ArrowRight size={18} />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
