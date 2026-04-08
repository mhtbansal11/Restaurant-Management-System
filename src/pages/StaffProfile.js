import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import config from '../config';
import { Row, Col, Card, Button, Form, Alert, Spinner, Image, Tab, Tabs, Badge, Modal } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import './StaffProfile.css';

const StaffProfile = () => {
  const { user: authUser } = useAuth();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({ front: false, back: false });
  const [selectedAadharFiles, setSelectedAadharFiles] = useState({ front: null, back: null });
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    emergencyContact: {
      name: '',
      phone: '',
      relation: ''
    },
    aadharNumber: ''
  });

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const url = userId 
        ? `${config.API_URL}/users/${userId}`
        : `${config.API_URL}/users/profile`;
      
      const response = await axios.get(url);
      const userData = response.data;
      setProfileData(userData);
      
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || '',
        dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : '',
        gender: userData.gender || '',
        emergencyContact: {
          name: userData.emergencyContact?.name || '',
          phone: userData.emergencyContact?.phone || '',
          relation: userData.emergencyContact?.relation || ''
        },
        aadharNumber: userData.aadharNumber || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [userId, fetchProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('emergencyContact.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const url = userId 
        ? `${config.API_URL}/users/${userId}`
        : `${config.API_URL}/users/profile`;
      
      await axios.put(url, formData);
      toast.success('Profile updated successfully');
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAadharUpload = async () => {
    // Check if any files are selected or Aadhar number is provided
    if (!selectedAadharFiles.front && !selectedAadharFiles.back && !formData.aadharNumber) {
      toast.error('Please provide Aadhar number or select at least one file to upload');
      return;
    }

    try {
      setUploading({ front: true, back: true });
      
      const submitFormData = new FormData();
      
      // Add Aadhar number if provided
      if (formData.aadharNumber) {
        submitFormData.append('aadharNumber', formData.aadharNumber);
      }
      
      // Add front side file if selected
      if (selectedAadharFiles.front) {
        const file = selectedAadharFiles.front;
        if (file.size > 5 * 1024 * 1024) {
          toast.error('Front side file size must be less than 5MB');
          setUploading({ front: false, back: false });
          return;
        }
        
        if (!file.type.startsWith('image/')) {
          toast.error('Front side must be an image file');
          setUploading({ front: false, back: false });
          return;
        }
        
        submitFormData.append('aadharFront', file);
      }
      
      // Add back side file if selected
      if (selectedAadharFiles.back) {
        const file = selectedAadharFiles.back;
        if (file.size > 5 * 1024 * 1024) {
          toast.error('Back side file size must be less than 5MB');
          setUploading({ front: false, back: false });
          return;
        }
        
        if (!file.type.startsWith('image/')) {
          toast.error('Back side must be an image file');
          setUploading({ front: false, back: false });
          return;
        }
        
        submitFormData.append('aadharBack', file);
      }
      
      // Add user ID if provided (for admin uploading for staff)
      if (userId) {
        submitFormData.append('userId', userId);
      }
      
      // Submit all data together
      await axios.post(`${config.API_URL}/users/submit-aadhar`, submitFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Clear selected files and refresh profile
      setSelectedAadharFiles({ front: null, back: null });
      toast.success('Aadhar information submitted successfully');
      fetchProfile();
    } catch (error) {
      console.error('Error submitting Aadhar:', error);
      toast.error('Failed to submit Aadhar information');
    } finally {
      setUploading({ front: false, back: false });
    }
  };

  const handleApproveAadhar = async () => {
    if (!userId) return;
    
    try {
      setApproving(true);
      await axios.patch(`${config.API_URL}/users/approve-aadhar/${userId}`);
      toast.success('Aadhar card approved successfully');
      fetchProfile();
    } catch (error) {
      console.error('Error approving Aadhar:', error);
      toast.error('Failed to approve Aadhar card');
    } finally {
      setApproving(false);
    }
  };

  const handleRejectAadhar = async () => {
    if (!userId) return;
    
    try {
      setRejecting(true);
      await axios.patch(`${config.API_URL}/users/reject-aadhar/${userId}`, {
        rejectionReason
      });
      toast.success('Aadhar card rejected');
      setShowRejectModal(false);
      setRejectionReason('');
      fetchProfile();
    } catch (error) {
      console.error('Error rejecting Aadhar:', error);
      toast.error('Failed to reject Aadhar card');
    } finally {
      setRejecting(false);
    }
  };

  const formatAadharNumber = (number) => {
    if (!number) return '';
    const cleaned = number.replace(/\D/g, '');
    
    // Show masked format: XXXX XXXX XXXX with only last 4 digits visible
    if (cleaned.length === 0) return '';
    
    const last4Digits = cleaned.slice(-4);
    const maskedPart = 'XXXX XXXX ';
    
    return `${maskedPart}${last4Digits}`;
  };

  const handleAadharNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    // Store the full Aadhar number (up to 12 digits)
    if (value.length <= 12) {
      setFormData(prev => ({ ...prev, aadharNumber: value }));
    }
  };

  if (loading) return (
    <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Spinner animation="border" variant="primary" className="mb-3" />
      <p className="text-muted fw-bold">Loading your profile...</p>
    </div>
  );

  return (
    <div className="staff-profile-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h4 mb-1 fw-bold">
            {userId ? 'Staff Profile' : 'Profile'}
          </h2>
          <p className="text-muted mb-0">
            {userId ? 'Staff member details' : 'Manage your personal information and Aadhar card'}
          </p>
        </div>
        
        {!userId && (
          <Badge bg={profileData?.loginAuthorized ? 'success' : 'danger'}>
            {profileData?.loginAuthorized ? '✅ Login Allowed' : '❌ Login Blocked'}
          </Badge>
        )}
      </div>

      <Tabs defaultActiveKey="personal" className="mb-4">
        <Tab eventKey="personal" title="Personal Information">
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <Form onSubmit={handleSubmit}>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        disabled
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+91XXXXXXXXXX"
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Date of Birth</Form.Label>
                      <Form.Control
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Gender</Form.Label>
                      <Form.Select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Address</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Full residential address"
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={12}>
                    <Card className="border">
                      <Card.Header className="bg-light">
                        <h6 className="mb-0">Emergency Contact</h6>
                      </Card.Header>
                      <Card.Body>
                        <Row className="g-3">
                          <Col md={4}>
                            <Form.Group>
                              <Form.Label>Contact Name</Form.Label>
                              <Form.Control
                                type="text"
                                name="emergencyContact.name"
                                value={formData.emergencyContact.name}
                                onChange={handleInputChange}
                                placeholder="Full name"
                              />
                            </Form.Group>
                          </Col>
                          
                          <Col md={4}>
                            <Form.Group>
                              <Form.Label>Phone Number</Form.Label>
                              <Form.Control
                                type="tel"
                                name="emergencyContact.phone"
                                value={formData.emergencyContact.phone}
                                onChange={handleInputChange}
                                placeholder="+91XXXXXXXXXX"
                              />
                            </Form.Group>
                          </Col>
                          
                          <Col md={4}>
                            <Form.Group>
                              <Form.Label>Relation</Form.Label>
                              <Form.Control
                                type="text"
                                name="emergencyContact.relation"
                                value={formData.emergencyContact.relation}
                                onChange={handleInputChange}
                                placeholder="Father, Mother, Spouse, etc."
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>
                  
                  <Col md={12} className="text-end">
                    <Button type="submit" variant="primary" disabled={saving}>
                      {saving ? <Spinner animation="border" size="sm" /> : 'Save Changes'}
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="aadhar" title="Aadhar Card">
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <Row className="g-4">
                {/* Left Column - Aadhar Details and Upload */}
                <Col md={8}>
                  <Row className="g-4">
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label>Aadhar Number</Form.Label>
                        <Form.Control
                          type="text"
                          name="aadharNumber"
                          value={formatAadharNumber(formData.aadharNumber)}
                          onChange={handleAadharNumberChange}
                          placeholder="XXXX XXXX XXXX"
                          maxLength="14"
                        />
                        <Form.Text className="text-muted">
                         Enter last 4-digit Aadhar number without spaces
                        </Form.Text>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Card className="h-100">
                        <Card.Header className="bg-light">
                          <h6 className="mb-0">Front Side</h6>
                        </Card.Header>
                        <Card.Body>
                          <div className="text-center">
                            {/* Show existing file if it exists */}
                            {profileData?.aadharFront && (
                              <div className="mb-3">
                                <Image
                                  src={`${config.FILE_URL}${profileData.aadharFront}`}
                                  alt="Current Aadhar Front"
                                  fluid
                                  style={{ maxHeight: '150px' }}
                                  className="border rounded"
                                />
                                <div className="text-muted small mt-1">
                                  Current file
                                </div>
                              </div>
                            )}
                            
                            {/* Always show file input */}
                            <Form.Control
                              type="file"
                              accept="image/*"
                              onChange={(e) => setSelectedAadharFiles(prev => ({ ...prev, front: e.target.files[0] }))}
                              disabled={uploading.front}
                              size="sm"
                              className="mb-2"
                            />
                            
                            {/* Show upload prompt when no file is selected */}
                            {!selectedAadharFiles.front && !profileData?.aadharFront && (
                              <div className="text-center text-muted">
                                <i className="bi bi-image fs-1"></i>
                                <p className="small mb-0">Upload front side</p>
                              </div>
                            )}
                          </div>
                          {selectedAadharFiles.front && (
                            <div className="text-success small mt-2">
                              ✓ {selectedAadharFiles.front.name} selected
                            </div>
                          )}
                          {uploading.front && (
                            <div className="text-center mt-2">
                              <Spinner animation="border" size="sm" />
                              <small className="text-muted d-block">Uploading...</small>
                            </div>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col md={6}>
                      <Card className="h-100">
                        <Card.Header className="bg-light">
                          <h6 className="mb-0">Back Side</h6>
                        </Card.Header>
                        <Card.Body>
                          <div className="text-center">
                            {/* Show existing file if it exists */}
                            {profileData?.aadharBack && (
                              <div className="mb-3">
                                <Image
                                  src={`${config.FILE_URL}${profileData.aadharBack}`}
                                  alt="Current Aadhar Back"
                                  fluid
                                  style={{ maxHeight: '150px' }}
                                  className="border rounded"
                                />
                                <div className="text-muted small mt-1">
                                  Current file
                                </div>
                              </div>
                            )}
                            
                            {/* Always show file input */}
                            <Form.Control
                              type="file"
                              accept="image/*"
                              onChange={(e) => setSelectedAadharFiles(prev => ({ ...prev, back: e.target.files[0] }))}
                              disabled={uploading.back}
                              size="sm"
                              className="mb-2"
                            />
                            
                            {/* Show upload prompt when no file is selected */}
                            {!selectedAadharFiles.back && !profileData?.aadharBack && (
                              <div className="text-center text-muted">
                                <i className="bi bi-image fs-1"></i>
                                <p className="small mb-0">Upload back side</p>
                              </div>
                            )}
                          </div>
                          {selectedAadharFiles.back && (
                            <div className="text-success small mt-2">
                              ✓ {selectedAadharFiles.back.name} selected
                            </div>
                          )}
                          {uploading.back && (
                            <div className="text-center mt-2">
                              <Spinner animation="border" size="sm" />
                              <small className="text-muted d-block">Uploading...</small>
                            </div>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col md={12}>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          {selectedAadharFiles.front || selectedAadharFiles.back ? (
                            <small className="text-success">
                              ✓ Files selected for upload
                            </small>
                          ) : (
                            <small className="text-muted">
                              Select front and/or back side to upload
                            </small>
                          )}
                        </div>
                        <Button
                          variant="primary"
                          onClick={() => handleAadharUpload()}
                          disabled={uploading.front || uploading.back || (!selectedAadharFiles.front && !selectedAadharFiles.back)}
                          size="sm"
                        >
                          {uploading.front || uploading.back ? (
                            <>
                              <Spinner animation="border" size="sm" className="me-2" />
                              Uploading...
                            </>
                          ) : (
                            'Submit'
                          )}
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Col>

                {/* Right Column - Verification Status */}
                <Col md={4}>
                  <Card className="bg-light border h-100">
                    <Card.Body>
                      <h6 className="mb-3">Verification Status</h6>
                      
                      {/* Status Display */}
                      {profileData?.aadharStatus === 'approved' ? (
                        <Alert variant="success" className="mb-3">
                          <div className="d-flex align-items-center">
                            <i className="bi bi-check-circle-fill me-2"></i>
                            <div>
                              <strong>Approved</strong>
                              <div className="small">Your Aadhar is verified</div>
                            </div>
                          </div>
                        </Alert>
                      ) : profileData?.aadharStatus === 'rejected' ? (
                        <Alert variant="danger" className="mb-3">
                          <div className="d-flex align-items-center">
                            <i className="bi bi-x-circle-fill me-2"></i>
                            <div>
                              <strong>Rejected</strong>
                              <div className="small">
                                {profileData?.aadharRejectionReason || 'Please upload clear images'}
                              </div>
                            </div>
                          </div>
                        </Alert>
                      ) : profileData?.aadharVerified ? (
                        <Alert variant="success" className="mb-3">
                          <div className="d-flex align-items-center">
                            <i className="bi bi-check-circle-fill me-2"></i>
                            <div>
                              <strong>Verified</strong>
                              <div className="small">Aadhar is verified</div>
                            </div>
                          </div>
                        </Alert>
                      ) : (
                        <Alert variant="warning" className="mb-3">
                          <div className="d-flex align-items-center">
                            <i className="bi bi-clock-history me-2"></i>
                            <div>
                              <strong>Pending Verification</strong>
                              <div className="small">Under administrative review</div>
                            </div>
                          </div>
                        </Alert>
                      )}

                      {/* Owner Actions - Only show when status is pending */}
                      {userId && authUser?.role === 'owner' && profileData?.aadharStatus === 'pending' && (
                        <div className="border-top pt-3">
                          <h6 className="small text-muted mb-2">Admin Actions</h6>
                          <div className="d-grid gap-2">
                            <Button 
                              variant="success" 
                              size="sm"
                              onClick={handleApproveAadhar}
                              disabled={approving || profileData?.aadharStatus === 'approved'}
                            >
                              {approving ? 'Approving...' : 'Approve'}
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => setShowRejectModal(true)}
                              disabled={rejecting}
                            >
                              {rejecting ? 'Rejecting...' : 'Reject'}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Status Information */}
                      <div className="border-top pt-3 mt-3">
                        <small className="text-muted">
                          <i className="bi bi-info-circle me-1"></i>
                          Status updates automatically when new files are uploaded.
                          Rejected status clears when new uploads are submitted.
                        </small>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* Rejection Modal */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reject Aadhar Card</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Rejection Reason</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Please provide a reason for rejecting this Aadhar card..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <Form.Text className="text-muted">
              This message will be shown to the staff member.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleRejectAadhar}
            disabled={rejecting || !rejectionReason.trim()}
          >
            {rejecting ? 'Rejecting...' : 'Reject Aadhar'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default StaffProfile;