import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Zap, MessageSquare, Mail, Phone, MapPin, CheckCircle2, Clock, Users, Send } from 'lucide-react';
import { fadeUp, fadeIn, stagger, scaleUp, ease } from '../utils/animations';

const restaurantTypes = ['QSR / Fast Food', 'Casual Dining', 'Fine Dining', 'Café / Bakery', 'Dhaba / Local Restaurant', 'Cloud Kitchen', 'Bar & Lounge', 'Franchise', 'Food Court / Multi-brand', 'Other'];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', restaurant: '', type: '', outlets: '1', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    else if (!/^\+?[\d\s\-]{8,15}$/.test(form.phone)) e.phone = 'Enter a valid phone number';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.restaurant.trim()) e.restaurant = 'Restaurant name is required';
    if (!form.type) e.type = 'Please select a restaurant type';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    // Build WhatsApp message
    const msg = encodeURIComponent(
      `Hi Masala Matrix! I'd like to request a consultation.\n\n` +
      `Name: ${form.name}\n` +
      `Restaurant: ${form.restaurant}\n` +
      `Type: ${form.type}\n` +
      `Outlets: ${form.outlets}\n` +
      `Phone: ${form.phone}\n` +
      (form.email ? `Email: ${form.email}\n` : '') +
      (form.message ? `\nMessage: ${form.message}` : '')
    );
    window.open(`https://wa.me/917791073995?text=${msg}`, '_blank');
    setSubmitted(true);
  };

  const field = (key, label, type = 'text', placeholder = '') => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: '0.825rem', fontWeight: 600, color: '#c3c8d4', letterSpacing: '0.02em' }}>{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => { setForm(f => ({ ...f, [key]: e.target.value })); if (errors[key]) setErrors(er => ({ ...er, [key]: null })); }}
        placeholder={placeholder}
        style={{ background: '#0b0f19', border: `1px solid ${errors[key] ? '#ef4444' : '#9fa8ba'}`, borderRadius: 8, padding: '12px 14px', color: '#f9fafb', fontSize: '0.925rem', outline: 'none', transition: 'border-color 0.2s', fontFamily: 'inherit' }}
        onFocus={e => e.target.style.borderColor = '#6366f1'}
        onBlur={e => e.target.style.borderColor = errors[key] ? '#ef4444' : '#9fa8ba'}
      />
      {errors[key] && <span style={{ color: '#ef4444', fontSize: '0.78rem' }}>{errors[key]}</span>}
    </div>
  );

  return (
    <div>
      {/* Hero */}
      <section style={{ paddingTop:130,paddingBottom:80,position:'relative',overflow:'hidden',borderBottom:'1px solid #1f2937' }}>
        {/* Atmospheric background */}
        <div style={{ position:'absolute',inset:0,pointerEvents:'none',zIndex:0 }}>
          <div style={{ position:'absolute',inset:0,backgroundImage:'radial-gradient(rgba(99,102,241,0.055) 1px,transparent 1px)',backgroundSize:'40px 40px' }} />
          <div style={{ position:'absolute',top:'-10%',left:'50%',transform:'translateX(-50%)',width:'80%',height:360,background:'radial-gradient(ellipse at center,rgba(99,102,241,0.13) 0%,rgba(168,85,247,0.05) 50%,transparent 70%)' }} />
          <div style={{ position:'absolute',bottom:0,left:'15%',right:'15%',height:1,background:'linear-gradient(90deg,transparent,rgba(99,102,241,0.28),transparent)' }} />
          <svg style={{ position:'absolute',inset:0,width:'100%',height:'100%' }} preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="co1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6366f1" stopOpacity="0.1"/><stop offset="100%" stopColor="#a855f7" stopOpacity="0.02"/></linearGradient>
              <linearGradient id="co2" x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#a855f7" stopOpacity="0.08"/><stop offset="100%" stopColor="#6366f1" stopOpacity="0.01"/></linearGradient>
            </defs>
            <line x1="0" y1="65%" x2="20%" y2="0" stroke="url(#co1)" strokeWidth="1"/>
            <line x1="100%" y1="45%" x2="80%" y2="100%" stroke="url(#co2)" strokeWidth="1"/>
          </svg>
          {/* Floating response time chip */}
          <motion.div initial={{ opacity:0,x:-16 }} animate={{ opacity:0.7,x:0 }} transition={{ delay:1,duration:0.8 }}>
            <motion.div animate={{ y:[0,-6,0] }} transition={{ duration:5,repeat:Infinity,ease:'easeInOut' }} style={{ position:'absolute',left:32,top:'32%',background:'rgba(9,10,18,0.9)',backdropFilter:'blur(12px)',border:'1px solid rgba(16,185,129,0.22)',borderRadius:10,padding:'10px 14px',display:'flex',alignItems:'center',gap:10 }}>
              <motion.div animate={{ scale:[1,1.3,1] }} transition={{ duration:2,repeat:Infinity }} style={{ width:7,height:7,borderRadius:'50%',background:'#10b981',boxShadow:'0 0 7px #10b981' }} />
              <div><div style={{ fontSize:10,fontWeight:700,color:'#f9fafb' }}>Avg. response time</div><div style={{ fontSize:9,color:'#10b981',fontWeight:700 }}>&lt; 1 hour on WhatsApp</div></div>
            </motion.div>
          </motion.div>
          <motion.div initial={{ opacity:0,x:16 }} animate={{ opacity:0.6,x:0 }} transition={{ delay:1.6,duration:0.8 }}>
            <motion.div animate={{ y:[0,-7,0] }} transition={{ duration:5.5,repeat:Infinity,ease:'easeInOut',delay:1 }} style={{ position:'absolute',right:32,top:'28%',background:'rgba(9,10,18,0.9)',backdropFilter:'blur(12px)',border:'1px solid rgba(99,102,241,0.22)',borderRadius:10,padding:'10px 14px' }}>
              <div style={{ fontSize:8,color:'#b4bac8',fontWeight:700,letterSpacing:'0.06em',marginBottom:3 }}>FREE CONSULTATION</div>
              <div style={{ fontSize:11,fontWeight:700,color:'#f9fafb' }}>No commitment required</div>
            </motion.div>
          </motion.div>
        </div>
        <div className="lp-container" style={{ textAlign:'center' }}>
          <motion.div initial={{ opacity:0,scale:0.8 }} animate={{ opacity:1,scale:1 }} transition={{ duration:0.5 }} style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'7px 14px',borderRadius:20,background:'#312e8122',border:'1px solid #6366f144',marginBottom:24 }}>
            <Zap size={12} color="#a5b4fc" fill="#a5b4fc" />
            <span style={{ fontSize:'0.75rem',fontWeight:700,color:'#a5b4fc',letterSpacing:'0.06em' }}>GET IN TOUCH</span>
          </motion.div>
          <motion.h1 initial={{ opacity:0,y:40 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.8,ease,delay:0.1 }} style={{ fontSize:'clamp(2.5rem,5vw,4rem)',fontWeight:900,lineHeight:1.08,letterSpacing:'-0.04em',marginBottom:20,maxWidth:700,margin:'0 auto 20px' }}>
            Let's talk about your restaurant.
          </motion.h1>
          <motion.p initial={{ opacity:0,y:30 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.7,ease,delay:0.25 }} style={{ color:'#c3c8d4',fontSize:'1.15rem',lineHeight:1.7,maxWidth:500,margin:'0 auto 16px' }}>
            Tell us how you run things. We'll show you exactly how Masala Matrix can be configured for your restaurant.
          </motion.p>
        </div>
      </section>

      {/* Main content */}
      <section style={{ padding:'80px 0 100px',borderBottom:'1px solid #1f2937' }}>
        <div className="lp-container">
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:60,alignItems:'flex-start' }}>

            {/* Form */}
            <motion.div initial={{ opacity:0,x:-40 }} whileInView={{ opacity:1,x:0 }} viewport={{ once:true }} transition={{ duration:0.7,ease }}>
              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.form key="form" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onSubmit={handleSubmit}>
                    <h2 style={{ fontSize:'1.5rem',fontWeight:800,marginBottom:8,letterSpacing:'-0.02em' }}>Request a Consultation</h2>
                    <p style={{ color:'#c3c8d4',fontSize:'0.9rem',marginBottom:32,lineHeight:1.6 }}>Fill in your details and we'll reach out via WhatsApp within the hour.</p>

                    <div style={{ display:'flex',flexDirection:'column',gap:20 }}>
                      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16 }}>
                        {field('name', 'Your Name *', 'text', 'Arjun Mehta')}
                        {field('phone', 'Phone Number *', 'tel', '+91 98765 43210')}
                      </div>
                      {field('email', 'Email (optional)', 'email', 'arjun@restaurant.com')}
                      {field('restaurant', 'Restaurant Name *', 'text', 'The Tandoor House')}

                      <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
                        <label style={{ fontSize:'0.825rem',fontWeight:600,color:'#c3c8d4' }}>Restaurant Type *</label>
                        <select
                          value={form.type}
                          onChange={e => { setForm(f => ({ ...f, type: e.target.value })); if (errors.type) setErrors(er => ({ ...er, type: null })); }}
                          style={{ background:'#0b0f19',border:`1px solid ${errors.type?'#ef4444':'#9fa8ba'}`,borderRadius:8,padding:'12px 14px',color:form.type?'#f9fafb':'#b4bac8',fontSize:'0.925rem',outline:'none',fontFamily:'inherit' }}
                        >
                          <option value="">Select restaurant type</option>
                          {restaurantTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        {errors.type && <span style={{ color:'#ef4444',fontSize:'0.78rem' }}>{errors.type}</span>}
                      </div>

                      <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
                        <label style={{ fontSize:'0.825rem',fontWeight:600,color:'#c3c8d4' }}>Number of Outlets</label>
                        <div style={{ display:'flex',gap:10,flexWrap:'wrap' }}>
                          {['1','2–3','4–5','6–10','10+'].map(o => (
                            <motion.button key={o} type="button" onClick={() => setForm(f => ({ ...f, outlets: o }))} whileTap={{ scale:0.95 }} style={{ padding:'8px 18px',borderRadius:999,border:`1px solid ${form.outlets===o?'#6366f1':'#9fa8ba'}`,background:form.outlets===o?'#6366f118':'transparent',color:form.outlets===o?'#a5b4fc':'#c3c8d4',fontSize:'0.85rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit',transition:'all 0.2s' }}>
                              {o}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
                        <label style={{ fontSize:'0.825rem',fontWeight:600,color:'#c3c8d4' }}>Anything specific you'd like us to know?</label>
                        <textarea
                          value={form.message}
                          onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                          placeholder="e.g. We have 3 kitchens, serve 200+ covers on weekends, and currently use a manual billing system..."
                          rows={4}
                          style={{ background:'#0b0f19',border:'1px solid #9fa8ba',borderRadius:8,padding:'12px 14px',color:'#f9fafb',fontSize:'0.925rem',outline:'none',resize:'vertical',fontFamily:'inherit',lineHeight:1.6 }}
                          onFocus={e => e.target.style.borderColor='#6366f1'}
                          onBlur={e => e.target.style.borderColor='#9fa8ba'}
                        />
                      </div>

                      <motion.button type="submit" whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }} className="lp-btn lp-btn-primary" style={{ width:'100%',justifyContent:'center',fontSize:'1rem',padding:'14px',fontWeight:700,gap:10,border:'none',cursor:'pointer',fontFamily:'inherit',borderRadius:50 }}>
                        Send via WhatsApp <Send size={18} />
                      </motion.button>

                      <p style={{ color:'#b4bac8',fontSize:'0.78rem',textAlign:'center',lineHeight:1.5 }}>
                        Submitting will open WhatsApp with your details pre-filled. We typically respond within 1 hour.
                      </p>
                    </div>
                  </motion.form>
                ) : (
                  <motion.div key="thanks" initial={{ opacity:0,scale:0.9 }} animate={{ opacity:1,scale:1 }} transition={{ type:'spring',stiffness:200 }} style={{ textAlign:'center',padding:'60px 40px',background:'linear-gradient(135deg,#111827,#0f172a)',border:'1px solid #6366f144',borderRadius:20 }}>
                    <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring',delay:0.2 }} style={{ width:72,height:72,borderRadius:'50%',background:'linear-gradient(135deg,#10b981,#059669)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 24px' }}>
                      <CheckCircle2 size={32} color="white" />
                    </motion.div>
                    <h3 style={{ fontSize:'1.6rem',fontWeight:800,marginBottom:12,letterSpacing:'-0.02em' }}>WhatsApp opened!</h3>
                    <p style={{ color:'#c3c8d4',lineHeight:1.7,marginBottom:28 }}>Your details have been pre-filled in the message. Just hit send and we'll get back to you within the hour.</p>
                    <motion.button onClick={() => setSubmitted(false)} whileHover={{ scale:1.03 }} className="lp-btn lp-btn-secondary" style={{ border:'none',cursor:'pointer',fontFamily:'inherit' }}>
                      Submit another enquiry
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Contact info panel */}
            <motion.div initial={{ opacity:0,x:40 }} whileInView={{ opacity:1,x:0 }} viewport={{ once:true }} transition={{ duration:0.7,ease }} style={{ display:'flex',flexDirection:'column',gap:20 }}>
              {/* WhatsApp CTA */}
              <motion.a
                href="https://wa.me/917791073995"
                whileHover={{ y:-4,boxShadow:'0 20px 50px rgba(37,99,235,0.2)' }}
                style={{ background:'linear-gradient(135deg,#312e8122,#6366f118)',border:'1px solid #6366f144',borderRadius:16,padding:28,display:'flex',gap:16,alignItems:'flex-start',textDecoration:'none' }}
              >
                <div style={{ width:48,height:48,borderRadius:12,background:'linear-gradient(135deg,#6366f1,#a855f7)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                  <MessageSquare size={22} color="white" />
                </div>
                <div>
                  <div style={{ fontWeight:700,marginBottom:4,fontSize:'1rem',color:'#f9fafb' }}>Chat on WhatsApp</div>
                  <div style={{ color:'#c3c8d4',fontSize:'0.875rem',lineHeight:1.6,marginBottom:12 }}>Fastest way to reach us. Typical response time: under 1 hour.</div>
                  <div style={{ color:'#a5b4fc',fontSize:'0.85rem',fontWeight:600,display:'flex',alignItems:'center',gap:6 }}>
                    +91 77910 73995 <ArrowRight size={14} />
                  </div>
                </div>
              </motion.a>

              <motion.a href="mailto:support@masalamatrix.com" whileHover={{ y:-4 }} style={{ background:'#111827',border:'1px solid #1f2937',borderRadius:16,padding:24,display:'flex',gap:14,alignItems:'center',textDecoration:'none' }}>
                <div style={{ width:44,height:44,borderRadius:10,background:'#10b98118',border:'1px solid #10b98133',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                  <Mail size={20} color="#10b981" />
                </div>
                <div>
                  <div style={{ fontWeight:600,fontSize:'0.9rem',color:'#f9fafb',marginBottom:2 }}>Email Us</div>
                  <div style={{ color:'#c3c8d4',fontSize:'0.85rem' }}>support@masalamatrix.com</div>
                </div>
              </motion.a>

              {[
                { icon:Clock,color:'#f59e0b',title:'Response Time',desc:'Within 1 hour on WhatsApp, same day via email.' },
                { icon:Users,color:'#8b5cf6',title:'Free Consultation',desc:'No commitment. We\'ll discuss your restaurant first.' },
                { icon:CheckCircle2,color:'#10b981',title:'No Sales Pressure',desc:'We only move forward if it\'s the right fit for both.' },
              ].map((info,i) => (
                <motion.div key={i} whileHover={{ y:-2 }} style={{ background:'#111827',border:'1px solid #1f2937',borderRadius:12,padding:'18px 22px',display:'flex',gap:14,alignItems:'flex-start' }}>
                  <div style={{ width:36,height:36,borderRadius:8,background:`${info.color}18`,border:`1px solid ${info.color}33`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                    <info.icon size={16} color={info.color} />
                  </div>
                  <div>
                    <div style={{ fontWeight:600,fontSize:'0.875rem',color:'#f9fafb',marginBottom:3 }}>{info.title}</div>
                    <div style={{ color:'#c3c8d4',fontSize:'0.825rem',lineHeight:1.6 }}>{info.desc}</div>
                  </div>
                </motion.div>
              ))}

              {/* Quote */}
              <motion.div whileHover={{ y:-2 }} style={{ background:'#0d1117',border:'1px solid #1f2937',borderRadius:12,padding:24 }}>
                <div style={{ display:'flex',gap:4,marginBottom:12 }}>
                  {[1,2,3,4,5].map(i => <span key={i} style={{ fontSize:'0.8rem',color:'#f59e0b' }}>★</span>)}
                </div>
                <p style={{ color:'#d1d5db',fontSize:'0.875rem',lineHeight:1.75,fontStyle:'italic',marginBottom:16 }}>
                  "The first call with Masala Matrix felt different. They asked about our kitchen layout before even mentioning pricing."
                </p>
                <div style={{ fontSize:'0.78rem',color:'#b4bac8',fontWeight:600 }}>— Restaurant owner, Pune</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
