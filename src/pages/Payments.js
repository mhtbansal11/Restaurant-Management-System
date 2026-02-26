import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import { Container, Row, Col, Card, Button, Form, Table, Badge, Modal, Spinner, } from 'react-bootstrap';
import toast from 'react-hot-toast';
import './Payments.css';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    period: 'today',
    paymentType: 'all',
    customerStatus: 'all',
    search: ''
  });
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [settleAmount, setSettleAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [settleLoading, setSettleLoading] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [stats, setStats] = useState({
    totalCash: 0,
    totalOnline: 0,
    totalDue: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filter.search);
    }, 500);
    return () => clearTimeout(timer);
  }, [filter.search]);

  const fetchPayments = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(config.ENDPOINTS.PAYMENTS, {
        params: {
          period: filter.period,
          paymentType: filter.paymentType,
          customerStatus: filter.customerStatus,
          search: debouncedSearch
        }
      });
      
      setPayments(response.data.payments || []);
      setStats(response.data.stats || {
        totalCash: 0,
        totalOnline: 0,
        totalDue: 0,
        totalRevenue: 0
      });
    } catch (error) {
      console.error('Error fetching payments:', error);
      // Fallback for safety
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [filter.period, filter.paymentType, filter.customerStatus, debouncedSearch]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(config.ENDPOINTS.CUSTOMERS);
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      await axios.post(config.ENDPOINTS.CUSTOMERS, newCustomer);
      setNewCustomer({ name: '', phone: '', email: '', address: '' });
      setShowCustomerModal(false);
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
      setSelectedCustomer(null);
      fetchPayments();
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

  const handleOpenOrderSettleModal = (order) => {
    setSelectedCustomer(null);
    setSelectedOrder(order);
    setSettleAmount(order?.dueAmount ? order.dueAmount.toString() : '');
    setShowSettleModal(true);
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

  const getPaymentTypeBadge = (type) => {
    switch (type) {
      case 'cash': return <Badge bg="success" className="text-uppercase">Cash</Badge>;
      case 'online': return <Badge bg="primary" className="text-uppercase">Online</Badge>;
      case 'card': return <Badge bg="info" className="text-uppercase">Card</Badge>;
      case 'due': return <Badge bg="danger" className="text-uppercase">Due</Badge>;
      case 'mixed': return <Badge bg="warning" className="text-uppercase text-dark">Mixed</Badge>;
      default: return <Badge bg="secondary" className="text-uppercase">{type}</Badge>;
    }
  };

  const getPeriodLabel = (period) => {
    switch (period) {
      case 'today': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'all': return 'All Time';
      default: return period;
    }
  };

  const getOrderTypeLabel = (order) => {
    if (order?.orderType === 'takeaway') return 'Takeaway';
    if (order?.orderType === 'packing') return 'Packing';
    if (order?.tableLabel) return `Table ${order.tableLabel}`;
    return 'Dine-in';
  };

  const getPaymentCustomerLabel = (payment) => {
    if (payment.customerName) return payment.customerName;
    return getOrderTypeLabel(payment);
  };

  const getCustomersWithDue = () => {
    return customers.filter(customer => customer.pendingBalance > 0);
  };

  const dueOrderOptions = selectedCustomer?.orderHistory?.filter(order => (order.dueAmount || 0) > 0) || [];
  const maxSettleAmount = selectedOrder ? selectedOrder.dueAmount : selectedCustomer?.pendingBalance;

  if (loading && payments.length === 0) {
    return (
      <Container className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner animation="border" variant="primary" />
        <span className="mt-3 text-muted">Loading payment data...</span>
      </Container>
    );
  }

  return (
    <Container fluid className="m-0 p-0">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="mb-1 fw-bold">Payment Tracking</h2>
          <p className="text-muted mb-0">Monitor and manage all payment transactions</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setShowCustomerModal(true)}
          className="d-flex align-items-center gap-2 shadow-sm px-4 py-2"
        >
          <span className="h5 mb-0">+</span> Add Customer
        </Button>
      </div>

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm h-100 overflow-hidden">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-success bg-opacity-10 p-3 rounded-3 text-success">
                  <span className="h4 mb-0">💵</span>
                </div>
                <div>
                  <h6 className="text-muted mb-1 text-uppercase small fw-bold">Cash</h6>
                  <h4 className="mb-0 fw-bold">₹{stats.totalCash.toLocaleString()}</h4>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm h-100 overflow-hidden">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-primary bg-opacity-10 p-3 rounded-3 text-primary">
                  <span className="h4 mb-0">💳</span>
                </div>
                <div>
                  <h6 className="text-muted mb-1 text-uppercase small fw-bold">Online</h6>
                  <h4 className="mb-0 fw-bold">₹{stats.totalOnline.toLocaleString()}</h4>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm h-100 overflow-hidden border-start border-danger border-4">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-danger bg-opacity-10 p-3 rounded-3 text-danger">
                  <span className="h4 mb-0">⚠️</span>
                </div>
                <div>
                  <h6 className="text-muted mb-1 text-uppercase small fw-bold">Due</h6>
                  <h4 className="mb-0 fw-bold">₹{stats.totalDue.toLocaleString()}</h4>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm h-100 overflow-hidden">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-info bg-opacity-10 p-3 rounded-3 text-info">
                  <span className="h4 mb-0">💰</span>
                </div>
                <div>
                  <h6 className="text-muted mb-1 text-uppercase small fw-bold">Revenue</h6>
                  <h4 className="mb-0 fw-bold">₹{stats.totalRevenue.toLocaleString()}</h4>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Search and Filters */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-4">
          <Row className="g-3 mb-4">
            <Col xs={12}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted text-uppercase mb-2">Search Payments</Form.Label>
                <div className="position-relative">
                  <Form.Control 
                    type="text" 
                    placeholder="Search by Order ID, Customer, Amount, Status, Payment Type or Date..."
                    value={filter.search}
                    onChange={(e) => setFilter({...filter, search: e.target.value})}
                    className="bg-light border-0 py-2 ps-5 pe-5 shadow-none"
                  />
                  <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted">
                    {loading && filter.search ? (
                      <Spinner animation="border" size="sm" variant="primary" />
                    ) : (
                      '🔍'
                    )}
                  </span>
                  {filter.search && (
                    <button 
                      className="btn btn-link position-absolute top-50 end-0 translate-middle-y me-2 text-muted p-0 text-decoration-none"
                      onClick={() => setFilter({...filter, search: ''})}
                      style={{ fontSize: '1.2rem' }}
                    >
                      &times;
                    </button>
                  )}
                </div>
              </Form.Group>
            </Col>
          </Row>
          <Row className="g-3 align-items-end">
            <Col xs={12} md={4}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted text-uppercase mb-2">Period</Form.Label>
                <Form.Select 
                  value={filter.period} 
                  onChange={(e) => setFilter({...filter, period: e.target.value})}
                  className="bg-light border-0 py-2 shadow-none"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="all">All Time</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col xs={12} md={4}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted text-uppercase mb-2">Payment Type</Form.Label>
                <Form.Select 
                  value={filter.paymentType} 
                  onChange={(e) => setFilter({...filter, paymentType: e.target.value})}
                  className="bg-light border-0 py-2 shadow-none"
                >
                  <option value="all">All Types</option>
                  <option value="cash">Cash</option>
                  <option value="online">Online</option>
                  <option value="card">Card</option>
                  <option value="due">Due</option>
                  <option value="mixed">Mixed</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col xs={12} md={4}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted text-uppercase mb-2">Customer Status</Form.Label>
                <Form.Select 
                  value={filter.customerStatus} 
                  onChange={(e) => setFilter({...filter, customerStatus: e.target.value})}
                  className="bg-light border-0 py-2 shadow-none"
                >
                  <option value="all">All Customers</option>
                  <option value="due">Due Pending</option>
                  <option value="paid">Fully Paid</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Customers with Due Payments */}
      {getCustomersWithDue().length > 0 && (
        <Card className="border-0 shadow-sm mb-4 border-start border-warning border-4">
          <Card.Header className="bg-white border-0 pt-4 px-4 d-flex align-items-center gap-2">
            <span className="text-warning h5 mb-0">⚠️</span>
            <h5 className="mb-0 fw-bold">Customers with Due Payments</h5>
          </Card.Header>
          <Card.Body className="p-4">
            <Row className="g-3">
              {getCustomersWithDue().map(customer => (
                <Col key={customer._id} xs={12} md={4}>
                  <Card 
                    className="border border-warning border-opacity-25 bg-light h-100 customer-card-clickable"
                    onClick={() => handleViewDetails(customer)}
                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    <Card.Body className="p-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <h6 className="mb-0 fw-bold">{customer.name}</h6>
                          <small className="text-muted">{customer.phone}</small>
                        </div>
                        <Badge bg="danger" className="rounded-pill">₹{customer.pendingBalance.toLocaleString()}</Badge>
                      </div>
                      <div className="d-grid mt-3">
                        <Button 
                          variant="outline-warning" 
                          size="sm" 
                          className="fw-bold"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(customer);
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Payments Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <Card.Header className="bg-white border-0 pt-4 px-4">
          <h5 className="mb-0 fw-bold">Payment Records - {getPeriodLabel(filter.period)}</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th className="px-4 py-3 border-0">Date</th>
                <th className="py-3 border-0">Order ID</th>
                <th className="py-3 border-0">Customer</th>
                <th className="py-3 border-0 text-end">Amount</th>
                <th className="py-3 border-0 text-center">Payment Type</th>
                <th className="py-3 border-0 text-center">Status</th>
                <th className="py-3 border-0 text-end">Due Amount</th>
                <th className="px-4 py-3 border-0 text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">No payment records found for this period.</td>
                </tr>
              ) : (
                payments.map(payment => (
                  <tr key={payment._id}>
                    <td className="px-4 py-3 border-bottom-0 small text-muted">
                      {new Date(payment.createdAt).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-3 border-bottom-0">
                      <code className="text-primary small fw-bold">#{payment.orderId?.slice(-6) || 'N/A'}</code>
                    </td>
                    <td className="py-3 border-bottom-0">
                      <div className="d-flex flex-column">
                        <span className="fw-medium">{getPaymentCustomerLabel(payment)}</span>
                        {payment.customerPhone && <small className="text-muted small">{payment.customerPhone}</small>}
                      </div>
                    </td>
                    <td className="py-3 border-bottom-0 text-end fw-bold">₹{(payment.totalAmount || 0).toLocaleString()}</td>
                    <td className="py-3 border-bottom-0 text-center">
                      {getPaymentTypeBadge(payment.paymentMode)}
                    </td>
                    <td className="py-3 border-bottom-0 text-center">
                      <Badge bg={payment.paymentStatus === 'paid' ? 'success' : payment.paymentStatus === 'partially_paid' ? 'warning' : 'danger'} className="rounded-pill px-3">
                        {payment.paymentStatus}
                      </Badge>
                    </td>
                    <td className="py-3 border-bottom-0 text-end text-danger fw-bold">
                      {payment.dueAmount > 0 ? `₹${payment.dueAmount.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-4 py-3 border-bottom-0 text-end">
                      {payment.dueAmount > 0 ? (
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="fw-bold"
                          onClick={() => handleOpenOrderSettleModal(payment)}
                        >
                          Settle Due
                        </Button>
                      ) : (
                        <span className="text-muted small">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

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
        <Modal.Footer className="border-0 px-4 pb-4">
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
        <Modal.Header closeButton className=" pt-4 px-4">
          <Modal.Title className="h5 fw-bold">Settle Due Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-4">
          {(selectedOrder || selectedCustomer) && (
            <Form onSubmit={handleSettleDue}>
              {selectedCustomer && (
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
              )}

              {selectedOrder ? (
                <div className="mb-4">
                  <h6 className="fw-bold border-bottom pb-2 mb-3">Order Information</h6>
                  <Row className="g-3">
                    <Col md={6}>
                      <small className="text-muted d-block">Order</small>
                      <span className="fw-bold">#{selectedOrder.orderId?.slice(-6) || selectedOrder._id?.slice(-6)}</span>
                    </Col>
                    <Col md={6}>
                      <small className="text-muted d-block">Type</small>
                      <span className="fw-bold">{getOrderTypeLabel(selectedOrder)}</span>
                    </Col>
                    <Col md={6}>
                      <small className="text-muted d-block">Customer</small>
                      <span className="fw-bold">{selectedCustomer?.name || getPaymentCustomerLabel(selectedOrder)}</span>
                    </Col>
                    <Col md={6}>
                      <small className="text-muted d-block">Phone</small>
                      <span className="fw-bold">{selectedCustomer?.phone || selectedOrder.customerPhone || 'N/A'}</span>
                    </Col>
                    <Col md={6}>
                      <small className="text-muted d-block">Total Amount</small>
                      <span className="fw-bold">₹{(selectedOrder.totalAmount || 0).toLocaleString()}</span>
                    </Col>
                    <Col md={6}>
                      <small className="text-muted d-block">Due Amount</small>
                      <span className="fw-bold text-danger">₹{(selectedOrder.dueAmount || 0).toLocaleString()}</span>
                    </Col>
                  </Row>
                </div>
              ) : (
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
              )}

              <h6 className="fw-bold border-bottom pb-2 mb-3">Settlement Details</h6>
              
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

      {/* Customer Modal */}
      <Modal 
        show={showCustomerModal} 
        onHide={() => setShowCustomerModal(false)}
        centered
        className="customer-modal-bs"
      >
        <Modal.Header closeButton className="border-0 pt-4 px-4">
          <Modal.Title className="fw-bold">Add New Customer</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleCreateCustomer}>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-muted text-uppercase">Full Name</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Enter customer name"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                required
                className="bg-light border-0 py-2 shadow-none"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-muted text-uppercase">Phone Number</Form.Label>
              <Form.Control 
                type="tel" 
                placeholder="Enter phone number"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                required
                className="bg-light border-0 py-2 shadow-none"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-muted text-uppercase">Email Address</Form.Label>
              <Form.Control 
                type="email" 
                placeholder="Enter email address"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                className="bg-light border-0 py-2 shadow-none"
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="small fw-bold text-muted text-uppercase">Address</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                placeholder="Enter customer address"
                value={newCustomer.address}
                onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                className="bg-light border-0 py-2 shadow-none"
              />
            </Form.Group>
            <div className="d-grid">
              <Button variant="primary" type="submit" className="py-2 fw-bold shadow-sm">
                Create Customer
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Payments;
