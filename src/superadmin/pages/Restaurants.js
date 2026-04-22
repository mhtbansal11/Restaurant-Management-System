import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useSuperAdmin } from '../SuperAdminContext';

const statusColors = {
  active:    { bg: '#10b98120', text: '#10b981', border: '#10b98140' },
  trial:     { bg: '#6366f120', text: '#818cf8', border: '#6366f140' },
  suspended: { bg: '#ef444420', text: '#f87171', border: '#ef444440' },
  expired:   { bg: '#f59e0b20', text: '#fbbf24', border: '#f59e0b40' },
};

const paymentColors = { paid: '#10b981', pending: '#f59e0b', overdue: '#ef4444' };

function StatusBadge({ status }) {
  const c = statusColors[status] || statusColors.trial;
  return (
    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, background: c.bg, color: c.text, border: `1px solid ${c.border}`, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
      {status}
    </span>
  );
}

function EditModal({ outlet, onClose, onSave }) {
  const [form, setForm] = useState({
    subscriptionEndDate: outlet.subscriptionEndDate ? new Date(outlet.subscriptionEndDate).toISOString().slice(0, 10) : '',
    planAmount: outlet.planAmount || 5000,
    paymentStatus: outlet.paymentStatus || 'pending',
    subscriptionStatus: outlet.subscriptionStatus || 'trial',
    notes: outlet.notes || '',
  });

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400, padding: 16 }}>
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: 24, width: '100%', maxWidth: 480, color: '#f8fafc', maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: '1.1rem' }}>Edit Subscription — {outlet.name}</h3>

        {[
          { label: 'Subscription End Date', key: 'subscriptionEndDate', type: 'date' },
          { label: 'Plan Amount (₹)', key: 'planAmount', type: 'number' },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>{f.label}</label>
            <input
              type={f.type}
              value={form[f.key]}
              onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f8fafc', boxSizing: 'border-box' }}
            />
          </div>
        ))}

        {[
          { label: 'Payment Status', key: 'paymentStatus', options: ['paid', 'pending', 'overdue'] },
          { label: 'Subscription Status', key: 'subscriptionStatus', options: ['trial', 'active', 'suspended', 'expired'] },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>{f.label}</label>
            <select
              value={form[f.key]}
              onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f8fafc', boxSizing: 'border-box' }}
            >
              {f.options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        ))}

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>Notes</label>
          <textarea
            rows={3}
            value={form.notes}
            onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
            style={{ width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f8fafc', resize: 'vertical', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', background: 'none', border: '1px solid #334155', borderRadius: 8, color: '#94a3b8', cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => onSave(form)} style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#6366f1,#a855f7)', border: 'none', borderRadius: 8, color: 'white', fontWeight: 600, cursor: 'pointer' }}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

function RestaurantCard({ r, onEdit, onToggle }) {
  const daysLeft = r.daysLeft;
  const daysColor = daysLeft <= 3 ? '#ef4444' : daysLeft <= 7 ? '#f59e0b' : '#10b981';
  const isSuspended = r.subscriptionStatus === 'suspended';

  return (
    <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 16, marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.95rem', marginBottom: 2 }}>{r.name}</div>
          <div style={{ color: '#64748b', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.address}</div>
        </div>
        <StatusBadge status={r.subscriptionStatus} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', marginBottom: 12, fontSize: '0.8rem' }}>
        <div>
          <div style={{ color: '#475569', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600, marginBottom: 2 }}>Owner</div>
          <div style={{ color: '#cbd5e1' }}>{r.ownerName || '—'}</div>
        </div>
        <div>
          <div style={{ color: '#475569', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600, marginBottom: 2 }}>Phone</div>
          <div style={{ color: '#cbd5e1' }}>{r.phone || '—'}</div>
        </div>
        <div>
          <div style={{ color: '#475569', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600, marginBottom: 2 }}>Payment</div>
          <span style={{ color: paymentColors[r.paymentStatus], fontWeight: 600, textTransform: 'capitalize' }}>
            {r.paymentStatus === 'paid' ? '✓ ' : r.paymentStatus === 'overdue' ? '⚠ ' : '⏳ '}
            {r.paymentStatus}
          </span>
        </div>
        <div>
          <div style={{ color: '#475569', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600, marginBottom: 2 }}>Days Left</div>
          <span style={{ color: daysColor, fontWeight: 700 }}>{daysLeft > 0 ? `${daysLeft}d` : `${Math.abs(daysLeft)}d ago`}</span>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <div style={{ color: '#475569', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600, marginBottom: 2 }}>Expires</div>
          <div style={{ color: '#94a3b8' }}>
            {r.subscriptionEndDate ? new Date(r.subscriptionEndDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => onEdit(r)}
          style={{ flex: 1, padding: '8px 12px', background: '#6366f120', border: '1px solid #6366f140', borderRadius: 8, color: '#818cf8', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}
        >
          Edit
        </button>
        <button
          onClick={() => onToggle(r._id, r.name, r.subscriptionStatus)}
          style={{ flex: 1, padding: '8px 12px', background: isSuspended ? '#10b98120' : '#ef444420', border: `1px solid ${isSuspended ? '#10b98140' : '#ef444440'}`, borderRadius: 8, color: isSuspended ? '#10b981' : '#f87171', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}
        >
          {isSuspended ? 'Enable' : 'Suspend'}
        </button>
      </div>
    </div>
  );
}

export default function SARestaurants() {
  const { api } = useSuperAdmin();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [editing, setEditing] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const load = () => {
    setLoading(true);
    api.get('/restaurants')
      .then(r => setRestaurants(r.data))
      .catch(err => toast.error(err.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleToggle = async (id, name, currentStatus) => {
    try {
      await api.put(`/restaurants/${id}/toggle`);
      toast.success(`${name} ${currentStatus === 'suspended' ? 'enabled' : 'suspended'}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating status');
    }
  };

  const handleSave = async (form) => {
    try {
      await api.put(`/restaurants/${editing._id}/subscription`, form);
      toast.success('Subscription updated');
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving changes');
    }
  };

  const filtered = restaurants.filter(r => {
    const matchSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.ownerName || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.phone || '').includes(search);
    const matchFilter = filter === 'all' || r.subscriptionStatus === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div style={{ padding: isMobile ? 16 : 32 }}>
      {editing && <EditModal outlet={editing} onClose={() => setEditing(null)} onSave={handleSave} />}

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: isMobile ? '1.3rem' : '1.6rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>Restaurants</h1>
        <p style={{ color: '#64748b', marginTop: 6, fontSize: '0.875rem' }}>{restaurants.length} total restaurants</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          placeholder="Search by name, owner, phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: '1 1 200px', minWidth: 0, padding: '10px 14px', background: '#1e293b', border: '1px solid #334155', borderRadius: 10, color: '#f8fafc', fontSize: '0.875rem', outline: 'none' }}
        />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['all', 'active', 'trial', 'suspended', 'expired'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${filter === s ? '#6366f1' : '#334155'}`, background: filter === s ? '#6366f120' : 'transparent', color: filter === s ? '#818cf8' : '#94a3b8', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, textTransform: 'capitalize', whiteSpace: 'nowrap' }}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ color: '#64748b', padding: 20 }}>Loading...</div>
      ) : isMobile ? (
        // Mobile: card list
        <div>
          {filtered.map(r => (
            <RestaurantCard key={r._id} r={r} onEdit={setEditing} onToggle={handleToggle} />
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: '#475569' }}>No restaurants found</div>
          )}
        </div>
      ) : (
        // Desktop: table
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 14, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead>
              <tr style={{ background: '#0f172a' }}>
                {['Restaurant', 'Owner / Phone', 'Status', 'Payment', 'Expires', 'Days Left', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#475569', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #334155', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => {
                const daysLeft = r.daysLeft;
                const daysColor = daysLeft <= 3 ? '#ef4444' : daysLeft <= 7 ? '#f59e0b' : '#10b981';
                const isSuspended = r.subscriptionStatus === 'suspended';
                return (
                  <tr key={r._id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #1e293b' : 'none' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.9rem' }}>{r.name}</div>
                      <div style={{ color: '#475569', fontSize: '0.75rem' }}>{(r.address || '').slice(0, 30)}{r.address?.length > 30 ? '...' : ''}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>{r.ownerName || '—'}</div>
                      <div style={{ color: '#475569', fontSize: '0.75rem' }}>{r.phone}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}><StatusBadge status={r.subscriptionStatus} /></td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ color: paymentColors[r.paymentStatus], fontWeight: 600, fontSize: '0.8rem', textTransform: 'capitalize' }}>
                        {r.paymentStatus === 'paid' ? '✓ ' : r.paymentStatus === 'overdue' ? '⚠ ' : '⏳ '}
                        {r.paymentStatus}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                      {r.subscriptionEndDate ? new Date(r.subscriptionEndDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: daysColor }}>{daysLeft > 0 ? `${daysLeft}d` : `${Math.abs(daysLeft)}d ago`}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => setEditing(r)}
                          style={{ padding: '6px 12px', background: '#6366f120', border: '1px solid #6366f140', borderRadius: 6, color: '#818cf8', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggle(r._id, r.name, r.subscriptionStatus)}
                          style={{ padding: '6px 12px', background: isSuspended ? '#10b98120' : '#ef444420', border: `1px solid ${isSuspended ? '#10b98140' : '#ef444440'}`, borderRadius: 6, color: isSuspended ? '#10b981' : '#f87171', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap' }}
                        >
                          {isSuspended ? 'Enable' : 'Suspend'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#475569' }}>No restaurants found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
