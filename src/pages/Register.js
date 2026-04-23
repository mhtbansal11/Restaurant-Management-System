import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Button, Form, Spinner, InputGroup, Modal } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    restaurantName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register(formData.name, formData.email, formData.password, formData.restaurantName);
      setShowSuccessModal(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container-bs">
      <div className="auth-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
          <div className="shape shape-6"></div>
          <div className="shape shape-7"></div>
          <div className="shape shape-8"></div>
          <div className="shape shape-9"></div>
          <div className="shape shape-10"></div>
          <div className="shape shape-11"></div>
          <div className="shape shape-12"></div>
        </div>
      </div>

      {/* Full-screen loader overlay */}
      {loading && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(255,255,255,0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '16px'
          }}
        >
          <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
          <p className="fw-semibold text-primary mb-0">Creating your account...</p>
        </div>
      )}

      {/* Success modal */}
      <Modal
        show={showSuccessModal}
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Body className="text-center p-5">
          <div style={{ fontSize: '3.5rem', lineHeight: 1 }} className="mb-3">🎉</div>
          <h4 className="fw-bold mb-2">Profile Created Successfully!</h4>
          <p className="text-muted mb-4">
            Welcome to Masala Matrix, <strong>{formData.name}</strong>!<br />
            Your restaurant <strong>{formData.restaurantName}</strong> is ready to go.
          </p>
          <Button
            variant="primary"
            className="px-5 py-2 fw-bold rounded-3 border-0 shadow-sm"
            onClick={() => navigate('/dashboard')}
          >
            Continue to Dashboard →
          </Button>
        </Modal.Body>
      </Modal>

      <Container className="d-flex align-items-center justify-content-center min-vh-100 py-5">
        <div className="auth-card-bs border-0 shadow-lg overflow-hidden">
          <div className="auth-header-bs text-white">
            <div className="auth-logo-bs mb-3 d-flex justify-content-center">
              <BrandLogo theme="dark" size={56} style={{ }} />
            </div>
            <h1 className="h3 fw-bold mb-1">Masala Matrix</h1>
            <p className="mb-0 opacity-75">Restaurant Management Platform</p>
          </div>

          <div className="card-body">
            <div className="text-center">
              <h2 className="h4 fw-bold text-dark mb-2">Create Account</h2>
              <p className="text-muted">Join us to manage your restaurant efficiently</p>
            </div>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold text-muted text-uppercase">Full Name</Form.Label>
                <InputGroup className="bg-light rounded-3 overflow-hidden border-0">
                  <InputGroup.Text className="bg-transparent border-0 pe-0 text-muted">
                    👤
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    required
                    className="bg-transparent border-0 py-2 shadow-none"
                  />
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold text-muted text-uppercase">Restaurant Name</Form.Label>
                <InputGroup className="bg-light rounded-3 overflow-hidden border-0">
                  <InputGroup.Text className="bg-transparent border-0 pe-0 text-muted">
                    🏪
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="restaurantName"
                    value={formData.restaurantName}
                    onChange={handleChange}
                    placeholder="Enter restaurant name"
                    required
                    className="bg-transparent border-0 py-2 shadow-none"
                  />
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold text-muted text-uppercase">Email Address</Form.Label>
                <InputGroup className="bg-light rounded-3 overflow-hidden border-0">
                  <InputGroup.Text className="bg-transparent border-0 pe-0 text-muted">
                    📧
                  </InputGroup.Text>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    className="bg-transparent border-0 py-2 shadow-none"
                  />
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="small fw-bold text-muted text-uppercase">Password</Form.Label>
                <InputGroup className="bg-light rounded-3 overflow-hidden border-0">
                  <InputGroup.Text className="bg-transparent border-0 pe-0 text-muted">
                    🔒
                  </InputGroup.Text>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    required
                    minLength={6}
                    className="bg-transparent border-0 py-2 shadow-none"
                  />
                  <Button
                    variant="link"
                    className="bg-transparent border-0 text-muted text-decoration-none px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '👁️' : '🙈'}
                  </Button>
                </InputGroup>
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                className="w-100 py-3 fw-bold rounded-3 shadow-sm border-0 mb-4"
                disabled={loading}
              >
                {loading ? 'Creating account...' : '🚀 Create Account'}
              </Button>
            </Form>

            <div className="text-center">
              <p className="text-muted small mb-0">
                Already have an account? <Link to="/login" className="text-primary text-decoration-none fw-bold">Sign In</Link>
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Register;
