import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X, ArrowRight, Zap, ChevronDown, MessageSquare } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import { fadeUp, stagger, scaleUp, ease } from '../utils/animations';

const tiers = [
  {
    id: 'core',
    name: 'Core',
    subtitle: 'Single-Outlet Restaurants',
    badge: null,
    color: '#9ca3af',
    description: 'Everything you need to run a single restaurant efficiently.',
    features: [
      'Custom POS Configuration',
      'Dine-in / Takeaway / Packing Flows',
      'Interactive Seating & Floor Plan',
      'Kitchen Display System (KDS)',
      'Inventory Management',
      'Staff & Role Management (up to 10 users)',
      'Payments & Billing',
      'Standard Analytics Dashboard',
      'Customer CRM (up to 500 customers)',
      '24/7 Priority Support',
      'Setup, Training & Onboarding',
    ],
    notIncluded: ['Multi-outlet Management', 'AI Demand Forecasting', 'Social Growth Marketing', 'Franchise Tools', 'Open API Access'],
  },
  {
    id: 'growth',
    name: 'Growth',
    subtitle: 'Growing Multi-Unit Brands',
    badge: 'MOST POPULAR',
    color: '#6366f1',
    description: 'Advanced tools for restaurants expanding to multiple locations.',
    features: [
      'Everything in Core',
      'Multi-outlet Management (up to 5 outlets)',
      'Advanced KDS with Station Routing',
      'AI Demand Forecasting',
      'Centralized Analytics Across Outlets',
      'Staff Management (unlimited users)',
      'Customer CRM (unlimited)',
      'Social Growth Marketing Integration',
      'Loyalty & Repeat Customer Campaigns',
      'Dedicated Account Manager',
      'Priority Phone Support',
    ],
    notIncluded: ['Franchise Management', 'White-label Option', 'Open API Access'],
  },
  {
    id: 'scale',
    name: 'Scale',
    subtitle: 'Enterprises & Franchises',
    badge: 'ENTERPRISE',
    color: '#a855f7',
    description: 'Custom solutions for large-scale restaurant groups and franchises.',
    features: [
      'Everything in Growth',
      'Unlimited Outlets',
      'Franchise Management & Reporting',
      'White-label Option',
      'Open API Access',
      'Custom Integrations (ERP, PMS, etc.)',
      'Dedicated Growth Partner',
      'AI-powered Operational Intelligence',
      'Custom SLA Agreement',
      'On-site Support Available',
      'Compliance & Audit Support',
    ],
    notIncluded: [],
  },
];

const comparisonRows = [
  { label: 'Custom POS Configuration', core: true, growth: true, scale: true },
  { label: 'Seating & Floor Plans', core: true, growth: true, scale: true },
  { label: 'Kitchen Display System', core: true, growth: true, scale: true },
  { label: 'Inventory Management', core: true, growth: true, scale: true },
  { label: 'Payments & Billing', core: true, growth: true, scale: true },
  { label: 'Staff Management', core: '10 users', growth: 'Unlimited', scale: 'Unlimited' },
  { label: 'Customer CRM', core: '500 records', growth: 'Unlimited', scale: 'Unlimited' },
  { label: 'Outlet Management', core: '1 outlet', growth: 'Up to 5', scale: 'Unlimited' },
  { label: 'AI Demand Forecasting', core: false, growth: true, scale: true },
  { label: 'Social Growth Marketing', core: false, growth: true, scale: true },
  { label: 'Franchise Management', core: false, growth: false, scale: true },
  { label: 'Open API Access', core: false, growth: false, scale: true },
  { label: 'White-label Option', core: false, growth: false, scale: true },
  { label: 'Dedicated Account Manager', core: false, growth: true, scale: true },
  { label: 'Support', core: '24/7 Priority', growth: 'Priority Phone', scale: 'Custom SLA' },
];

