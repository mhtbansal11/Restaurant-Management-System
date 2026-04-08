import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Button, Form, Spinner, InputGroup } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Successfully logged in!');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);

    try {
      // Simulate forgot password API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Password reset link has been sent to your email!');
      setForgotEmail('');
      setTimeout(() => {
        setShowForgotPassword(false);
      }, 3000);
    } catch (err) {
      toast.error('Failed to send password reset link');
    } finally {
      setForgotLoading(false);
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
      
      <Container className="d-flex align-items-center justify-content-center min-vh-100">
        <div className="auth-card-bs border-0 shadow-lg overflow-hidden">
          <div className="auth-header-bs text-white">
            <div className="auth-logo-bs mb-3 fs-1">🍽️</div>
            <h1 className="h3 fw-bold mb-1">Restaurant POS</h1>
            <p className="mb-0 opacity-75">Management System</p>
          </div>
          
          <div className="card-body">
            {!showForgotPassword ? (
              <>
                <div className="text-center">
                  <h2 className="h4 fw-bold text-dark mb-2">Welcome Back</h2>
                  <p className="text-muted">Sign in to your account to continue</p>
                </div>
                
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold text-muted text-uppercase">Email Address</Form.Label>
                    <InputGroup className="bg-light rounded-3 overflow-hidden border-0">
                      <InputGroup.Text className="bg-transparent border-0 pe-0 text-muted">
                        📧
                      </InputGroup.Text>
                      <Form.Control
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
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
                    {loading ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                        Logging in...
                      </>
                    ) : '🚀 Login'}
                  </Button>
                </Form>
                
                <div className="text-center">
                  <button 
                    type="button" 
                    className="btn btn-link text-decoration-none small fw-bold p-0 mb-3"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Forgot your password?
                  </button>
                  <p className="text-muted small mb-0">
                    Don't have an account? <Link to="/register" className="text-primary text-decoration-none fw-bold">Create Account</Link>
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <h2 className="h4 fw-bold text-dark mb-2">Reset Password</h2>
                  <p className="text-muted">Enter your email to receive password reset link</p>
                </div>
                
                <Form onSubmit={handleForgotPassword}>
                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-bold text-muted text-uppercase">Email Address</Form.Label>
                    <InputGroup className="bg-light rounded-3 overflow-hidden border-0">
                      <InputGroup.Text className="bg-transparent border-0 pe-0 text-muted">
                        📧
                      </InputGroup.Text>
                      <Form.Control
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        className="bg-transparent border-0 py-2 shadow-none"
                      />
                    </InputGroup>
                  </Form.Group>
                  
                  <Button 
                    variant="primary" 
                    type="submit" 
                    className="w-100 py-3 fw-bold rounded-3 shadow-sm border-0 mb-4" 
                    disabled={forgotLoading}
                  >
                    {forgotLoading ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                        Sending...
                      </>
                    ) : '📧 Send Reset Link'}
                  </Button>
                </Form>
                
                <div className="text-center">
                  <button 
                    type="button" 
                    className="btn btn-link text-decoration-none small fw-bold p-0"
                    onClick={() => {
                      setShowForgotPassword(false);
                    }}
                  >
                    ← Back to Login
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Login;

