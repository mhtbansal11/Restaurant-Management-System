import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import { Container, Row, Col, Card, Button, Form, Modal, Badge, Spinner, Alert, InputGroup } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import './Staff.css';

const Staff = () => {
  const { user } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'cashier'
  });
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('All');

  const roles = [
    { value: 'owner', label: 'Owner', icon: '👑' },
    { value: 'manager', label: 'Manager', icon: '💼' },
    { value: 'cashier', label: 'Cashier', icon: '💰' },
    { value: 'receptionist', label: 'Receptionist', icon: '📞' },
    { value: 'kitchen_staff', label: 'Kitchen Staff', icon: '🍳' },
    { value: 'waiter', label: 'Waiter', icon: '🍽️' }
  ];

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.API_URL}/users`);
      setStaff(response.data);
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${config.API_URL}/users/${editingId}`, formData);
      } else {
        await axios.post(`${config.API_URL}/users`, formData);
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({ name: '', email: '', password: '', role: 'cashier' });
      toast.success(`Staff member ${editingId ? 'updated' : 'added'} successfully`);
      fetchStaff();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (member) => {
    setEditingId(member._id);
    setFormData({
      name: member.name,
      email: member.email,
      password: '',
      role: member.role
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setStaffToDelete(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${config.API_URL}/users/${staffToDelete}`);
      toast.success('Staff member deleted');
      fetchStaff();
    } catch (error) {
      toast.error('Delete failed');
    } finally {
      setShowConfirmModal(false);
      setStaffToDelete(null);
    }
  };

  const handleToggleLogin = async (userId, loginAuthorized) => {
    try {
      await axios.patch(`${config.API_URL}/users/${userId}/login-auth`, {
        loginAuthorized
      });
      toast.success(`Login ${loginAuthorized ? 'allowed' : 'blocked'} successfully`);
      fetchStaff();
    } catch (error) {
      toast.error('Failed to update login authorization');
    }
  };

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'All' || member.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (loading && staff.length === 0) return (
    <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Spinner animation="grow" variant="primary" className="mb-3" />
      <p className="text-muted fw-bold">Synchronizing team profile...</p>
    </div>
  );

  return (
    <div className="staff-page-premium">
      {/* Header Section */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3 glass-navbar p-3 shadow-sm">
        <div>
          <h1 className="h4 mb-0 fw-bold text-gradient">Staff Directory</h1>
          <p className="text-muted small mb-0">Manage roles and security for your restaurant team</p>
        </div>
        <div className="d-flex gap-2 flex-wrap align-items-center">
          <div className="search-box-premium">
            <Form.Control
              placeholder="Search team members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-pill px-4 border-0 bg-glass-inner"
            />
          </div>
          
          {['superadmin', 'owner', 'manager'].includes(user?.role) && (
            <Button 
              variant="primary" 
              onClick={() => {
                setEditingId(null);
                setFormData({ name: '', email: '', password: '', role: 'cashier' });
                setShowModal(true);
              }}
              className="rounded-pill px-4 shadow-premium fw-bold btn-premium"
            >
              + Add Member
            </Button>
          )}
        </div>
      </div>

      <Card className="glass-card mb-4 border-0">
        <Card.Body className="p-3">
          <Row className="g-3">
            <Col md={8} lg={9}>
              <InputGroup>
                <InputGroup.Text className="bg-white border-end-0">
                  🔍
                </InputGroup.Text>
                <Form.Control
                  className="border-start-0 ps-0"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={4} lg={3}>
              <InputGroup>
                <InputGroup.Text className="bg-white border-end-0">
                  🎭
                </InputGroup.Text>
                <Form.Select 
                  className="border-start-0 ps-0"
                  value={filterRole} 
                  onChange={(e) => setFilterRole(e.target.value)}
                >
                  <option value="All">All Roles</option>
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </Form.Select>
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row xs={1} md={2} lg={3} xl={4} className="g-4">
        {filteredStaff.map(member => (
          <Col key={member._id}>
            <Card className="staff-card-premium h-100 border-0 glass-card text-center">
              <Card.Body className="pt-4 pb-3">
                <div className="staff-avatar-premium mx-auto mb-3 position-relative">
                  {member.name.charAt(0).toUpperCase()}
                  <span className="status-dot-premium bg-success"></span>
                </div>
                <Card.Title className="h5 mb-1 text-truncate fw-bold">{member.name}</Card.Title>
                <Card.Text className="small text-muted mb-3 text-truncate">{member.email}</Card.Text>
                <div className="mb-3">
                  <Badge 
                    className={`badge-pill-premium role-${member.role}`}
                  >
                    {roles.find(r => r.value === member.role)?.icon} {member.role.replace('_', ' ')}
                  </Badge>
                  
                  {['superadmin', 'owner', 'manager'].includes(user?.role) && (
                    <div className="mt-2">
                      <Badge 
                        bg={member.loginAuthorized ? "success" : "danger"}
                        className="cursor-pointer"
                        onClick={() => handleToggleLogin(member._id, !member.loginAuthorized)}
                        title="Click to toggle login authorization"
                      >
                        {member.loginAuthorized ? "✅ Login Allowed" : "❌ Login Blocked"}
                      </Badge>
                    </div>
                  )}
                </div>
                
                <div className="d-flex gap-2 justify-content-center pt-3 border-top mt-auto">
                  <Button 
                    variant="light" 
                    size="sm" 
                    onClick={() => window.location.href = `/staff-profile?userId=${member._id}`}
                    title="View Profile"
                  >
                    👤
                  </Button>
                  {['superadmin', 'owner', 'manager'].includes(user?.role) && (
                    <>
                      <Button variant="light" size="sm" onClick={() => handleEdit(member)} title="Edit">
                        ✏️
                      </Button>
                      <Button variant="light" size="sm" onClick={() => handleDelete(member._id)} className="text-danger" title="Delete">
                        🗑️
                      </Button>
                    </>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {filteredStaff.length === 0 && !loading && (
        <Alert variant="info" className="text-center py-5 mt-4">
          <div className="display-4 mb-3">👥</div>
          <h3 className="h5">No team members found</h3>
          <p className="mb-0 text-muted">Try adjusting your search or filters</p>
        </Alert>
      )}

      <ConfirmModal
        show={showConfirmModal}
        onHide={() => {
          setShowConfirmModal(false);
          setStaffToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Staff"
        message="Are you sure you want to delete this staff member?"
        confirmText="Delete"
      />

      {/* Staff Modal */}
      <Modal show={showModal} onHide={() => { setShowModal(false); setEditingId(null); setFormData({ name: '', email: '', password: '', role: 'cashier' }); }} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? 'Edit Team Member' : 'Add New Team Member'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form id="staff-form" onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="e.g. john@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            {!editingId && (
              <Form.Group className="mb-3">
                <Form.Label>Initial Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="Min. 6 characters"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Assign Role</Form.Label>
              <Form.Select name="role" value={formData.role} onChange={handleInputChange}>
                {roles.map(role => (
                  <option key={role.value} value={role.value}>{role.icon} {role.label}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="staff-form">
            {editingId ? 'Save Changes' : 'Create Account'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Staff;
