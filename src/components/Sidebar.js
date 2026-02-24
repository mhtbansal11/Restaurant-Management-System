import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Nav, Button, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants/roles';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar, isCollapsed, toggleCollapse }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Dashboard', icon: '📊', roles: ROLES.ALL },
    { path: '/pos', label: 'POS', icon: '🛒', roles: ROLES.POS },
    { path: '/cart-billing', label: 'Cart & Billing', icon: '💰', roles: ROLES.POS },
    { path: '/orders', label: 'Orders', icon: '📋', roles: ROLES.ALL },
    { path: '/seating', label: 'Floor Plan', icon: '🪑', roles: ROLES.FRONT_DESK },
    { path: '/kds', label: 'Kitchen (KDS)', icon: '🍳', roles: ROLES.KITCHEN },
    { path: '/menu', label: 'Menu', icon: '📖', roles: ROLES.ALL },
    { path: '/inventory', label: 'Inventory', icon: '📦', roles: ROLES.KITCHEN },
    { path: '/payments', label: 'Payment Tracking', icon: '💳', roles: ROLES.FINANCE },
    { path: '/customers', label: 'Customers', icon: '👥', roles: ROLES.ALL },
    { path: '/expenses', label: 'Expenses', icon: '💸', roles: ROLES.MANAGEMENT },
    { path: '/profit-loss', label: 'Profit & Loss', icon: '💰', roles: ROLES.MANAGEMENT },
    { path: '/forecasting', label: 'Forecasting', icon: '🔮', roles: ROLES.MANAGEMENT },
    { path: '/staff', label: 'Staff Management', icon: '👥', roles: ROLES.MANAGEMENT },
    { path: '/seating-editor', label: 'Design Layout', icon: '📐', roles: ROLES.MANAGEMENT },
    { path: '/settings', label: 'Settings', icon: '⚙️', roles: ROLES.MANAGEMENT },
  ];

  const filteredLinks = navLinks.filter(link => 
    !link.roles || link.roles.includes(user?.role)
  );

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="sidebar-overlay-bs d-lg-none" 
          onClick={toggleSidebar}
        />
      )}

      <aside className={`sidebar-bs ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''} shadow-sm border-end`}>
        <div className="sidebar-header-bs p-4 border-bottom d-flex align-items-center justify-content-between">
          <div className="sidebar-brand-bs d-flex gap-2 align-items-center justify-content-start collapsed-hidden">
            <div>
              <h2 className="h4 fw-bold text-primary mb-0 text-truncate" style={{ maxWidth: '180px' }}>
                {user?.restaurantName || 'ATC Restaurant'}
              </h2>
              <Badge bg="light" text="dark" className="mt-1 border text-uppercase small px-2 py-1">
                {user?.role?.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          <div className="w-100 text-center collapsed-visible d-none">
            <span className="fw-bold text-primary h5 mb-0">ATC</span>
          </div>
        </div>

        <div className="sidebar-nav-bs flex-column px-3 mt-2">
          {filteredLinks.map(link => (
            <Nav.Link 
              key={link.path} 
              as={Link} 
              to={link.path} 
              className={`sidebar-link-bs d-flex align-items-center rounded-3 mb-1 p-2 ${isActive(link.path) ? 'active' : ''} ${isCollapsed ? 'justify-content-center' : ''}`}
              onClick={() => isOpen && toggleSidebar()}
              title={isCollapsed ? link.label : ''}
            >
              <span className={`sidebar-icon-bs fs-5 ${isCollapsed ? 'me-0' : 'me-3'}`}>{link.icon}</span>
              <span className="sidebar-label-bs fw-medium collapsed-hidden">{link.label}</span>
            </Nav.Link>
          ))}
        </div>

        <div className="sidebar-footer-bs mt-auto p-4 border-top">
          <div className="collapsed-hidden">
            <div className="sidebar-user-bs d-flex align-items-center mb-3">
              <div className="user-avatar-bs bg-primary text-white rounded-circle me-3 d-flex align-items-center justify-content-center fw-bold" style={{ width: '40px', height: '40px', minWidth: '40px' }}>
                {user?.name?.charAt(0)}
              </div>
              <div className="sidebar-user-info-bs overflow-hidden">
                <div className="sidebar-user-name-bs fw-bold text-truncate">{user?.name}</div>
                <div className="sidebar-user-email-bs small text-muted text-truncate">{user?.email}</div>
              </div>
            </div>
            <Button 
              variant="outline-danger" 
              onClick={logout} 
              className="w-100 d-flex align-items-center justify-content-center gap-2 border-0 bg-light-danger"
            >
              <span>⏻</span> Logout
            </Button>
          </div>
          
          <div className="d-flex flex-column align-items-center gap-3 collapsed-visible d-none">
            <div className="user-avatar-bs bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '40px', height: '40px' }} title={user?.name}>
              {user?.name?.charAt(0)}
            </div>
            <Button 
              variant="outline-danger" 
              onClick={logout} 
              className="w-100 d-flex align-items-center justify-content-center border-0 bg-light-danger p-2"
              title="Logout"
            >
              <span>⏻</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
