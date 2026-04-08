import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import { Row, Col, Card, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import './OutletSettings.css';

const OutletSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    name: '',
    address: '',
    phone: '',
    settings: {
      currency: 'INR',
      taxRate: 5,
      serviceCharge: 0,
      isGstEnabled: true,
      gstNumber: '',
      fssaiNumber: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${config.ENDPOINTS.OUTLET}/current`);
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage({ type: 'danger', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('settings.')) {
      const settingName = name.split('.')[1];
      setSettings(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          [settingName]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await axios.put(`${config.ENDPOINTS.OUTLET}/current`, settings);
      setMessage({ type: 'success', text: 'Settings updated successfully!' });
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'danger', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" className="mb-3" />
        <p className="text-muted fw-medium">Loading Settings...</p>
      </div>
    );
  }

  return (
    <div className="settings-page-premium">
      <div className="mb-4 page-header-glass p-3 shadow-sm d-flex flex-column">
        <h1 className="h4 fw-bold text-gradient mb-1">Outlet Config</h1>
        <p className="text-muted small mb-0">Manage restaurant identity, taxation, and operational rules</p>
      </div>

      {message.text && (
        <Alert variant={message.type} onClose={() => setMessage({ type: '', text: '' })} dismissible className="mb-4 border-0 shadow-sm">
          {message.text}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Row className="g-4">
          <Col lg={8}>
            <Card className="glass-card mb-4 section-card-bs border-0">
              <Card.Header className="bg-transparent border-0 pt-4 px-4">
                <h3 className="h5 fw-bold mb-0">Basic Profile</h3>
              </Card.Header>
              <Card.Body className="p-4">
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted text-uppercase">Restaurant Name</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="name" 
                        value={settings.name} 
                        onChange={handleChange} 
                        required 
                        className="bg-light border-0 py-2 shadow-none"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted text-uppercase">Phone Number</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="phone" 
                        value={settings.phone} 
                        onChange={handleChange} 
                        required 
                        className="bg-light border-0 py-2 shadow-none"
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted text-uppercase">Address</Form.Label>
                      <Form.Control 
                        as="textarea" 
                        rows={3}
                        name="address" 
                        value={settings.address} 
                        onChange={handleChange} 
                        required 
                        className="bg-light border-0 py-2 shadow-none"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="glass-card section-card-bs border-0">
              <Card.Header className="bg-transparent border-0 pt-4 px-4">
                <h3 className="h5 fw-bold mb-0">Legal & Compliance</h3>
              </Card.Header>
              <Card.Body className="p-4">
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted text-uppercase">GST Number</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="settings.gstNumber" 
                        value={settings.settings.gstNumber} 
                        onChange={handleChange} 
                        className="bg-light border-0 py-2 shadow-none"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted text-uppercase">FSSAI License Number</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="settings.fssaiNumber" 
                        value={settings.settings.fssaiNumber} 
                        onChange={handleChange} 
                        className="bg-light border-0 py-2 shadow-none"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="glass-card section-card-bs border-0 sticky-top" style={{ top: '2rem' }}>
              <Card.Header className="bg-transparent border-0 pt-4 px-4">
                <h3 className="h5 fw-bold mb-0">Taxes & Charges</h3>
              </Card.Header>
              <Card.Body className="p-4">
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-muted text-uppercase">Tax Rate (GST %)</Form.Label>
                  <Form.Control 
                    type="number" 
                    name="settings.taxRate" 
                    value={settings.settings.taxRate} 
                    onChange={handleChange} 
                    className="bg-light border-0 py-2 shadow-none"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-muted text-uppercase">Service Charge (%)</Form.Label>
                  <Form.Control 
                    type="number" 
                    name="settings.serviceCharge" 
                    value={settings.settings.serviceCharge} 
                    onChange={handleChange} 
                    className="bg-light border-0 py-2 shadow-none"
                  />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label className="small fw-bold text-muted text-uppercase">Currency</Form.Label>
                  <Form.Select 
                    name="settings.currency" 
                    value={settings.settings.currency} 
                    onChange={handleChange}
                    className="bg-light border-0 py-2 shadow-none"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="AED">AED</option>
                  </Form.Select>
                </Form.Group>
                
                <Form.Check 
                  type="switch"
                  id="gst-switch"
                  label="Enable GST on Bills"
                  name="settings.isGstEnabled" 
                  checked={settings.settings.isGstEnabled} 
                  onChange={handleChange}
                  className="mb-4 fw-medium"
                />

                {['superadmin', 'owner', 'manager'].includes(user?.role) && (
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={saving} 
                    className="w-100 py-3 fw-bold rounded-3 shadow-sm border-0 mt-2"
                  >
                    {saving ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                        Saving...
                      </>
                    ) : 'Save Settings'}
                  </Button>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default OutletSettings;
