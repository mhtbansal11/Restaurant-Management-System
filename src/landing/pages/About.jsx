import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Target, Heart, Lightbulb, Shield, TrendingUp, Users, Star, Quote } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import { fadeUp, fadeIn, stagger, scaleUp, slideLeft, slideRight, ease } from '../utils/animations';

const values = [
  { icon: Target, color: '#818cf8', title: 'Fit Over Features', description: 'We\'d rather build 10 features that perfectly fit your restaurant than 100 that kind of work for everyone.' },
  { icon: Heart, color: '#ec4899', title: 'Restaurant-First', description: 'Every decision we make is through the lens of what actually helps restaurants run better and grow faster.' },
  { icon: Lightbulb, color: '#f59e0b', title: 'Observe Before Building', description: 'We never assume. We observe your restaurant in action before designing or building a single thing.' },
  { icon: Shield, color: '#10b981', title: 'Long-Term Accountability', description: 'Our relationship doesn\'t end at go-live. We stay invested in your success weeks, months, and years after launch.' },
];

const team = [
  { name: 'Mohit', role: 'Founder & Product Lead', initial: 'M', color: '#6366f1', bio: 'Restaurant operations obsessive. Built Masala Matrix after seeing 50+ restaurants struggle with software that didn\'t fit.' },
  { name: 'Nikhil', role: 'Sales Manager', initial: 'N', color: '#a855f7', bio: 'Helps restaurants find the right fit. Turns demos into long-term partnerships by understanding what each restaurant actually needs before selling anything.' },
  { name: 'Sharath', role: 'Implementation Manager', initial: 'S', color: '#10b981', bio: 'Former restaurant manager. Bridges the gap between what the system does and what your team actually needs.' },
];

const milestones = [
  { year: '2022', label: 'Started', desc: 'Masala Matrix began as a custom project for a single restaurant in Mumbai.' },
  { year: '2023', label: 'Grew to 50+', desc: 'Word spread. We expanded to 50 restaurants across 3 cities without a single ad.' },
  { year: '2024', label: 'AI Integration', desc: 'Added demand forecasting, chatbot, and operational intelligence to the platform.' },
  { year: '2026', label: 'Today', desc: '200+ restaurants, 1M+ orders processed, and growing.' },
];

