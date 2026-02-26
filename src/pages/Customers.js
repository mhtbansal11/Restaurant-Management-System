import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Form, 
  InputGroup, 
  Badge, 
  Table,
  Modal, 
  Spinner
} from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Customers.css';

const Customers = () => {
  const { user } = useAuth();
  console.log("user",user)
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [settleAmount, setSettleAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [settleLoading, setSettleLoading] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });
  const [filter, setFilter] = useState('all'); // all, due, regular

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(config.ENDPOINTS.CUSTOMERS);
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      await axios.post(config.ENDPOINTS.CUSTOMERS, customerForm);
      setCustomerForm({ name: '', phone: '', email: '', address: '', notes: '' });
      setShowCreateModal(false);
      fetchCustomers();
      toast.success('Customer created successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create customer');
    }
  };

  const handleSettleDue = async (e) => {
    e.preventDefault();
    const amountNumber = Number(settleAmount);
    if (!settleAmount || Number.isNaN(amountNumber) || amountNumber <= 0) {
      toast.error('Please enter a valid settlement amount');
      return;
    }
    if (maxSettleAmount !== undefined && maxSettleAmount !== null) {
      const maxAllowed = Number(maxSettleAmount);
      if (!Number.isNaN(maxAllowed) && amountNumber > maxAllowed + 0.0001) {
        toast.error('Settlement amount cannot exceed due amount');
        return;
      }
    }

    try {
      setSettleLoading(true);
      
      if (selectedOrder) {
        // Settle specific order due
        await axios.put(`${config.ENDPOINTS.ORDERS}/${selectedOrder._id}/settle-due`, {
          settledAmount: amountNumber,
          paymentMode
        });
        toast.success('Order due settled successfully!');
      } else if (selectedCustomer) {
        toast.error('No due orders available for settlement');
        return;
      }

      setShowSettleModal(false);
      setSettleAmount('');
      setPaymentMode('cash');
      setSelectedOrder(null);
      fetchCustomers();
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to settle due amount');
    } finally {
      setSettleLoading(false);
    }
  };

  const handleOpenSettleModal = (customer, order = null) => {
    const dueOrders = customer?.orderHistory?.filter(item => (item.dueAmount || 0) > 0) || [];
    const initialOrder = order || dueOrders[0] || null;
    setSelectedCustomer(customer);
    setSelectedOrder(initialOrder);
    const amount = initialOrder ? initialOrder.dueAmount : customer?.pendingBalance;
    setSettleAmount(amount ? amount.toString() : '');
    setShowSettleModal(true);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleViewDetails = async (customer) => {
    setShowDetailsModal(true);
    setDetailsLoading(true);
    try {
      const response = await axios.get(`${config.ENDPOINTS.CUSTOMERS}/${customer._id}/history`);
      setSelectedCustomer(response.data);
    } catch (error) {
      setSelectedCustomer(customer);
      toast.error(error.response?.data?.message || 'Failed to load customer history');
    } finally {
      setDetailsLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'due') {
      return matchesSearch && customer.pendingBalance > 0;
    } else if (filter === 'regular') {
      return matchesSearch && customer.pendingBalance === 0;
    }
    return matchesSearch;
  });

  const getCustomerStats = () => {
    const totalCustomers = customers.length;
    const dueCustomers = customers.filter(c => c.pendingBalance > 0).length;
    const totalDueAmount = customers.reduce((sum, c) => sum + c.pendingBalance, 0);
    const totalOrders = customers.reduce((sum, c) => sum + (c.orderHistory?.length || 0), 0);

    return { totalCustomers, dueCustomers, totalDueAmount, totalOrders };
  };

  const stats = getCustomerStats();
  const dueOrderOptions = selectedCustomer?.orderHistory?.filter(order => (order.dueAmount || 0) > 0) || [];
  const maxSettleAmount = selectedOrder ? selectedOrder.dueAmount : selectedCustomer?.pendingBalance;

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-2">Loading customers...</span>
      </Container>
    );
  }

  return (
    <div className="customers-page">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
         <h2 className="mb-1 fw-bold">Customer Management</h2>
          <p className="text-muted mb-0">Manage customer information and billing records</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setShowCreateModal(true)}
          className="d-flex align-items-center gap-2"
        >
          <span className="fs-5">+</span> Add Customer
        </Button>
      </div>

      {/* Stats Cards */}
      <Row xs={1} md={2} xl={4} className="g-4 mb-4">
        <Col>
          <Card className="h-100 shadow-sm border-0 stat-card-bs">
            <Card.Body className="d-flex align-items-center">
              <div className="stat-icon-bs bg-primary-soft text-primary me-3">👥</div>
              <div>
                <small className="text-muted d-block">Total Customers</small>
                <h3 className="h4 mb-0">{stats.totalCustomers}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card className="h-100 shadow-sm border-0 stat-card-bs">
            <Card.Body className="d-flex align-items-center">
              <div className="stat-icon-bs bg-warning-soft text-warning me-3">⚠️</div>
              <div>
                <small className="text-muted d-block">Due Customers</small>
                <h3 className="h4 mb-0">{stats.dueCustomers}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card className="h-100 shadow-sm border-0 stat-card-bs">
            <Card.Body className="d-flex align-items-center">
              <div className="stat-icon-bs bg-success-soft text-success me-3">💰</div>
              <div>
                <small className="text-muted d-block">Total Due Amount</small>
                <h3 className="h4 mb-0">₹{stats.totalDueAmount.toLocaleString()}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card className="h-100 shadow-sm border-0 stat-card-bs">
            <Card.Body className="d-flex align-items-center">
              <div className="stat-icon-bs bg-info-soft text-info me-3">📋</div>
              <div>
                <small className="text-muted d-block">Total Orders</small>
                <h3 className="h4 mb-0">{stats.totalOrders}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Search and Filter */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body className="p-3">
          <Row className="g-3">
            <Col xs={12} md={8}>
              <InputGroup>
                <InputGroup.Text className="bg-white border-end-0">
                  🔍
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search by name or phone number..."
                  className="border-start-0 ps-0"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col xs={12} md={4}>
              <Form.Select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Customers</option>
                <option value="due">Due Pending</option>
                <option value="regular">Regular (No Due)</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Customers Grid */}
      <Row xs={1} md={2} xl={3} className="g-4">
        {filteredCustomers.map(customer => (
          <Col key={customer._id}>
            <Card 
              className="h-100 shadow-sm border-0 customer-card-bs"
              onClick={() => handleViewDetails(customer)}
            >
              <Card.Header className="bg-white border-0 pt-3 pb-0 d-flex justify-content-between align-items-start">
                <div>
                  <h3 className="h5 mb-1">{customer.name}</h3>
                  <div className="small text-muted mb-1">
                    <span className="me-2">📞 {customer.phone}</span>
                    {customer.email && <span>📧 {customer.email}</span>}
                  </div>
                </div>
                {customer.pendingBalance > 0 && (
                  <Badge bg="danger" className="p-2">
                    Due: ₹{customer.pendingBalance.toLocaleString()}
                  </Badge>
                )}
              </Card.Header>
              <Card.Body className="d-flex flex-column">
                <div className="d-flex gap-3 mb-3 bg-light p-2 rounded">
                  <div className="text-center flex-grow-1">
                    <small className="text-muted d-block">Orders</small>
                    <span className="fw-bold">{customer.orderHistory?.length || 0}</span>
                  </div>
                  <div className="border-start"></div>
                  <div className="text-center flex-grow-1">
                    <small className="text-muted d-block">Pending</small>
                    <span className={`fw-bold ${customer.pendingBalance > 0 ? 'text-danger' : 'text-success'}`}>
                      ₹{customer.pendingBalance.toLocaleString()}
                    </span>
                  </div>
                </div>

                {customer.address && (
                  <div className="small mb-2">
                    <span className="text-muted fw-bold me-1">Address:</span>
                    <span className="text-truncate d-inline-block w-100">{customer.address}</span>
                  </div>
                )}

                {customer.notes && (
                  <div className="small mb-3">
                    <span className="text-muted fw-bold me-1">Notes:</span>
                    <span className="text-muted fst-italic">{customer.notes}</span>
                  </div>
                )}

                <div className="mt-auto d-flex gap-2">
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    className="flex-grow-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(customer);
                    }}
                  >
                    View Details
                  </Button>
                  {customer.pendingBalance > 0 && (
                    <Button 
                      variant="primary" 
                      size="sm"
                      className="flex-grow-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenSettleModal(customer);
                      }}
                    >
                      Settle Due
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {filteredCustomers.length === 0 && (
        <Card className="border-0 shadow-sm mt-4 py-5">
          <Card.Body className="text-center">
            <div className="text-muted py-5 bg-light rounded border-2 border-dashed">
              <p className="mb-0">No customers found matching the criteria.</p>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Create Customer Modal */}
      <Modal 
        show={showCreateModal} 
        onHide={() => setShowCreateModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="">
          <Modal.Title className="h5 fw-bold">Add New Customer</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4">
          <Form onSubmit={handleCreateCustomer}>
            <Row className="g-3 mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Customer Name *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter customer name"
                    value={customerForm.name}
                    onChange={(e) => setCustomerForm({...customerForm, name: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Phone Number *</Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="Enter phone number"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({...customerForm, phone: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email address"
                value={customerForm.email}
                onChange={(e) => setCustomerForm({...customerForm, email: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Address</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter customer address"
                value={customerForm.address}
                onChange={(e) => setCustomerForm({...customerForm, address: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Enter any additional notes"
                value={customerForm.notes}
                onChange={(e) => setCustomerForm({...customerForm, notes: e.target.value})}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 px-4 pb-4">
          <Button variant="outline-secondary" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreateCustomer}>
            Create Customer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Customer Details Modal */}
      <Modal 
        show={showDetailsModal} 
        onHide={() => setShowDetailsModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="">
          <Modal.Title className="h5 fw-bold">Customer Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-4">
          {selectedCustomer && (
            <div className="customer-details-bs">
              <section className="mb-4">
                <h6 className="fw-bold border-bottom pb-2 mb-3">Personal Information</h6>
                <Row className="g-3">
                  <Col md={6}>
                    <small className="text-muted d-block">Name</small>
                    <span className="fw-bold">{selectedCustomer.name}</span>
                  </Col>
                  <Col md={6}>
                    <small className="text-muted d-block">Phone</small>
                    <span className="fw-bold">{selectedCustomer.phone}</span>
                  </Col>
                  {selectedCustomer.email && (
                    <Col md={6}>
                      <small className="text-muted d-block">Email</small>
                      <span className="fw-bold">{selectedCustomer.email}</span>
                    </Col>
                  )}
                  {selectedCustomer.address && (
                    <Col xs={12}>
                      <small className="text-muted d-block">Address</small>
                      <span className="fw-bold">{selectedCustomer.address}</span>
                    </Col>
                  )}
                </Row>
              </section>

              <section className="mb-4">
                <h6 className="fw-bold border-bottom pb-2 mb-3">Payment Information</h6>
                <Row className="g-3">
                  <Col md={6}>
                    <div className={`p-3 rounded ${selectedCustomer.pendingBalance > 0 ? 'bg-danger-soft' : 'bg-success-soft'}`}>
                      <small className="text-muted d-block">Pending Balance</small>
                      <span className={`h4 mb-0 fw-bold ${selectedCustomer.pendingBalance > 0 ? 'text-danger' : 'text-success'}`}>
                        ₹{selectedCustomer.pendingBalance.toLocaleString()}
                      </span>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="bg-info-soft p-3 rounded">
                      <small className="text-muted d-block">Advance Payment</small>
                      <span className="h4 mb-0 fw-bold text-info">
                        ₹{selectedCustomer.advancePayment?.toLocaleString() || 0}
                      </span>
                    </div>
                  </Col>
                </Row>
              </section>

              <section className="mb-4">
                <h6 className="fw-bold border-bottom pb-2 mb-3">Order History</h6>
                <div className="d-flex justify-content-between align-items-center bg-light p-3 rounded">
                  <span>Total Orders: <span className="fw-bold">{selectedCustomer.orderHistory?.length || 0}</span></span>
                </div>
                {detailsLoading ? (
                  <div className="d-flex align-items-center gap-2 text-muted mt-3">
                    <Spinner animation="border" size="sm" />
                    <span>Loading order history...</span>
                  </div>
                ) : selectedCustomer.orderHistory?.length ? (
                  <Table responsive className="mt-3 mb-0">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Order ID</th>
                        <th style={{ minWidth: '300px' }}>Items</th>
                        <th className="text-end">Subtotal</th>
                        <th className="text-end">Disc/Tax/SC</th>
                        <th className="text-end">Total</th>
                        <th className="text-end">Paid</th>
                        <th className="text-end">Due</th>
                        <th className="text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCustomer.orderHistory.map(order => (
                        <tr key={order._id}>
                          <td className="text-muted small">{new Date(order.createdAt).toLocaleDateString('en-GB')}</td>
                          <td className="fw-medium">#{order._id.slice(-6)}</td>
                          <td className="text-muted small">
                            {order.items?.length ? (
                              <div className="d-flex flex-column gap-1">
                                {order.items.map((item, index) => (
                                  <div key={item._id || `${order._id}-${index}`} className="d-flex align-items-center">
                                    <span className="fw-bold me-2" style={{ minWidth: '25px' }}>
                                      {item.quantity}×
                                    </span>
                                    <span className="text-dark text-wrap">{item.menuItem?.name || 'Item'}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td className="text-end text-muted small">₹{(order.subtotal || order.totalAmount || 0).toLocaleString()}</td>
                          <td className="text-end text-muted small">
                            <div className="d-flex flex-column align-items-end" style={{fontSize: '0.75rem'}}>
                              {order.discountAmount > 0 && <span className="text-danger">Disc: -₹{order.discountAmount.toLocaleString()}</span>}
                              {order.taxAmount > 0 && <span className="text-info">Tax: +₹{order.taxAmount.toLocaleString()}</span>}
                              {order.serviceChargeAmount > 0 && <span className="text-success">SC: +₹{order.serviceChargeAmount.toLocaleString()}</span>}
                              {(order.discountAmount === 0 && order.taxAmount === 0 && order.serviceChargeAmount === 0) && <span>-</span>}
                            </div>
                          </td>
                          <td className="text-end fw-bold">₹{(order.totalAmount || 0).toLocaleString()}</td>
                          <td className="text-end">₹{(order.paidAmount || 0).toLocaleString()}</td>
                          <td className="text-end text-danger">₹{(order.dueAmount || 0).toLocaleString()}</td>
                          <td className="text-center">
                            <Badge bg={order.paymentStatus === 'paid' ? 'success' : order.paymentStatus === 'partially_paid' ? 'warning' : 'danger'} className="rounded-pill px-3">
                              {order.paymentStatus}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <div className="text-muted mt-3">No orders found for this customer.</div>
                )}
              </section>

              {selectedCustomer.notes && (
                <section>
                  <h6 className="fw-bold border-bottom pb-2 mb-3">Notes</h6>
                  <p className="text-muted fst-italic bg-light p-3 rounded mb-0">
                    {selectedCustomer.notes}
                  </p>
                </section>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className=" px-4 pb-4">
          <Button variant="outline-secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
          {selectedCustomer?.pendingBalance > 0 && (
            <Button 
              variant="primary" 
              onClick={() => handleOpenSettleModal(selectedCustomer)}
            >
              Settle Due Payment
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Settle Due Modal */}
      <Modal 
        show={showSettleModal} 
        onHide={() => setShowSettleModal(false)}
        centered
      >
        <Modal.Header closeButton className="border-0 pt-4 px-4">
          <Modal.Title className="h5 fw-bold">Settle Due Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-4">
          {selectedCustomer && (
            <Form onSubmit={handleSettleDue}>
              <div className="mb-4">
                <h6 className="fw-bold border-bottom pb-2 mb-3">Customer Information</h6>
                <Row className="g-3">
                  <Col md={6}>
                    <small className="text-muted d-block">Name</small>
                    <span className="fw-bold">{selectedCustomer.name || 'Guest Customer'}</span>
                  </Col>
                  <Col md={6}>
                    <small className="text-muted d-block">Phone</small>
                    <span className="fw-bold">{selectedCustomer.phone || 'N/A'}</span>
                  </Col>
                  <Col xs={12}>
                    <small className="text-muted d-block">Pending Balance</small>
                    <span className="h4 mb-0 fw-bold text-danger">
                      ₹{selectedCustomer.pendingBalance.toLocaleString()}
                    </span>
                  </Col>
                </Row>
              </div>

              <h6 className="fw-bold border-bottom pb-2 mb-3">Settlement Details</h6>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold text-muted text-uppercase">Select Order</Form.Label>
                <Form.Select
                  value={selectedOrder?._id || ''}
                  onChange={(e) => {
                    const order = dueOrderOptions.find(item => item._id === e.target.value);
                    setSelectedOrder(order || null);
                    setSettleAmount(order?.dueAmount ? order.dueAmount.toString() : '');
                  }}
                  className="bg-light border-0 py-2 shadow-none"
                >
                  <option value="">Select order with due</option>
                  {dueOrderOptions.map(order => (
                    <option key={order._id} value={order._id}>
                      #{order._id.slice(-6)} • Due ₹{(order.dueAmount || 0).toLocaleString()}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold text-muted text-uppercase">Amount to Settle</Form.Label>
                <Form.Control 
                  type="number" 
                  placeholder="Enter amount"
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(e.target.value)}
                  required
                  min="0"
                max={maxSettleAmount ?? undefined}
                step="0.01"
                  className="bg-light border-0 py-2 shadow-none"
                />
                <Form.Text className="text-muted">
                  Maximum: ₹{(maxSettleAmount || 0).toLocaleString()}
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="small fw-bold text-muted text-uppercase">Payment Mode</Form.Label>
                <Form.Select 
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="bg-light border-0 py-2 shadow-none"
                >
                  <option value="cash">Cash</option>
                  <option value="online">Online Payment</option>
                  <option value="card">Card</option>
                </Form.Select>
              </Form.Group>

              <div className="d-grid">
                <Button 
                  type="submit" 
                  variant="primary" 
                  size="lg"
                  disabled={settleLoading}
                  className="fw-bold"
                >
                  {settleLoading ? 'Processing...' : 'Settle Payment'}
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Customers;
