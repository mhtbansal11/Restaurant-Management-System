import { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Navbar, Button, Badge, Dropdown, Modal, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import useExpenseNotifications from '../hooks/useExpenseNotifications';
import { useNotifications } from '../context/NotificationContext';
import Sidebar from './Sidebar';
import './Layout.css';

const Layout = ({ children }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { notifications: expenseNotifications, dismissNotification } = useExpenseNotifications();
  const { notifications: aadharNotifications, unreadCount, markAsRead } = useNotifications();

  const toggleMobileSidebar = () => setIsMobileSidebarOpen(!isMobileSidebarOpen);
  
  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', newState);
  };

  const isEdgeToEdgePage = [ '/seating-editor'].includes(location.pathname);
  const isFlushContentPage = ['/pos'].includes(location.pathname);

  // Combine both expense and Aadhar notifications
  const allNotifications = [
    ...expenseNotifications.map(notif => ({ ...notif, source: 'expense' })),
    ...aadharNotifications.map(notif => ({ ...notif, source: 'aadhar' }))
  ];

  const orderedNotifications = allNotifications.sort((a, b) => {
    // Sort by creation date (newest first)
    return new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp);
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getReminderVariant = (type) => {
    return type === 'overdue' ? 'danger' : 'warning';
  };

  const formatRole = (role) => {
    if (!role) return '';
    return role.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const path = location.pathname;
    const navLinks = [
      { path: '/', label: 'Overview Dashboard' },
      { path: '/pos', label: 'Point of Sale' },
      { path: '/orders', label: 'Order Management' },
      { path: '/seating', label: 'Floor Plan' },
      { path: '/kds', label: 'Kitchen Management' },
      { path: '/menu', label: 'Menu Catalog' },
      { path: '/inventory', label: 'Inventory Control' },
      { path: '/payments', label: 'Financial Tracking' },
      { path: '/customers', label: 'Guest Registry' },
      { path: '/expenses', label: 'Expense Ledger' },
      { path: '/profit-loss', label: 'Performance Analytics' },
      { path: '/forecasting', label: 'Demand Forecasting' },
      { path: '/staff', label: 'Staff Directory' },
      { path: '/seating-editor', label: 'Layout Designer' },
      { path: '/settings', label: 'Global Settings' },
    ];
    
    const link = navLinks.find(l => l.path === path);
    if (link) return link.label;
    
    // Fallback for subpaths or IDs
    if (path.includes('/pos')) return 'POS Station';
    if (path.includes('/orders/')) return 'Order Details';
    
    return 'Masala Matrix';
  };

  return (
    <div className="layout-premium">
      {!isEdgeToEdgePage && (
      <Navbar expand={false} className="mobile-header-bs d-lg-none border-bottom shadow-sm py-2 px-3 sticky-top bg-primary">
        <Button 
          variant="link" 
          onClick={toggleMobileSidebar}
          className="p-0 border-0 text-primary fs-3 me-3"
        >
          ☰
        </Button>
        <Navbar.Brand className="fw-bold text-primary mb-0">
          {user?.restaurantName || 'ATC Restaurant'}
        </Navbar.Brand>
        <div className="ms-auto d-flex align-items-center gap-2">
          <Dropdown align="end" autoClose="outside">
            <Dropdown.Toggle variant="link" className="nav-icon-box position-relative p-0 text-primary border rounded no-caret bg-tertiary">
              <span className="fs-5 d-flex align-items-center justify-content-center w-100 h-100">🔔</span>
              {(expenseNotifications.length + unreadCount) > 0 && (
                <span className="notification-dot"></span>
              )}
            </Dropdown.Toggle>
            <Dropdown.Menu className="notification-dropdown-menu p-3 shadow-sm border-0 mt-2">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="fw-bold h6 mb-0">Notifications</div>
                {(expenseNotifications.length + unreadCount) > 0 && (
                  <Badge bg="danger" pill className="small">
                    {expenseNotifications.length + unreadCount} New
                  </Badge>
                )}
              </div>
              {orderedNotifications.length === 0 ? (
                <div className="text-muted text-center py-4">
                  <div className="fs-2 mb-2">📭</div>
                  <div>No notifications right now</div>
                </div>
              ) : (
                <div className="notification-list">
                  {orderedNotifications.map((notification) => (
                    <Alert
                      key={notification._id || notification.id}
                      variant={notification.source === 'aadhar' ? 
                        (notification.type === 'success' ? 'success' : 'danger') : 
                        getReminderVariant(notification.type)}
                      dismissible={notification.source === 'expense'}
                      onClose={() => {
                        if (notification.source === 'expense') {
                          dismissNotification(notification);
                        } else if (notification.source === 'aadhar' && !notification.read) {
                          markAsRead(notification._id);
                        }
                      }}
                      className="notification-item border-0 shadow-sm mb-2"
                    >
                      <div className="fw-bold small">{notification.title}</div>
                      <div className="small text-muted mb-1">
                        {notification.message || notification.description}
                      </div>
                      {notification.source === 'expense' && (
                        <div className="small fw-semibold">
                          {formatCurrency(notification.amount)} • Due {formatDate(notification.dueDate)}
                        </div>
                      )}
                      {notification.source === 'aadhar' && notification.createdAt && (
                        <div className="small text-muted">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </div>
                      )}
                    </Alert>
                  ))}
                </div>
              )}
            </Dropdown.Menu>
          </Dropdown>
          <Dropdown align="end">
            <Dropdown.Toggle variant="link" className="nav-action-btn no-caret">
              <div className="nav-avatar-circle shadow-sm">
                {user?.name?.charAt(0) || 'U'}
              </div>
            </Dropdown.Toggle>
            <Dropdown.Menu className="profile-dropdown-menu p-0 shadow-sm border-0 mt-2 overflow-hidden">
              <div className="p-4 text-center bg-tertiary border-bottom">
                <div className="profile-avatar-large mx-auto mb-2 shadow-sm" style={{ backgroundColor: 'var(--accent-color)' }}>
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="fw-bold h6 mb-0 text-primary">{user?.name || 'User'}</div>
                <div className="text-muted small">{user?.restaurantName || 'ATC Restaurant'}</div>
                <div className="mt-2">
                  <span className="profile-role-badge" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--accent-color)' }}>{formatRole(user?.role)}</span>
                </div>
              </div>
              <div className="p-2 d-flex flex-column gap-1">
                <Dropdown.Item as={Link} to="/staff-profile" className="rounded py-2 d-flex align-items-center gap-2">
                  <span>👤</span>My Profile
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setShowLogoutConfirm(true)} className="rounded py-2 text-danger d-flex align-items-center gap-2">
                  <span>⏻</span> Logout
                </Dropdown.Item>
              </div>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </Navbar>
      )}

      <div className="layout-container-premium">
        <Sidebar 
          isOpen={isMobileSidebarOpen} 
          toggleSidebar={toggleMobileSidebar} 
          isCollapsed={isCollapsed}
          toggleCollapse={toggleCollapse}
        />

        <Button
          variant="light"
          className="sidebar-toggle-btn"
          onClick={toggleCollapse}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          style={{
            left: isCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)'
          }}
        >
          {isCollapsed ? '➡️' : '⬅️'}
        </Button>
        
        <div className={`main-wrapper-premium ${isCollapsed ? 'collapsed' : ''}`}>
            <Navbar className="glass-navbar px-4 py-2 sticky-top d-none d-lg-flex justify-content-between">
              <Navbar.Brand className="fw-bold text-gradient mb-0 d-flex align-items-center gap-2">
                {getPageTitle()}
              </Navbar.Brand>
              <div className="d-flex align-items-center gap-3">
                <Button 
                  variant="link" 
                  onClick={toggleTheme}
                  className="nav-action-btn"
                  title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                  {theme === 'light' ? '🌙' : '☀️'}
                </Button>
                
                <Dropdown align="end" autoClose="outside">
                  <Dropdown.Toggle variant="link" className="nav-action-btn no-caret position-relative">
                    <span className="fs-5 d-flex align-items-center justify-content-center w-100 h-100">🔔</span>
                    {(expenseNotifications.length + unreadCount) > 0 && (
                      <span className="notification-dot"></span>
                    )}
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="notification-dropdown-menu p-3 shadow-sm border-0 mt-2">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="fw-bold h6 mb-0">Notifications</div>
                      {(expenseNotifications.length + unreadCount) > 0 && (
                        <Badge bg="danger" pill className="small">
                          {expenseNotifications.length + unreadCount} New
                        </Badge>
                      )}
                    </div>
                    {orderedNotifications.length === 0 ? (
                      <div className="text-muted text-center py-4">
                        <div className="fs-2 mb-2">📭</div>
                        <div>No reminders right now</div>
                      </div>
                    ) : (
                      <div className="notification-list">
                        {orderedNotifications.map((notification) => (
                          <Alert
                            key={notification._id || notification.id}
                            variant={notification.source === 'aadhar' ? 
                              (notification.type === 'success' ? 'success' : 'danger') : 
                              getReminderVariant(notification.type)}
                            dismissible={notification.source === 'expense'}
                            onClose={() => {
                              if (notification.source === 'expense') {
                                dismissNotification(notification);
                              } else if (notification.source === 'aadhar' && !notification.read) {
                                markAsRead(notification._id);
                              }
                            }}
                            className="notification-item border-0 shadow-sm mb-2"
                          >
                            <div className="fw-bold small">{notification.title}</div>
                            <div className="small text-muted mb-1">
                              {notification.message || notification.description}
                            </div>
                            {notification.source === 'expense' && (
                              <div className="small fw-semibold">
                                {formatCurrency(notification.amount)} • Due {formatDate(notification.dueDate)}
                              </div>
                            )}
                            {notification.source === 'aadhar' && notification.createdAt && (
                              <div className="small text-muted">
                                {new Date(notification.createdAt).toLocaleDateString()}
                              </div>
                            )}
                          </Alert>
                        ))}
                      </div>
                    )}
                  </Dropdown.Menu>
                </Dropdown>

                <Dropdown align="end">
                  <Dropdown.Toggle variant="link" className="nav-action-btn no-caret border-0 shadow-none">
                    <div className="nav-avatar-circle shadow-sm">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="profile-dropdown-menu p-0 shadow-sm border-0 mt-2 overflow-hidden">
                    <div className="p-4 text-center bg-light border-bottom">
                      <div className="profile-avatar-large mx-auto mb-2 shadow-sm">
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                      <div className="fw-bold h6 mb-0">{user?.name || 'User'}</div>
                      <div className="text-muted small">{user?.restaurantName || 'ATC Restaurant'}</div>
                      <div className="mt-2 text-center d-flex justify-content-center">
                        <span className="profile-role-badge">{formatRole(user?.role)}</span>
                      </div>
                    </div>
                    <div className="p-2 d-flex flex-column gap-1">
                      <Dropdown.Item as={Link} to="/staff-profile" className="rounded-3 py-2 d-flex align-items-center gap-2">
                        <span>👤</span> My Profile
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => setShowLogoutConfirm(true)} className="rounded-3 py-2 text-danger d-flex align-items-center gap-2">
                        <span>⏻</span> Logout
                      </Dropdown.Item>
                    </div>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </Navbar>
          <main className={`main-content-premium${isEdgeToEdgePage ? ' main-content--edge-premium' : ''}${isFlushContentPage ? ' main-content--flush-premium' : ''}`}>
            {children}
          </main>
        </div>
      </div>
      <Modal 
        show={showLogoutConfirm} 
        onHide={() => setShowLogoutConfirm(false)}
        centered
        className="logout-modal-bs"
        contentClassName="border-0 shadow-lg bg-primary text-primary"
      >
        <Modal.Body className="p-4 text-center">
          <div className="fs-1 mb-3 text-danger">⚠️</div>
          <h4 className="fw-bold mb-2 text-primary">Confirm Logout</h4>
          <p className="text-muted mb-4">Are you sure you want to log out of your account?</p>
          <div className="d-flex gap-2 justify-content-center">
            <Button 
              variant="light" 
              onClick={() => setShowLogoutConfirm(false)}
              className="px-4 py-2 bg-tertiary text-primary border-0"
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleLogoutConfirm}
              className="px-4 py-2"
            >
              Logout
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Layout;