export default function About() {
  return (
    <div>
      {/* Hero */}
      <section style={{ paddingTop:130,paddingBottom:80,position:'relative',overflow:'hidden',borderBottom:'1px solid #1f2937' }}>
        {/* Atmospheric background */}
        <div style={{ position:'absolute',inset:0,pointerEvents:'none',zIndex:0 }}>
          <div style={{ position:'absolute',inset:0,backgroundImage:'radial-gradient(rgba(168,85,247,0.055) 1px,transparent 1px)',backgroundSize:'40px 40px' }} />
          <div style={{ position:'absolute',top:-60,right:0,width:500,height:500,background:'radial-gradient(circle,rgba(168,85,247,0.1),transparent 70%)' }} />
          <div style={{ position:'absolute',bottom:-60,left:'50%',transform:'translateX(-50%)',width:'90%',height:300,background:'radial-gradient(ellipse at center,rgba(99,102,241,0.12) 0%,transparent 70%)' }} />
          <svg style={{ position:'absolute',inset:0,width:'100%',height:'100%' }} preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="ab1" x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#a855f7" stopOpacity="0.1"/><stop offset="100%" stopColor="#6366f1" stopOpacity="0.02"/></linearGradient>
            </defs>
            <line x1="100%" y1="30%" x2="70%" y2="100%" stroke="url(#ab1)" strokeWidth="1"/>
            <line x1="95%" y1="0" x2="78%" y2="50%" stroke="url(#ab1)" strokeWidth="0.5"/>
          </svg>
          {/* Floating stat chips */}
          <motion.div initial={{ opacity:0,x:-16 }} animate={{ opacity:0.7,x:0 }} transition={{ delay:1.2,duration:0.8 }}>
            <motion.div animate={{ y:[0,-7,0] }} transition={{ duration:5.5,repeat:Infinity,ease:'easeInOut' }} style={{ position:'absolute',right:40,top:'28%',background:'rgba(9,10,18,0.9)',backdropFilter:'blur(12px)',border:'1px solid rgba(99,102,241,0.22)',borderRadius:10,padding:'10px 16px' }}>
              <div style={{ fontSize:8,color:'#b4bac8',fontWeight:700,letterSpacing:'0.06em',marginBottom:4 }}>RESTAURANTS SERVED</div>
              <div style={{ fontSize:20,fontWeight:900,color:'#818cf8',letterSpacing:'-0.04em' }}>200+</div>
              <div style={{ fontSize:8,color:'#10b981',marginTop:2 }}>↑ Growing every month</div>
            </motion.div>
          </motion.div>
          <motion.div initial={{ opacity:0,x:-16 }} animate={{ opacity:0.65,x:0 }} transition={{ delay:1.8,duration:0.8 }}>
            <motion.div animate={{ y:[0,-6,0] }} transition={{ duration:6,repeat:Infinity,ease:'easeInOut',delay:1.2 }} style={{ position:'absolute',right:40,top:'56%',background:'rgba(9,10,18,0.9)',backdropFilter:'blur(12px)',border:'1px solid rgba(16,185,129,0.22)',borderRadius:10,padding:'10px 16px' }}>
              <div style={{ fontSize:8,color:'#b4bac8',fontWeight:700,letterSpacing:'0.06em',marginBottom:4 }}>ORDERS PROCESSED</div>
              <div style={{ fontSize:20,fontWeight:900,color:'#10b981',letterSpacing:'-0.04em' }}>1M+</div>
              <div style={{ fontSize:8,color:'#c3c8d4',marginTop:2 }}>Across all restaurants</div>
            </motion.div>
          </motion.div>
        </div>
        <div className="lp-container">
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:60,alignItems:'center' }}>
            <motion.div initial="hidden" animate="show" variants={stagger(0.12)}>
              <motion.div variants={fadeIn} style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'7px 14px',borderRadius:20,background:'#312e8122',border:'1px solid #6366f144',marginBottom:24 }}>
                <Zap size={12} color="#a5b4fc" fill="#a5b4fc" />
                <span style={{ fontSize:'0.75rem',fontWeight:700,color:'#a5b4fc',letterSpacing:'0.06em' }}>OUR STORY</span>
              </motion.div>
              <motion.h1 variants={fadeUp} style={{ fontSize:'clamp(2.2rem,4.5vw,3.6rem)',fontWeight:900,lineHeight:1.1,letterSpacing:'-0.04em',marginBottom:20 }}>
                We built Masala Matrix because <span style={{ color:'#818cf8' }}>we were frustrated</span> too.
              </motion.h1>
              <motion.p variants={fadeUp} style={{ color:'#c3c8d4',fontSize:'1.1rem',lineHeight:1.75,marginBottom:16 }}>
                We spent years watching restaurants struggle with software that forced them to work differently. POS systems with confusing interfaces. Inventory tools built for retail. KDS screens that didn't match the kitchen layout.
              </motion.p>
              <motion.p variants={fadeUp} style={{ color:'#c3c8d4',fontSize:'1.1rem',lineHeight:1.75,marginBottom:32 }}>
                So we built something different. Software that we configure <em style={{ color:'#d1d5db' }}>around</em> the restaurant — not the other way around.
              </motion.p>
              <motion.div variants={fadeUp} style={{ display:'flex',flexWrap:'wrap',gap:14 }}>
                <motion.div style={{ display:'inline-flex' }} whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}>
                  <Link to="/contact" className="lp-btn lp-btn-primary" style={{ fontSize:'1rem',padding:'14px 28px',gap:8,textDecoration:'none',display:'inline-flex',alignItems:'center' }}>
                    Work With Us <ArrowRight size={18} />
                  </Link>
                </motion.div>
                <motion.div style={{ display:'inline-flex' }} whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}>
                  <Link to="/features" className="lp-btn lp-btn-secondary" style={{ fontSize:'1rem',padding:'14px 28px',textDecoration:'none',display:'inline-flex',alignItems:'center' }}>
                    See the Product
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Stats panel */}
            <motion.div initial={{ opacity:0,scale:0.9 }} animate={{ opacity:1,scale:1 }} transition={{ duration:0.8,ease,delay:0.3 }} style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16 }}>
              {[
                { value:'200+',label:'Restaurants',color:'#818cf8' },
                { value:'1M+',label:'Orders Processed',color:'#10b981' },
                { value:'4+',label:'Years of Experience',color:'#f59e0b' },
                { value:'99.9%',label:'Uptime',color:'#8b5cf6' },
              ].map((s,i) => (
                <motion.div key={i} whileHover={{ y:-4 }} style={{ background:'#111827',border:'1px solid #1f2937',borderRadius:14,padding:24,textAlign:'center' }}>
                  <div style={{ fontSize:'2rem',fontWeight:900,color:s.color,letterSpacing:'-0.04em',marginBottom:4 }}>{s.value}</div>
                  <div style={{ color:'#b4bac8',fontSize:'0.8rem',fontWeight:500 }}>{s.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section style={{ padding:'80px 0',borderBottom:'1px solid #1f2937',background:'#0d1117' }}>
        <div className="lp-container" style={{ maxWidth:800,margin:'0 auto',textAlign:'center' }}>
          <motion.div initial={{ opacity:0,y:30 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ duration:0.7 }}>
            <Quote size={36} color="#6366f133" style={{ margin:'0 auto 24px' }} />
            <p style={{ fontSize:'clamp(1.2rem,2.5vw,1.7rem)',fontWeight:600,lineHeight:1.6,color:'#f9fafb',marginBottom:20,letterSpacing:'-0.02em' }}>
              "Our mission is to make restaurant technology that disappears into the background — so owners and staff can focus on what they actually love: serving great food."
            </p>
            <div style={{ color:'#b4bac8',fontSize:'0.875rem',fontWeight:600 }}>— Mohit, Founder of Masala Matrix</div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section style={{ padding:'80px 0',borderBottom:'1px solid #1f2937' }}>
        <div className="lp-container">
          <SectionHeader badge="VALUES" title="What we stand for." subtitle="Four principles that guide every decision we make at Masala Matrix." />
          <motion.div initial="hidden" whileInView="show" viewport={{ once:true,margin:'-60px' }} variants={stagger(0.12)} style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:20 }}>
            {values.map((v,i) => (
              <motion.div key={i} variants={scaleUp} whileHover={{ y:-6,boxShadow:`0 20px 50px ${v.color}18` }} style={{ background:'#111827',border:'1px solid #1f2937',borderRadius:14,padding:28 }}>
                <div style={{ width:48,height:48,borderRadius:12,background:`${v.color}18`,border:`1px solid ${v.color}33`,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:20 }}>
                  <v.icon size={22} color={v.color} />
                </div>
                <h4 style={{ fontSize:'1.1rem',fontWeight:700,marginBottom:10,color:'#f9fafb' }}>{v.title}</h4>
                <p style={{ color:'#c3c8d4',fontSize:'0.875rem',lineHeight:1.7 }}>{v.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Journey / Timeline */}
      <section style={{ padding:'80px 0',borderBottom:'1px solid #1f2937',background:'#0d1117' }}>
        <div className="lp-container">
          <SectionHeader badge="OUR JOURNEY" title="How we got here." subtitle="From a single restaurant project to a platform trusted by 200+ restaurants." />
          <div style={{ maxWidth:700,margin:'0 auto' }}>
            {milestones.map((m,i) => {
              const colors = ['#818cf8','#8b5cf6','#f59e0b','#10b981'];
              return (
                <motion.div key={i} initial={{ opacity:0,x:-30 }} whileInView={{ opacity:1,x:0 }} viewport={{ once:true }} transition={{ delay:i*0.12 }} style={{ display:'flex',gap:20,marginBottom:i<milestones.length-1?40:0 }}>
                  <div style={{ display:'flex',flexDirection:'column',alignItems:'center' }}>
                    <div style={{ width:44,height:44,borderRadius:'50%',background:`${colors[i]}18`,border:`2px solid ${colors[i]}55`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                      <span style={{ fontSize:'0.72rem',fontWeight:800,color:colors[i] }}>{m.year}</span>
                    </div>
                    {i < milestones.length-1 && <div style={{ width:2,flex:1,background:`linear-gradient(to bottom,${colors[i]}44,transparent)`,marginTop:6 }} />}
                  </div>
                  <div style={{ paddingBottom:i<milestones.length-1?0:0 }}>
                    <div style={{ fontWeight:800,fontSize:'1rem',color:'#f9fafb',marginBottom:4 }}>{m.label}</div>
                    <p style={{ color:'#c3c8d4',fontSize:'0.875rem',lineHeight:1.65 }}>{m.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={{ padding:'80px 0',borderBottom:'1px solid #1f2937' }}>
        <div className="lp-container">
          <SectionHeader badge="THE TEAM" title="People behind Masala Matrix." subtitle="A small, focused team obsessed with making restaurants run better." />
          <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger(0.15)} style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:24,maxWidth:900,margin:'0 auto' }}>
            {team.map((member,i) => (
              <motion.div key={i} variants={scaleUp} whileHover={{ y:-6 }} style={{ background:'#111827',border:'1px solid #1f2937',borderRadius:16,padding:28,textAlign:'center' }}>
                <div style={{ width:72,height:72,borderRadius:'50%',background:`linear-gradient(135deg,${member.color},${member.color}88)`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px',fontSize:'1.5rem',fontWeight:800,color:'white' }}>
                  {member.initial}
                </div>
                <h4 style={{ fontWeight:700,fontSize:'1.05rem',marginBottom:4 }}>{member.name}</h4>
                <div style={{ color:member.color,fontSize:'0.8rem',fontWeight:600,marginBottom:14 }}>{member.role}</div>
                <p style={{ color:'#c3c8d4',fontSize:'0.85rem',lineHeight:1.7 }}>{member.bio}</p>
              </motion.div>
            ))}
          </motion.div>
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
              <h2 style={{ fontSize:'clamp(1.6rem,3.5vw,2.4rem)',fontWeight:900,marginBottom:12,letterSpacing:'-0.04em' }}>Want to work with us?</h2>
              <p style={{ color:'#c3c8d4',fontSize:'1rem',marginBottom:36,maxWidth:480,margin:'12px auto 36px',lineHeight:1.7 }}>Whether you're a restaurant owner or want to join the team, we'd love to talk.</p>
              <div style={{ display:'flex',justifyContent:'center',flexWrap:'wrap',gap:14 }}>
                <motion.div style={{ display:'inline-flex' }} whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}>
                  <Link to="/contact" className="lp-btn lp-btn-primary" style={{ fontSize:'1rem',padding:'14px 28px',gap:8,textDecoration:'none',display:'inline-flex',alignItems:'center' }}>
                    Get in Touch <ArrowRight size={18} />
                  </Link>
                </motion.div>
                <motion.div style={{ display:'inline-flex' }} whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}>
                  <a href="https://wa.me/917791073995" className="lp-btn lp-btn-secondary" style={{ fontSize:'1rem',padding:'14px 28px',textDecoration:'none',display:'inline-flex',alignItems:'center' }}>
                    WhatsApp Us
                  </a>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
