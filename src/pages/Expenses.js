import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Badge, Modal } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import config from '../config';
import './Expenses.css';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [filters, setFilters] = useState({
    period: 'month',
    category: 'all',
    status: 'all',
    search: ''
  });
  const [stats, setStats] = useState({
    totalExpenses: 0,
    expensesByCategory: []
  });
  const [formData, setFormData] = useState({
    category: 'salary',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    referenceNumber: '',
    vendor: '',
    isRecurring: false,
    recurringFrequency: null,
    status: 'paid',
    createReminder: false,
    reminderType: 'before_due',
    reminderDays: 1
  });

  const categories = [
    { value: 'salary', label: '💼 Salary', color: 'primary' },
    { value: 'inventory', label: '📦 Inventory', color: 'info' },
    { value: 'rent', label: '🏠 Rent', color: 'warning' },
    { value: 'utilities', label: '⚡ Utilities', color: 'secondary' },
    { value: 'maintenance', label: '🔧 Maintenance', color: 'dark' },
    { value: 'marketing', label: '📢 Marketing', color: 'success' },
    { value: 'other', label: '📋 Other', color: 'light' }
  ];

  const paymentMethods = [
    { value: 'cash', label: '💵 Cash' },
    { value: 'bank_transfer', label: '🏦 Bank Transfer' },
    { value: 'card', label: '💳 Card' },
    { value: 'upi', label: '📱 UPI' },
    { value: 'other', label: '📋 Other' }
  ];

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(filters);
      const response = await axios.get(`${config.ENDPOINTS.EXPENSES}?${params}`);
      setExpenses(response.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get(`${config.ENDPOINTS.EXPENSES}/stats/summary?period=${filters.period}`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [filters.period]);

  useEffect(() => {
    fetchExpenses();
    fetchStats();
  }, [fetchExpenses, fetchStats]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let savedExpense;
      
      if (editingExpense) {
        const response = await axios.put(`${config.ENDPOINTS.EXPENSES}/${editingExpense._id}`, formData);
        savedExpense = response.data;
        toast.success('Expense updated successfully');
      } else {
        const response = await axios.post(config.ENDPOINTS.EXPENSES, formData);
        savedExpense = response.data;
        toast.success('Expense added successfully');
      }
      
      // Create reminder if requested
      if (formData.createReminder && savedExpense) {
        try {
          await axios.post(config.ENDPOINTS.EXPENSE_REMINDERS, {
            title: `Payment: ${formData.description}`,
            description: `Reminder for ${formData.description} payment`,
            category: formData.category,
            amount: formData.amount,
            dueDate: formData.date,
            frequency: formData.isRecurring ? formData.recurringFrequency : 'once',
            reminderType: formData.reminderType,
            reminderDays: formData.reminderDays,
            priority: formData.amount > 10000 ? 'high' : 'medium',
            vendor: formData.vendor,
            paymentMethod: formData.paymentMethod,
            notes: `Auto-created from expense: ${formData.description}`,
            expenseId: savedExpense._id
          });
          toast.success('Reminder created successfully!');
        } catch (reminderError) {
          console.error('Error creating reminder:', reminderError);
          toast.error('Expense saved but failed to create reminder');
        }
      }
      
      setShowAddModal(false);
      setEditingExpense(null);
      setFormData({
        category: 'salary',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'cash',
        referenceNumber: '',
        vendor: '',
        isRecurring: false,
        recurringFrequency: null,
        status: 'paid',
        createReminder: false,
        reminderType: 'before_due',
        reminderDays: 1
      });
      
      fetchExpenses();
      fetchStats();
    } catch (error) {
      console.error('Error saving expense:', error);
      toast.error('Failed to save expense');
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      date: new Date(expense.date).toISOString().split('T')[0],
      paymentMethod: expense.paymentMethod,
      referenceNumber: expense.referenceNumber || '',
      vendor: expense.vendor || '',
      isRecurring: expense.isRecurring || false,
      recurringFrequency: expense.recurringFrequency || null,
      status: expense.status
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await axios.delete(`${config.ENDPOINTS.EXPENSES}/${id}`);
        toast.success('Expense deleted successfully');
        fetchExpenses();
        fetchStats();
      } catch (error) {
        console.error('Error deleting expense:', error);
        toast.error('Failed to delete expense');
      }
    }
  };

  const getCategoryInfo = (category) => {
    return categories.find(c => c.value === category) || { label: category, color: 'secondary' };
  };

  const getPaymentMethodInfo = (method) => {
    return paymentMethods.find(m => m.value === method) || { label: method };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };


  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <div className="expenses-page">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1 fw-bold">💸 Expenses Management</h2>
              <p className="text-muted mb-0">Track and manage all business expenses</p>
            </div>
            <Button 
              variant="primary" 
              onClick={() => setShowAddModal(true)}
              className="fw-bold"
            >
              ➕ Add Expense
            </Button>
          </div>
        </Col>
      </Row>


      {/* Stats Cards */}
      <Row className="mb-4">
        <Col lg={4} md={6} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="bg-primary bg-opacity-10 p-3 rounded-3 text-primary d-inline-block mb-3">
                <span className="h4 mb-0">💰</span>
              </div>
              <h6 className="text-muted mb-1">Total Expenses</h6>
              <h4 className="mb-0 fw-bold text-danger">
                {formatCurrency(stats.totalExpenses)}
              </h4>
              <small className="text-muted">This {filters.period}</small>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={8} md={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <h6 className="text-muted mb-3">Expenses by Category</h6>
              <div className="d-flex flex-wrap gap-2">
                {stats.expensesByCategory.map((item, index) => {
                  const categoryInfo = getCategoryInfo(item._id);
                  return (
                    <Badge 
                      key={index}
                      bg={categoryInfo.color + '-subtle'}
                      text={categoryInfo.color}
                      className="px-3 py-2 border"
                    >
                      {categoryInfo.label}: {formatCurrency(item.total)}
                    </Badge>
                  );
                })}
                {stats.expensesByCategory.length === 0 && (
                  <span className="text-muted small">No expenses recorded</span>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-3">
          <Row className="g-3">
            <Col md={3}>
              <Form.Select 
                value={filters.period}
                onChange={(e) => handleFilterChange('period', e.target.value)}
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
                <option value="all">All Time</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select 
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select 
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </Form.Select>
            </Col>
            <Col md={5}>
              <Form.Control
                type="text"
                placeholder="Search by description, vendor, or reference..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Expenses Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3 border-bottom-0">Date</th>
                  <th className="px-4 py-3 border-bottom-0">Category</th>
                  <th className="px-4 py-3 border-bottom-0">Description</th>
                  <th className="px-4 py-3 border-bottom-0 text-end">Amount</th>
                  <th className="px-4 py-3 border-bottom-0">Payment</th>
                  <th className="px-4 py-3 border-bottom-0">Status</th>
                  <th className="px-4 py-3 border-bottom-0 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => {
                  const categoryInfo = getCategoryInfo(expense.category);
                  const paymentInfo = getPaymentMethodInfo(expense.paymentMethod);
                  
                  return (
                    <tr key={expense._id}>
                      <td className="px-4 py-3 border-bottom-0">
                        {new Date(expense.date).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-4 py-3 border-bottom-0">
                        <Badge 
                          bg={categoryInfo.color + '-subtle'}
                          text={categoryInfo.color}
                          className="px-2 py-1"
                        >
                          {categoryInfo.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 border-bottom-0">
                        <div>
                          <div className="fw-medium">{expense.description}</div>
                          {expense.vendor && (
                            <small className="text-muted">Vendor: {expense.vendor}</small>
                          )}
                          {expense.referenceNumber && (
                            <small className="text-muted d-block">Ref: {expense.referenceNumber}</small>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 border-bottom-0 text-end fw-bold text-danger">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="px-4 py-3 border-bottom-0">
                        <small className="text-muted">{paymentInfo.label}</small>
                      </td>
                      <td className="px-4 py-3 border-bottom-0">
                        <Badge 
                          bg={
                            expense.status === 'paid' ? 'success' :
                            expense.status === 'pending' ? 'warning' : 'danger'
                          }
                        >
                          {expense.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 border-bottom-0 text-end">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEdit(expense)}
                        >
                          ✏️ Edit
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(expense._id)}
                        >
                          🗑️ Delete
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {expenses.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      No expenses found. Add your first expense to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Add/Edit Modal */}
      <Modal show={showAddModal} onHide={() => {
        setShowAddModal(false);
        setEditingExpense(null);
        setFormData({
          category: 'salary',
          description: '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          paymentMethod: 'cash',
          referenceNumber: '',
          vendor: '',
          isRecurring: false,
          recurringFrequency: null,
          status: 'paid'
        });
      }} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingExpense ? '✏️ Edit Expense' : '➕ Add New Expense'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Amount (₹)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder="Enter amount"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Enter expense description"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Payment Method</Form.Label>
                  <Form.Select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                  >
                    {paymentMethods.map(method => (
                      <option key={method.value} value={method.value}>{method.label}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Vendor (Optional)</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.vendor}
                    onChange={(e) => setFormData({...formData, vendor: e.target.value})}
                    placeholder="Vendor name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Reference Number (Optional)</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.referenceNumber}
                    onChange={(e) => setFormData({...formData, referenceNumber: e.target.value})}
                    placeholder="Reference number"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="d-flex align-items-end h-100">
                  <Form.Check
                    type="checkbox"
                    label="Recurring Expense"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData({...formData, isRecurring: e.target.checked})}
                    className="pt-3"
                  />
                </Form.Group>
              </Col>
              {formData.isRecurring && (
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Recurring Frequency</Form.Label>
                    <Form.Select
                      value={formData.recurringFrequency || ''}
                      onChange={(e) => setFormData({...formData, recurringFrequency: e.target.value})}
                    >
                      <option value="">Select frequency</option>
                      <option value="daily">Daily</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              )}
              
              {/* Reminder Settings */}
              <Col md={12}>
                <hr />
                <Form.Group className="d-flex align-items-center">
                  <Form.Check
                    type="checkbox"
                    label="📅 Create Reminder for this Expense"
                    checked={formData.createReminder}
                    onChange={(e) => setFormData({...formData, createReminder: e.target.checked})}
                    className="me-3"
                  />
                </Form.Group>
              </Col>
              
              {formData.createReminder && (
                <>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Reminder Type</Form.Label>
                      <Form.Select
                        value={formData.reminderType}
                        onChange={(e) => setFormData({...formData, reminderType: e.target.value})}
                      >
                        <option value="before_due">📅 Before Due Date</option>
                        <option value="on_due">⏰ On Due Date</option>
                        <option value="after_due">⚠️ After Due Date</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Days</Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
                        value={formData.reminderDays}
                        onChange={(e) => setFormData({...formData, reminderDays: parseInt(e.target.value) || 1})}
                        placeholder="Days before/after"
                      />
                    </Form.Group>
                  </Col>
                </>
              )}
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingExpense ? 'Update Expense' : 'Add Expense'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Expenses;
