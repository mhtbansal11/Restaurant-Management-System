import { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Navbar, Button, Badge, Dropdown, Modal, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
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

  const isEdgeToEdgePage = location.pathname === '/pos' || 
                           location.pathname === '/kds' || 
                           location.pathname === '/seating-editor';

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

  return (
    <div className="layout-bs">
      {!isEdgeToEdgePage && (
      <Navbar bg="white" expand={false} className="mobile-header-bs d-lg-none border-bottom shadow-sm py-2 px-3 sticky-top">
        <Button 
          variant="link" 
          onClick={toggleMobileSidebar}
          className="p-0 border-0 text-dark fs-3 me-3"
        >
          ☰
        </Button>
        <Navbar.Brand className="fw-bold text-primary mb-0">
          {user?.restaurantName || 'ATC Restaurant'}
        </Navbar.Brand>
        <div className="ms-auto d-flex align-items-center gap-2">
          <Dropdown align="end" autoClose="outside">
            <Dropdown.Toggle variant="link" className="nav-icon-box position-relative p-0 text-dark border rounded no-caret">
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
            <Dropdown.Toggle variant="link" className="p-0 border-0 no-caret">
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
                <div className="mt-2">
                  <span className="profile-role-badge">{formatRole(user?.role)}</span>
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

      <div className="layout-container-bs">
        <Sidebar 
          isOpen={isMobileSidebarOpen} 
          toggleSidebar={toggleMobileSidebar} 
          isCollapsed={isCollapsed}
          toggleCollapse={toggleCollapse}
        />
        
        <div className={`main-wrapper-bs ${isCollapsed ? 'collapsed' : ''}`}>
          <Button
            variant="light"
            className="sidebar-toggle-btn position-absolute border border-primary bg-white rounded-circle p-1 shadow-sm"
            onClick={toggleCollapse}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            style={{
              top: '20px',
              left: isCollapsed ? '80px' : '280px',
              zIndex: 1100,
              transform: 'translateX(-50%)',
              transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {isCollapsed ? '➡️' : '⬅️'}
          </Button>
          {!isEdgeToEdgePage && (
            <Navbar bg="white" className="border-bottom shadow-sm px-4 py-2 sticky-top d-none d-lg-flex justify-content-between">
              <Navbar.Brand className="fw-bold text-primary mb-0">
                {/* {user?.restaurantName || 'ATC Restaurant'} */}
              </Navbar.Brand>
              <div className="d-flex align-items-center gap-3">
                <Dropdown align="end" autoClose="outside">
                  <Dropdown.Toggle variant="link" className="nav-icon-box position-relative p-0 text-dark border rounded no-caret">
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
                            key={notification._id}
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
                  <Dropdown.Toggle variant="link" className="p-0 border-0 no-caret">
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
                      <div className="mt-2">
                        <span className="profile-role-badge">{formatRole(user?.role)}</span>
                      </div>
                    </div>
                    <div className="p-2 d-flex flex-column gap-1">
                      <Dropdown.Item as={Link} to="/staff-profile" className="rounded py-2 d-flex align-items-center gap-2">
                        <span>👤</span> Profile
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
          <main className={`main-content-bs${isEdgeToEdgePage ? ' main-content--edge-bs' : ''}`}>
            {children}
          </main>
        </div>
      </div>
      <Modal show={showLogoutConfirm} onHide={() => setShowLogoutConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to log out?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLogoutConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleLogoutConfirm}>
            Logout
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Layout;

