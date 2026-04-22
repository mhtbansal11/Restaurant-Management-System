import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSuperAdmin } from '../SuperAdminContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const StatCard = ({ icon, label, value, sub, color = '#6366f1' }) => (
  <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 14, padding: 24 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{icon}</div>
      <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
    </div>
    <div style={{ fontSize: '2rem', fontWeight: 900, color, letterSpacing: '-0.03em' }}>{value}</div>
    {sub && <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: 6 }}>{sub}</div>}
  </div>
);

export default function SADashboard() {
  const { api } = useSuperAdmin();
  const [analytics, setAnalytics] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    Promise.all([api.get('/analytics'), api.get('/notifications')])
      .then(([aRes, nRes]) => {
        setAnalytics(aRes.data);
        setAlerts(nRes.data.slice(0, 5));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40, color: '#94a3b8' }}>Loading...</div>;

  const a = analytics || {};
  const pad = isMobile ? 16 : 32;

  return (
    <div style={{ padding: pad }}>
      <div style={{ marginBottom: isMobile ? 20 : 32 }}>
        <h1 style={{ fontSize: isMobile ? '1.3rem' : '1.6rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>Dashboard</h1>
        <p style={{ color: '#64748b', marginTop: 6, fontSize: '0.875rem' }}>Overview of all restaurants on Masala Matrix</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard icon="🍽️" label="Total Restaurants" value={a.total || 0} color="#6366f1" />
        <StatCard icon="✅" label="Active" value={a.active || 0} sub={`${a.trial || 0} on trial`} color="#10b981" />
        <StatCard icon="⛔" label="Suspended / Expired" value={(a.suspended || 0) + (a.expired || 0)} color="#ef4444" />
        <StatCard icon="💰" label="MRR" value={`₹${((a.mrr || 0) / 1000).toFixed(1)}K`} sub="from active paid clients" color="#f59e0b" />
        <StatCard icon="📦" label="Total Revenue" value={`₹${((a.totalRevenue || 0) / 1000).toFixed(1)}K`} color="#a855f7" />
        <StatCard icon="⚠️" label="Payment Overdue" value={a.overdue || 0} color="#f87171" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 380px', gap: 20 }}>
        {/* Monthly Chart */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 14, padding: 24 }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 20, color: '#f8fafc' }}>New Restaurants — Last 6 Months</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={a.monthlyCounts || []} barSize={28}>
              <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f8fafc' }} cursor={{ fill: '#6366f110' }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {(a.monthlyCounts || []).map((_, i, arr) => (
                  <Cell key={i} fill={i === arr.length - 1 ? '#6366f1' : '#334155'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Alerts */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 14, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', margin: 0, color: '#f8fafc' }}>Recent Alerts</h3>
            <Link to="/superadmin/notifications" style={{ color: '#818cf8', fontSize: '0.8rem', textDecoration: 'none' }}>View all →</Link>
          </div>
          {alerts.length === 0 && <p style={{ color: '#475569', fontSize: '0.875rem' }}>No alerts right now 🎉</p>}
          {alerts.map((alert, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 12, padding: '10px 12px', background: '#0f172a', borderRadius: 8, border: `1px solid ${alert.severity === 'danger' ? '#ef444430' : '#f59e0b30'}` }}>
              <span style={{ fontSize: 16 }}>{alert.severity === 'danger' ? '🔴' : '🟡'}</span>
              <div>
                <div style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.8rem' }}>{alert.outletName}</div>
                <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{alert.message}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
