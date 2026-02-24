import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge, Modal, Form, Row, Col, ListGroup } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import config from '../config';

const ExpenseReminders = ({ show, onHide, expense }) => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: expense?.category || 'salary',
    amount: expense?.amount || '',
    dueDate: '',
    frequency: 'once',
    reminderType: 'before_due',
    reminderDays: 1,
    priority: 'medium',
    vendor: expense?.vendor || '',
    paymentMethod: expense?.paymentMethod || 'cash',
    notes: ''
  });

  const fetchReminders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(config.ENDPOINTS.EXPENSE_REMINDERS);
      setReminders(response.data);
    } catch (error) {
      console.error('Error fetching reminders:', error);
      toast.error('Failed to fetch reminders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (show) {
      fetchReminders();
    }
  }, [show, fetchReminders]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(config.ENDPOINTS.EXPENSE_REMINDERS, {
        ...formData,
        expenseId: expense?._id
      });
      
      toast.success('Reminder created successfully!');
      setShowAddModal(false);
      setFormData({
        title: '',
        description: '',
        category: 'salary',
        amount: '',
        dueDate: '',
        frequency: 'once',
        reminderType: 'before_due',
        reminderDays: 1,
        priority: 'medium',
        vendor: '',
        paymentMethod: 'cash',
        notes: ''
      });
      fetchReminders();
    } catch (error) {
      console.error('Error creating reminder:', error);
      toast.error('Failed to create reminder');
    }
  };

  const handleSnooze = async (reminderId, days = 1) => {
    try {
      await axios.patch(`${config.ENDPOINTS.EXPENSE_REMINDERS}/${reminderId}/snooze`, { days });
      toast.success(`Reminder snoozed for ${days} day(s)`);
      fetchReminders();
    } catch (error) {
      console.error('Error snoozing reminder:', error);
      toast.error('Failed to snooze reminder');
    }
  };

  const handleComplete = async (reminderId) => {
    try {
      await axios.patch(`${config.ENDPOINTS.EXPENSE_REMINDERS}/${reminderId}/complete`);
      toast.success('Reminder marked as completed');
      fetchReminders();
    } catch (error) {
      console.error('Error completing reminder:', error);
      toast.error('Failed to complete reminder');
    }
  };

  const handleDelete = async (reminderId) => {
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      try {
        await axios.delete(`${config.ENDPOINTS.EXPENSE_REMINDERS}/${reminderId}`);
        toast.success('Reminder deleted successfully');
        fetchReminders();
      } catch (error) {
        console.error('Error deleting reminder:', error);
        toast.error('Failed to delete reminder');
      }
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'secondary';
      default: return 'light';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'primary';
      case 'completed': return 'success';
      case 'snoozed': return 'warning';
      case 'cancelled': return 'secondary';
      default: return 'light';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Modal show={show} onHide={onHide} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            💰 Expense Reminders
            {expense && ` for ${expense.description}`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6>Upcoming Reminders</h6>
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => setShowAddModal(true)}
            >
              + Add Reminder
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : reminders.length === 0 ? (
            <Card className="text-center py-4">
              <Card.Body>
                <div className="text-muted">
                  <div style={{ fontSize: '3rem' }}>⏰</div>
                  <h6>No reminders set up yet</h6>
                  <p>Create your first reminder to get notified about important expenses</p>
                </div>
              </Card.Body>
            </Card>
          ) : (
            <ListGroup variant="flush">
              {reminders.map((reminder) => (
                <ListGroup.Item key={reminder._id} className="px-0">
                  <Row className="align-items-center">
                    <Col md={8}>
                      <div className="d-flex align-items-center">
                        <Badge 
                          bg={getPriorityColor(reminder.priority)} 
                          className="me-2"
                        >
                          {reminder.priority}
                        </Badge>
                        <Badge 
                          bg={getStatusColor(reminder.status)} 
                          className="me-2"
                        >
                          {reminder.status}
                        </Badge>
                        <div>
                          <h6 className="mb-1">{reminder.title}</h6>
                          <small className="text-muted">
                            {reminder.description} • {formatCurrency(reminder.amount)}
                          </small>
                          <br />
                          <small className="text-muted">
                            Due: {formatDate(reminder.dueDate)} • 
                            Next: {formatDate(reminder.nextReminder)}
                          </small>
                        </div>
                      </div>
                    </Col>
                    <Col md={4} className="text-end">
                      {reminder.status === 'pending' && (
                        <>
                          <Button
                            variant="outline-success"
                            size="sm"
                            className="me-1"
                            onClick={() => handleComplete(reminder._id)}
                          >
                            ✓
                          </Button>
                          <Button
                            variant="outline-warning"
                            size="sm"
                            className="me-1"
                            onClick={() => handleSnooze(reminder._id)}
                          >
                            ⏰
                          </Button>
                        </>
                      )}
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(reminder._id)}
                      >
                        🗑️
                      </Button>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Reminder Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Reminder</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Title *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category *</Form.Label>
                  <Form.Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="salary">💼 Salary</option>
                    <option value="inventory">📦 Inventory</option>
                    <option value="rent">🏠 Rent</option>
                    <option value="utilities">⚡ Utilities</option>
                    <option value="maintenance">🔧 Maintenance</option>
                    <option value="marketing">📢 Marketing</option>
                    <option value="other">📋 Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description *</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Amount (₹) *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Due Date *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Reminder Type</Form.Label>
                  <Form.Select
                    value={formData.reminderType}
                    onChange={(e) => setFormData({ ...formData, reminderType: e.target.value })}
                  >
                    <option value="before_due">📅 Before Due Date</option>
                    <option value="on_due">⏰ On Due Date</option>
                    <option value="after_due">⚠️ After Due Date</option>
                    <option value="recurring">🔄 Recurring</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Days</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={formData.reminderDays}
                    onChange={(e) => setFormData({ ...formData, reminderDays: parseInt(e.target.value) })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Frequency</Form.Label>
                  <Form.Select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  >
                    <option value="once">Once</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Priority</Form.Label>
                  <Form.Select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes or instructions"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Create Reminder
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

export default ExpenseReminders;