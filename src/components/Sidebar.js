import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ROLES } from '../constants/roles';
import BrandLogo from './BrandLogo';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar, isCollapsed, toggleCollapse }) => {
  const location = useLocation();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [hoveredLink, setHoveredLink] = useState(null);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊', roles: ROLES.ALL },
    { path: '/pos', label: 'POS', icon: '🛒', roles: ROLES.POS },

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

  const showHoverLabel = (event, label) => {
    if (!isCollapsed) return;

    const rect = event.currentTarget.getBoundingClientRect();
    setHoveredLink({
      label,
      top: rect.top + rect.height / 2,
      left: rect.right + 12
    });
  };

  const hideHoverLabel = () => {
    setHoveredLink(null);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="sidebar-overlay-bs d-lg-none" 
          onClick={toggleSidebar}
        />
      )}

      <aside className={`sidebar-premium ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header-premium p-4">
          <div className="sidebar-brand-premium d-flex gap-3 align-items-center">
            <div className="brand-icon-premium" style={{ padding: 0, background: 'transparent' }}>
              <BrandLogo theme={theme || 'dark'} size={36} />
            </div>
            {!isCollapsed && (
              <div className="brand-text-container">
                <h2 className="brand-name-premium h5 fw-bold text-gradient mb-0 text-truncate">
                  {user?.restaurantName || 'ATC Restaurant'}
                </h2>
                <div className="brand-role-premium extra-small text-uppercase opacity-75">
                  {user?.role?.replace('_', ' ')}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="sidebar-nav-premium px-3 custom-scrollbar">
          {filteredLinks.map(link => (
            <Nav.Link 
              key={link.path} 
              as={Link} 
              to={link.path} 
              className={`sidebar-link-premium d-flex align-items-center rounded-lg mb-2 p-2 ${isActive(link.path) ? 'active' : ''}`}
              onClick={() => isOpen && toggleSidebar()}
              onMouseEnter={(event) => showHoverLabel(event, link.label)}
              onMouseLeave={hideHoverLabel}
              onFocus={(event) => showHoverLabel(event, link.label)}
              onBlur={hideHoverLabel}
              title={isCollapsed ? link.label : ''}
            >
              <span className={`link-icon-premium fs-5 ${isCollapsed ? '' : 'me-3'}`}>{link.icon}</span>
              {!isCollapsed && <span className="link-label-premium fw-semibold">{link.label}</span>}
              {isActive(link.path) && !isCollapsed && <div className="active-indicator-premium ms-auto"></div>}
            </Nav.Link>
          ))}
        </div>


      </aside>
      {isCollapsed && hoveredLink && (
        <div
          className="sidebar-hover-tooltip"
          style={{
            top: `${hoveredLink.top}px`,
            left: `${hoveredLink.left}px`
          }}
        >
          {hoveredLink.label}
        </div>
      )}
    </>
  );
};

export default Sidebar;