const faqs = [
  { q: 'How is pricing determined?', a: 'Pricing is customized based on your restaurant\'s size, number of outlets, staff count, and specific feature requirements. We don\'t charge per-terminal or per-transaction fees. Contact us for a tailored quote.' },
  { q: 'Is setup and onboarding included?', a: 'Yes — all plans include our full 5-step process: Observe, Design, Build, Deploy, and Scale. Setup, menu configuration, floor plan creation, and staff training are all included at no extra charge.' },
  { q: 'Are there monthly recurring fees?', a: 'After the initial setup, there is an annual maintenance and support subscription. This covers updates, priority support, and ongoing system improvements. Specific pricing depends on your plan.' },
  { q: 'Can I upgrade my plan later?', a: 'Absolutely. You can upgrade from Core to Growth or Growth to Scale at any time. We migrate your data and configurations without any downtime.' },
  { q: 'Do you charge per device or terminal?', a: 'No. Masala Matrix is not licensed per device or terminal. You can run it on as many screens as you need within your plan\'s outlet limit.' },
];

function CheckCell({ value }) {
  if (value === true) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center' }}>
      <CheckCircle2 size={18} color="#10b981" />
    </div>
  );
  if (value === false) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center' }}>
      <X size={16} color="#374151" />
    </div>
  );
  return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center' }}>
      <span style={{ fontSize:'0.82rem', color:'#9ca3af', fontWeight:600, textAlign:'center' }}>{value}</span>
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div style={{ border:'1px solid #1f2937',borderRadius:12,overflow:'hidden' }} whileHover={{ borderColor:'#374151' }}>
      <button onClick={() => setOpen(!open)} style={{ width:'100%',background:'#111827',border:'none',color:'#f9fafb',padding:'20px 24px',display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer',textAlign:'left',gap:16 }}>
        <span style={{ fontWeight:600,fontSize:'0.975rem' }}>{q}</span>
        <motion.div animate={{ rotate:open?180:0 }} transition={{ duration:0.3 }}>
          <ChevronDown size={18} color="#6b7280" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height:0,opacity:0 }} animate={{ height:'auto',opacity:1 }} exit={{ height:0,opacity:0 }} transition={{ duration:0.3 }} style={{ overflow:'hidden' }}>
            <div style={{ padding:'0 24px 20px',color:'#9ca3af',fontSize:'0.9rem',lineHeight:1.75,background:'#111827',borderTop:'1px solid #1f2937' }}>{a}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Pricing() {
  return (
    <div>
      {/* Hero */}
      <section style={{ paddingTop:130,paddingBottom:80,position:'relative',overflow:'hidden',borderBottom:'1px solid #1f2937' }}>
        <motion.div animate={{ scale:[1,1.15,1],opacity:[0.2,0.35,0.2] }} transition={{ duration:7,repeat:Infinity }} style={{ position:'absolute',top:'0%',left:'50%',transform:'translateX(-50%)',width:700,height:400,background:'radial-gradient(ellipse,#6366f10a,transparent 70%)',pointerEvents:'none' }} />
        <div className="lp-container" style={{ textAlign:'center' }}>
          <motion.div initial={{ opacity:0,scale:0.8 }} animate={{ opacity:1,scale:1 }} transition={{ duration:0.5 }} style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'7px 14px',borderRadius:20,background:'#312e8122',border:'1px solid #6366f144',marginBottom:24 }}>
            <Zap size={12} color="#a5b4fc" fill="#a5b4fc" />
            <span style={{ fontSize:'0.75rem',fontWeight:700,color:'#a5b4fc',letterSpacing:'0.06em' }}>TRANSPARENT PRICING</span>
          </motion.div>
          <motion.h1 initial={{ opacity:0,y:40 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.8,ease,delay:0.1 }} style={{ fontSize:'clamp(2.5rem,5vw,4rem)',fontWeight:900,lineHeight:1.08,letterSpacing:'-0.04em',marginBottom:20,maxWidth:720,margin:'0 auto 20px' }}>
            Flexible plans for every restaurant.
          </motion.h1>
          <motion.p initial={{ opacity:0,y:30 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.7,ease,delay:0.25 }} style={{ color:'#9ca3af',fontSize:'1.15rem',lineHeight:1.7,maxWidth:520,margin:'0 auto 16px' }}>
            No per-terminal fees. No hidden charges. Setup, training, and onboarding included in every plan.
          </motion.p>
          <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }} style={{ color:'#6b7280',fontSize:'0.875rem' }}>
            Custom quotes based on your restaurant size. <Link to="/contact" style={{ color:'#818cf8',textDecoration:'none' }}>Contact us →</Link>
          </motion.p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section style={{ padding:'80px 0',borderBottom:'1px solid #1f2937' }}>
        <div className="lp-container">
          <motion.div initial="hidden" whileInView="show" viewport={{ once:true,margin:'-60px' }} variants={stagger(0.12)} style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:24,maxWidth:1000,margin:'0 auto' }}>
            {tiers.map((tier) => (
              <motion.div
                key={tier.id}
                variants={fadeUp}
                whileHover={{ y:tier.badge==='MOST POPULAR'?-12:-6,boxShadow:tier.badge==='MOST POPULAR'?'0 30px 80px rgba(37,99,235,0.25)':'0 20px 50px rgba(0,0,0,0.3)' }}
                style={{ background:tier.badge==='MOST POPULAR'?'linear-gradient(160deg,#111827,#0f172a)':'#111827',border:tier.badge==='MOST POPULAR'?`1px solid ${tier.color}88`:'1px solid #1f2937',borderRadius:16,padding:32,position:'relative',display:'flex',flexDirection:'column' }}
              >
                {tier.badge && (
                  <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring',delay:0.5 }} style={{ position:'absolute',top:-14,left:'50%',transform:'translateX(-50%)',background:`linear-gradient(135deg,${tier.color},${tier.color}99)`,color:'white',fontSize:'0.7rem',fontWeight:800,padding:'5px 14px',borderRadius:20,letterSpacing:'0.08em',whiteSpace:'nowrap' }}>
                    {tier.badge === 'MOST POPULAR' ? '★ MOST POPULAR' : tier.badge}
                  </motion.div>
                )}
                <div style={{ marginBottom:8 }}>
                  <h3 style={{ fontSize:'1.6rem',fontWeight:800,letterSpacing:'-0.02em' }}>{tier.name}</h3>
                  <p style={{ color:tier.color,fontSize:'0.8rem',fontWeight:600,marginTop:2 }}>{tier.subtitle}</p>
                </div>
                <p style={{ color:'#9ca3af',fontSize:'0.875rem',marginBottom:24,lineHeight:1.6 }}>{tier.description}</p>
                <div style={{ fontSize:'1.8rem',fontWeight:900,color:'#f9fafb',marginBottom:4 }}>Custom</div>
                <div style={{ color:'#6b7280',fontSize:'0.78rem',marginBottom:24 }}>Quote based on your restaurant size</div>
                <ul style={{ flex:1,display:'flex',flexDirection:'column',gap:11,marginBottom:28,paddingTop:20,borderTop:'1px solid #1f2937' }}>
                  {tier.features.map((f,i) => (
                    <li key={i} style={{ display:'flex',alignItems:'flex-start',gap:10 }}>
                      <CheckCircle2 size={14} color={tier.color} style={{ marginTop:3,flexShrink:0 }} />
                      <span style={{ color:'#d1d5db',fontSize:'0.85rem',lineHeight:1.5 }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <motion.div whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}>
                  <Link to="/contact" className={`lp-btn ${tier.badge==='MOST POPULAR'?'lp-btn-primary':'lp-btn-secondary'}`} style={{ width:'100%',justifyContent:'center',fontWeight:700,textDecoration:'none',display:'flex',alignItems:'center',gap:6 }}>
                    {tier.id==='scale'?'Contact Sales':'Get a Quote'} <ArrowRight size={15} />
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
          <motion.p initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} style={{ textAlign:'center',marginTop:32,color:'#6b7280',fontSize:'0.875rem' }}>
            All plans include setup, menu configuration, floor plan setup, and staff training.
          </motion.p>
        </div>
      </section>

      {/* Comparison Table */}
      <section style={{ padding:'80px 0',borderBottom:'1px solid #1f2937',background:'#0d1117' }}>
        <div className="lp-container">
          <SectionHeader badge="COMPARE" title="Feature comparison." subtitle="See exactly what's included in each plan." />
          <motion.div initial={{ opacity:0,y:30 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} style={{ overflowX:'auto',borderRadius:16,border:'1px solid #1f2937' }}>
            <table style={{ width:'100%',borderCollapse:'collapse',background:'#111827',fontSize:'0.875rem' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid #1f2937' }}>
                  <th style={{ padding:'16px 24px',textAlign:'left',color:'#6b7280',fontWeight:600,fontSize:'0.8rem',textTransform:'uppercase',letterSpacing:'0.05em' }}>Feature</th>
                  {tiers.map(t => (
                    <th key={t.id} style={{ padding:'16px 24px',textAlign:'center',color:t.badge==='MOST POPULAR'?'#a5b4fc':'#f9fafb',fontWeight:700,minWidth:140 }}>{t.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row,i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity:0,x:-20 }}
                    whileInView={{ opacity:1,x:0 }}
                    viewport={{ once:true }}
                    transition={{ delay:i*0.04 }}
                    style={{ borderBottom:'1px solid #1f2937',background:i%2===0?'transparent':'#0d1117' }}
                  >
                    <td style={{ padding:'14px 24px',color:'#d1d5db',fontWeight:500,verticalAlign:'middle' }}>{row.label}</td>
                    <td style={{ padding:'14px 24px',verticalAlign:'middle' }}><CheckCell value={row.core} /></td>
                    <td style={{ padding:'14px 24px',verticalAlign:'middle' }}><CheckCell value={row.growth} /></td>
                    <td style={{ padding:'14px 24px',verticalAlign:'middle' }}><CheckCell value={row.scale} /></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding:'80px 0',borderBottom:'1px solid #1f2937' }}>
        <div className="lp-container" style={{ maxWidth:760,margin:'0 auto' }}>
          <SectionHeader badge="FAQ" title="Pricing questions answered." />
          <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
            {faqs.map((faq,i) => <FaqItem key={i} {...faq} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:'80px 0' }}>
        <div className="lp-container">
          <motion.div initial={{ opacity:0,y:40 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ duration:0.7 }} style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:20 }}>
            <motion.div whileHover={{ y:-4 }} style={{ background:'linear-gradient(135deg,#312e8122,#6366f118)',border:'1px solid #6366f133',borderRadius:16,padding:36 }}>
              <MessageSquare size={28} color="#818cf8" style={{ marginBottom:16 }} />
              <h3 style={{ fontSize:'1.2rem',fontWeight:700,marginBottom:10 }}>Not sure which plan?</h3>
              <p style={{ color:'#9ca3af',fontSize:'0.9rem',lineHeight:1.7,marginBottom:24 }}>Talk to us and we'll recommend the right plan for your restaurant's size and goals.</p>
              <Link to="/contact" className="lp-btn lp-btn-primary" style={{ textDecoration:'none',display:'inline-flex',alignItems:'center',gap:8,fontWeight:700 }}>
                Talk to Sales <ArrowRight size={16} />
              </Link>
            </motion.div>
            <motion.div whileHover={{ y:-4 }} style={{ background:'#111827',border:'1px solid #1f2937',borderRadius:16,padding:36 }}>
              <Zap size={28} color="#10b981" style={{ marginBottom:16 }} />
              <h3 style={{ fontSize:'1.2rem',fontWeight:700,marginBottom:10 }}>Want a live demo first?</h3>
              <p style={{ color:'#9ca3af',fontSize:'0.9rem',lineHeight:1.7,marginBottom:24 }}>See Masala Matrix running for a restaurant similar to yours before committing to anything.</p>
              <a href="https://wa.me/917791073995" className="lp-btn lp-btn-secondary" style={{ textDecoration:'none',display:'inline-flex',alignItems:'center',gap:8,fontWeight:700 }}>
                Book Demo on WhatsApp <ArrowRight size={16} />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
