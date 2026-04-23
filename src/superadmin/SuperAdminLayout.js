import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSuperAdmin } from './SuperAdminContext';

const navItems = [
  { path: '/superadmin/dashboard', icon: '📊', label: 'Dashboard' },
  { path: '/superadmin/restaurants', icon: '🍽️', label: 'Restaurants' },
  { path: '/superadmin/notifications', icon: '🔔', label: 'Alerts' },
];

const SIDEBAR_FULL = 240;
const SIDEBAR_COLLAPSED = 72;
const MOBILE_BREAK = 768;

export default function SuperAdminLayout({ children }) {
  const { admin, logout } = useSuperAdmin();
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAK);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAK;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(prev => prev ? false : prev);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Close drawer on route change (mobile)
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/superadmin/login');
  };

  const sidebarW = isMobile ? SIDEBAR_FULL : (collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_FULL);
  const showLabels = isMobile || !collapsed;

  const sidebarStyle = isMobile
    ? {
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 300,
        width: SIDEBAR_FULL,
        transform: mobileOpen ? 'translateX(0)' : `translateX(-${SIDEBAR_FULL}px)`,
        transition: 'transform 0.25s',
        background: '#1e293b', borderRight: '1px solid #334155',
        display: 'flex', flexDirection: 'column',
      }
    : {
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
        width: sidebarW,
        transition: 'width 0.25s',
        background: '#1e293b', borderRight: '1px solid #334155',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
      };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f172a', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 299 }}
        />
      )}

      {/* Sidebar */}
      <aside style={sidebarStyle}>
        {/* Brand */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, backgroundImage: "url('/assets/brand/masala-matrix-logo-white-elements.png')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', fontSize: 0, flexShrink: 0 }}></div>
          {showLabels && (
            <div>
              <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: '0.9rem', lineHeight: 1.2 }}>Masala Matrix</div>
              <div style={{ color: '#6366f1', fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Super Admin</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 8px', overflowY: 'auto' }}>
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', borderRadius: 10, marginBottom: 4,
                  textDecoration: 'none',
                  background: active ? 'linear-gradient(135deg,#6366f120,#a855f718)' : 'transparent',
                  border: active ? '1px solid #6366f133' : '1px solid transparent',
                  color: active ? '#818cf8' : '#94a3b8',
                  fontWeight: active ? 600 : 400,
                  fontSize: '0.875rem',
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                {showLabels && item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid #334155' }}>
          {!isMobile && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, width: '100%', background: 'none', border: '1px solid transparent', color: '#64748b', cursor: 'pointer', fontSize: '0.875rem', marginBottom: 4 }}
            >
              <span style={{ fontSize: 18 }}>{collapsed ? '→' : '←'}</span>
              {!collapsed && 'Collapse'}
            </button>
          )}
          {showLabels && (
            <div style={{ padding: '10px 12px', marginBottom: 4 }}>
              <div style={{ color: '#f8fafc', fontSize: '0.8rem', fontWeight: 600 }}>{admin?.name || 'Super Admin'}</div>
              <div style={{ color: '#475569', fontSize: '0.72rem' }}>{admin?.email}</div>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, width: '100%', background: 'none', border: '1px solid #ef444420', color: '#f87171', cursor: 'pointer', fontSize: '0.875rem' }}
          >
            <span style={{ fontSize: 18 }}>⏻</span>
            {showLabels && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{
        marginLeft: isMobile ? 0 : sidebarW,
        paddingTop: isMobile ? 57 : 0,
        flex: 1,
        minHeight: '100vh',
        background: '#0f172a',
        transition: 'margin-left 0.25s',
        color: '#f8fafc',
        minWidth: 0,
      }}>
        {/* Mobile top bar */}
        {isMobile && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, background: '#1e293b', borderBottom: '1px solid #334155', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setMobileOpen(true)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 22, padding: 4, lineHeight: 1 }}
            >
              ☰
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, backgroundImage: "url('/assets/brand/masala-matrix-logo-white-elements.png')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', boxShadow: '0 0 16px rgba(168,85,247,0.16)', fontSize: 0 }}>🛡️</div>
              <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.9rem' }}>Super Admin</span>
            </div>
          </div>
        )}

        {children}
      </main>
    </div>
  );
}
