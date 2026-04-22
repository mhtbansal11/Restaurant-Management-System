import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useSuperAdmin } from '../SuperAdminContext';

const typeConfig = {
  expired:       { icon: '💀', label: 'Expired',        bg: '#ef444420', border: '#ef444440', text: '#f87171' },
  critical:      { icon: '🔴', label: 'Critical',       bg: '#ef444420', border: '#ef444440', text: '#f87171' },
  expiring_soon: { icon: '🟡', label: 'Expiring Soon',  bg: '#f59e0b20', border: '#f59e0b40', text: '#fbbf24' },
  overdue:       { icon: '💸', label: 'Payment Overdue', bg: '#ef444420', border: '#ef444440', text: '#f87171' },
  payment_due:   { icon: '⏳', label: 'Payment Due',    bg: '#f59e0b20', border: '#f59e0b40', text: '#fbbf24' },
};

export default function SANotifications() {
  const { api } = useSuperAdmin();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/notifications')
      .then(r => setAlerts(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleExtend = async (outletId, outletName) => {
    const days = window.prompt(`Extend subscription for "${outletName}" by how many days?`, '30');
    if (!days || isNaN(days)) return;

    try {
      const res = await api.get(`/restaurants/${outletId}`);
      const current = new Date(res.data.subscriptionEndDate || Date.now());
      const newEnd = new Date(current.getTime() + parseInt(days) * 24 * 60 * 60 * 1000);
      await api.put(`/restaurants/${outletId}/subscription`, {
        subscriptionEndDate: newEnd.toISOString(),
        subscriptionStatus: 'active',
        paymentStatus: 'paid',
      });
      toast.success(`Subscription extended by ${days} days`);
      const r = await api.get('/notifications');
      setAlerts(r.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.type === filter || a.severity === filter);

  const counts = {
    all: alerts.length,
    danger: alerts.filter(a => a.severity === 'danger').length,
    warning: alerts.filter(a => a.severity === 'warning').length,
  };

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>Alerts & Notifications</h1>
        <p style={{ color: '#64748b', marginTop: 6, fontSize: '0.875rem' }}>
          {counts.danger > 0 && <span style={{ color: '#f87171', fontWeight: 600 }}>{counts.danger} critical · </span>}
          {counts.warning > 0 && <span style={{ color: '#fbbf24', fontWeight: 600 }}>{counts.warning} warnings · </span>}
          {alerts.length} total alerts
        </p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        {[
          { key: 'all', label: `All (${counts.all})` },
          { key: 'danger', label: `🔴 Critical (${counts.danger})` },
          { key: 'warning', label: `🟡 Warnings (${counts.warning})` },
        ].map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            style={{ padding: '8px 16px', borderRadius: 10, border: `1px solid ${filter === t.key ? '#6366f1' : '#334155'}`, background: filter === t.key ? '#6366f120' : 'transparent', color: filter === t.key ? '#818cf8' : '#94a3b8', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading && <div style={{ color: '#64748b' }}>Loading...</div>}

      {!loading && filtered.length === 0 && (
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 14, padding: 60, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
          <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: '1.1rem' }}>All clear!</div>
          <div style={{ color: '#475569', marginTop: 8 }}>No alerts right now.</div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map((alert, i) => {
          const cfg = typeConfig[alert.type] || typeConfig.expiring_soon;
          return (
            <div key={i} style={{ background: '#1e293b', border: `1px solid ${cfg.border}`, borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{cfg.icon}</div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.95rem' }}>{alert.outletName}</span>
                  <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: '0.68rem', fontWeight: 700, background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{cfg.label}</span>
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{alert.message}</div>
                {alert.date && (
                  <div style={{ color: '#475569', fontSize: '0.75rem', marginTop: 4 }}>
                    {new Date(alert.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button onClick={() => handleExtend(alert.outletId, alert.outletName)}
                  style={{ padding: '8px 14px', background: '#6366f120', border: '1px solid #6366f140', borderRadius: 8, color: '#818cf8', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                  + Extend
                </button>
                <Link to="/superadmin/restaurants"
                  style={{ padding: '8px 14px', background: 'transparent', border: '1px solid #334155', borderRadius: 8, color: '#94a3b8', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center' }}>
                  Manage →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
