import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import config from '../config';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Form, 
  Badge, 
  Modal, 
  InputGroup,
  Spinner,
} from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../components/ConfirmModal';
import './Orders.css';

const Orders = () => {
  const { user } = useAuth();
  const [allOrders, setAllOrders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [orderForm, setOrderForm] = useState({
    tableId: '',
    customerName: '',
    customerPhone: '',
    customerCount: 0,
    items: [],
    orderType: 'dine-in',
    floor: 'All'
  });
  const [customerResults, setCustomerResults] = useState([]);
  const [menuSearch, setMenuSearch] = useState('');
  const [menuFilterCategory, setMenuFilterCategory] = useState('All');
  const [categories, setCategories] = useState([]);
  const [floors, setFloors] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterOrderType, setFilterOrderType] = useState('All');
  const [orderSearch, setOrderSearch] = useState('');
  const [searchParams] = useSearchParams();
  const tableFilter = searchParams.get('table');

  const fetchOrders = useCallback(async () => {
    try {
      const url = tableFilter 
        ? `${config.ENDPOINTS.ORDERS}?tableId=${tableFilter}`
        : config.ENDPOINTS.ORDERS;
      const response = await axios.get(url);
      const fetchedOrders = response.data;
      setAllOrders(fetchedOrders);
      
      let filtered = [...fetchedOrders];
      
      if (filterStatus !== 'All') {
        if (filterStatus === 'active') {
          filtered = filtered.filter(order => !['completed', 'cancelled'].includes(order.status));
        } else {
          filtered = filtered.filter(order => order.status === filterStatus);
        }
      }
      if (filterOrderType !== 'All') {
        filtered = filtered.filter(order => order.orderType === filterOrderType);
      }
      
      if (orderSearch.trim() !== '') {
        const searchLower = orderSearch.toLowerCase();
        filtered = filtered.filter(order => {
          const matchesCustomerName = order.customerName?.toLowerCase().includes(searchLower);
          const matchesCustomerPhone = order.customerPhone?.toLowerCase().includes(searchLower);
          const matchesOrderId = order._id.toLowerCase().includes(searchLower);
          const matchesTable = (order.tableLabel || order.tableId?.label || order.tableId?.tableId || '').toString().toLowerCase().includes(searchLower);
          const matchesMenuItems = order.items.some(item => 
            (item.name || item.menuItem?.name || '').toLowerCase().includes(searchLower)
          );
          
          return matchesCustomerName || matchesCustomerPhone || matchesOrderId || matchesTable || matchesMenuItems;
        });
      }

      setOrders(filtered);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [tableFilter, filterStatus, filterOrderType, orderSearch]);

  useEffect(() => {
    fetchOrders();
    fetchMenuItems();
    fetchTables();
  }, [fetchOrders]);

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get(config.ENDPOINTS.MENU);
      const items = response.data.filter(item => item.isAvailable);
      setMenuItems(items);
      const uniqueCategories = ['All', ...new Set(items.map(item => item.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const fetchTables = async () => {
    try {
      const [tablesRes, layoutRes] = await Promise.all([
        axios.get(config.ENDPOINTS.TABLES),
        axios.get(config.ENDPOINTS.SEATING_LAYOUT)
      ]);
      
      const tablesData = tablesRes.data;
      const layoutData = layoutRes.data;

      // Extract all tables from all floors in layout
      const layoutTables = layoutData.floors?.reduce((acc, floor) => {
        return [...acc, ...floor.tables.map(t => ({ ...t, floorName: floor.name }))];
      }, []) || [];

      // Merge labels and floor into tables data
      const mergedTables = tablesData.map(table => {
        const layoutTable = layoutTables.find(lt => lt.id === table.tableId);
        return {
          ...table,
          label: layoutTable?.label || table.tableId,
          floor: layoutTable?.floorName || 'Ground Floor'
        };
      });

      setTables(mergedTables);
      const uniqueFloors = ['All', ...new Set(mergedTables.map(table => table.floor || 'Ground Floor'))];
      setFloors(uniqueFloors);
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  const searchCustomers = async (query) => {
    if (query.length < 3) {
      setCustomerResults([]);
      return;
    }
    try {
      const response = await axios.get(`${config.ENDPOINTS.CUSTOMERS}?search=${query}`);
      setCustomerResults(response.data);
    } catch (error) {
      console.error('Error searching customers:', error);
    }
  };

  const handleCustomerSelect = (customer) => {
    setOrderForm({
      ...orderForm,
      customerName: customer.name,
      customerPhone: customer.phone
    });
    setCustomerResults([]);
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      const items = orderForm.items.filter(item => item.quantity > 0);
      if (items.length === 0) {
        toast.error('Please add at least one item to the order');
        return;
      }

      // Find the selected table label
      const selectedTable = tables.find(t => t.tableId === orderForm.tableId);

      await axios.post(config.ENDPOINTS.ORDERS, {
        ...orderForm,
        tableLabel: selectedTable?.label || selectedTable?.tableId || orderForm.tableId
      });
      setShowCreateModal(false);
      setOrderForm({
        tableId: '',
        customerName: '',
        customerPhone: '',
        customerCount: 0,
        items: [],
        orderType: 'dine-in',
        floor: 'All'
      });
      fetchOrders();
      fetchTables();
      toast.success('Order created successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create order');
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${config.ENDPOINTS.ORDERS}/${orderId}/status`, { status: newStatus });
      fetchOrders();
      fetchTables();
      toast.success(`Order ${newStatus} successfully`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleAddItem = (menuItem) => {
    const existingItem = orderForm.items.find(item => item.menuItem === menuItem._id);
    if (existingItem) {
      setOrderForm({
        ...orderForm,
        items: orderForm.items.map(item =>
          item.menuItem === menuItem._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      });
    } else {
      setOrderForm({
        ...orderForm,
        items: [
          ...orderForm.items,
          {
            menuItem: menuItem._id,
            quantity: 1,
            price: menuItem.price,
            notes: ''
          }
        ]
      });
    }
  };

  const handleRemoveItem = (menuItemId) => {
    setOrderForm({
      ...orderForm,
      items: orderForm.items.filter(item => item.menuItem !== menuItemId)
    });
  };

  const handleUpdateQuantity = (menuItemId, quantity) => {
    if (quantity <= 0) {
      handleRemoveItem(menuItemId);
      return;
    }
    setOrderForm({
      ...orderForm,
      items: orderForm.items.map(item =>
        item.menuItem === menuItemId
          ? { ...item, quantity }
          : item
      )
    });
  };

  const getOrderTotal = () => {
    return orderForm.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'preparing': return 'info';
      case 'ready': return 'primary';
      case 'served': return 'success';
      case 'completed': return 'dark';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  const getStatusProgress = (status) => {
    switch (status) {
      case 'pending': return 20;
      case 'preparing': return 40;
      case 'ready': return 60;
      case 'served': return 80;
      case 'completed': return 100;
      default: return 0;
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <Spinner animation="grow" variant="primary" />
          <p className="mt-3 text-muted fw-bold">Loading your orders...</p>
        </div>
      </Container>
    );
  }

  const activeOrdersCount = allOrders.filter(o => !['completed', 'cancelled'].includes(o.status)).length;
  const pendingOrdersCount = allOrders.filter(o => o.status === 'pending').length;
  const preparingOrdersCount = allOrders.filter(o => o.status === 'preparing').length;
  const readyOrdersCount = allOrders.filter(o => o.status === 'ready').length;
  const servedOrdersCount = allOrders.filter(o => o.status === 'served').length;
  const completedOrdersCount = allOrders.filter(o => o.status === 'completed').length;
  const cancelledOrdersCount = allOrders.filter(o => o.status === 'cancelled').length;

  return (
    <div className="orders-page-container">
      {/* Header Section */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-3 bg-white p-3 rounded-4 shadow-sm">
        <div className="flex-grow-1">
          <h1 className="h3 mb-2 fw-bold text-dark">Live Orders</h1>
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-2 border">
              {activeOrdersCount} Active
            </span>
            <span className="badge bg-warning-subtle text-warning rounded-pill px-3 py-2 border">
              {pendingOrdersCount} Pending
            </span>
            <span className="badge bg-info-subtle text-info rounded-pill px-3 py-2 border">
              {preparingOrdersCount} Preparing
            </span>
            <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-2 border" style={{backgroundColor: '#e7f1ff', color: '#0d6efd'}}>
              {readyOrdersCount} Ready
            </span>
            <span className="badge bg-success-subtle text-success rounded-pill px-3 py-2 border">
              {servedOrdersCount} Served
            </span>
            <span className="badge bg-dark-subtle text-dark rounded-pill px-3 py-2 border">
              {completedOrdersCount} Completed
            </span>
            <span className="badge bg-danger-subtle text-danger rounded-pill px-3 py-2 border">
              {cancelledOrdersCount} Cancelled
            </span>
          </div>
        </div>
        
        <div>
          {['superadmin', 'owner', 'manager', 'cashier', 'receptionist', 'waiter'].includes(user?.role) && (
            <Button 
              onClick={() => setShowCreateModal(true)} 
              variant="primary" 
              size="sm" 
              className="rounded-pill px-4 shadow-sm fw-bold"
            >
              + New Order
            </Button>
          )}
        </div>
      </div>

      {/* Filters & Search Section */}
      <div className="bg-white p-3 rounded-4 shadow-sm mb-4">
        <Row className="align-items-center g-3">
          <Col md={4}>
            <div className="position-relative">
              <Form.Control
                type="text"
                placeholder="Search by ID, Customer, Phone, Menu or Table..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="border-0 bg-light rounded-pill px-4 py-2 shadow-none w-100"
                size="sm"
              />
              {orderSearch && (
                <button 
                  className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted p-2 me-2 text-decoration-none"
                  onClick={() => setOrderSearch('')}
                >
                  ✕
                </button>
              )}
            </div>
          </Col>
          <Col md={8}>
            <div className="d-flex flex-wrap gap-2 justify-content-md-end">
              {tableFilter && (
                <Button 
                  as={Link} 
                  to="/orders" 
                  variant="light" 
                  size="sm"
                  className="rounded-pill px-3 border"
                >
                  Clear Table: {tables.find(t => t.tableId === tableFilter)?.label || tableFilter}
                </Button>
              )}
              <div className="d-flex align-items-center gap-2">
                <span className="small text-muted fw-bold me-1">Type:</span>
                <Form.Select 
                  value={filterOrderType} 
                  onChange={(e) => setFilterOrderType(e.target.value)}
                  className="w-auto border-0 bg-light rounded-pill px-4 shadow-none"
                  size="sm"
                >
                  <option value="All">All Types</option>
                  <option value="dine-in">Dine-in</option>
                  <option value="takeaway">Takeaway</option>
                  <option value="packing">Packing</option>
                </Form.Select>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="small text-muted fw-bold me-1">Status:</span>
                <Form.Select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-auto border-0 bg-light rounded-pill px-4 shadow-none"
                  size="sm"
                >
                  <option value="All">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="served">Served</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Form.Select>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Orders Grid */}
      <Row xs={1} md={2} lg={3} xl={4} className="g-4">
        {orders.length === 0 ? (
          <Col xs={12}>
            <div className="text-center py-5 bg-white rounded-4 border-2 border-dashed">
              <div className="display-1 text-light mb-3">📋</div>
              <h4 className="text-muted">No orders found</h4>
              <p className="text-muted small">Try adjusting your filters or create a new order</p>
            </div>
          </Col>
        ) : (
          orders.map(order => (
            <Col key={order._id}>
              <Card className={`order-card-v3 h-100 border-0 shadow-sm rounded-4 status-${order.status}`}>
                <Card.Body className="p-0 d-flex flex-column">
                  {/* Card Header with Status and Table */}
                  <div className={`status-strip bg-${getStatusBadgeClass(order.status)}`}></div>
                  <div className="p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                          {order.orderType === 'takeaway' ? '🥡 Takeaway' : 
                           order.orderType === 'packing' ? '📦 Packing' : 
                           `Table ${order.tableId?.label || order.tableLabel || 'N/A'}`}
                        </h5>
                        <small className="text-muted d-block mt-1">
                          #{order._id.slice(-6)} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </small>
                      </div>
                      <Badge 
                        bg={`${getStatusBadgeClass(order.status)}-subtle`} 
                        text={getStatusBadgeClass(order.status)}
                        className="rounded-pill px-3 py-2 text-uppercase border" 
                        style={{fontSize: '0.65rem'}}
                      >
                        {order.status}
                      </Badge>
                    </div>

                    {/* Customer Info Mini-Tag */}
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <div className="customer-avatar-sm bg-light rounded-circle text-primary fw-bold d-flex align-items-center justify-content-center" style={{width: '24px', height: '24px', fontSize: '0.7rem'}}>
                        {(order.customerName || (order.orderType === 'takeaway' ? 'T' : order.orderType === 'packing' ? 'P' : 'D'))[0].toUpperCase()}
                      </div>
                      <span className="small text-dark fw-medium text-truncate" style={{maxWidth: '120px'}}>
                        {order.customerName || (order.orderType === 'takeaway' ? 'Takeaway' : order.orderType === 'packing' ? 'Packing' : 'Dine-in')}
                      </span>
                      {order.customerPhone && (
                        <span className="small text-muted border-start ps-2">{order.customerPhone.slice(-4)}</span>
                      )}
                    </div>

                    {/* Items List */}
                    <div className="items-container bg-light rounded-3 p-2 mb-3" style={{minHeight: '80px'}}>
                      {order.items.slice(0, 3).map((item, i) => (
                        <div key={i} className="d-flex justify-content-between align-items-center mb-1 small">
                          <span className={`text-truncate ${item.status === 'cancelled' ? 'text-decoration-line-through text-muted' : ''}`} style={{maxWidth: '80%'}}>
                            <span className="fw-bold text-secondary me-1">{item.quantity}x</span> 
                            {item.name || item.menuItem?.name}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="text-center mt-1 border-top pt-1">
                          <small className="text-muted fw-bold">+{order.items.length - 3} more items</small>
                        </div>
                      )}
                    </div>

                    {/* Progress & Amount */}
                    <div className="d-flex justify-content-between align-items-center mt-auto">
                      <div className="flex-grow-1 me-3">
                        {!['completed', 'cancelled'].includes(order.status) && (
                          <div className="progress" style={{height: '6px', borderRadius: '10px'}}>
                            <div 
                              className={`progress-bar bg-${getStatusBadgeClass(order.status)} progress-bar-striped progress-bar-animated`} 
                              role="progressbar" 
                              style={{width: `${getStatusProgress(order.status)}%`}}
                            ></div>
                          </div>
                        )}
                        {order.status === 'completed' && (
                          <div className="d-flex flex-column align-items-start">
                            <span className="text-success small fw-bold">✓ Fully Served</span>
                            {order.paymentStatus === 'paid' ? (
                              <Badge bg="success-subtle" text="success" className="rounded-pill px-2 mt-1 border" style={{fontSize: '0.6rem'}}>
                                PAID: {order.paymentMode?.toUpperCase() || 'CASH'}
                              </Badge>
                            ) : order.paymentMode === 'due' || order.dueAmount > 0 ? (
                              <Badge bg="danger-subtle" text="danger" className="rounded-pill px-2 mt-1 border" style={{fontSize: '0.6rem'}}>
                                DUE: ₹{order.dueAmount?.toLocaleString()}
                              </Badge>
                            ) : (
                              <Badge bg="warning-subtle" text="warning" className="rounded-pill px-2 mt-1 border" style={{fontSize: '0.6rem'}}>
                                {order.paymentStatus?.toUpperCase()}: {order.paymentMode?.toUpperCase()}
                              </Badge>
                            )}
                          </div>
                        )}
                        {order.status === 'cancelled' && <span className="text-danger small fw-bold">✕ Order Cancelled</span>}
                      </div>
                      <div className="text-end">
                        <div className="fw-bold text-dark">₹{order.totalAmount.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="card-action-footer border-top p-2 bg-white rounded-bottom-4">
                    <div className="d-flex flex-column gap-2">
                      <div className="d-flex gap-2">
                        {order.status !== 'cancelled' && (
                          <Button 
                            as={Link}
                            to={`/pos?tableId=${order.tableId?._id || order.tableId}&orderId=${order._id}&type=${order.orderType || 'dine-in'}&tableLabel=${order.tableLabel}`}
                            variant="light"
                            className="flex-grow-1 rounded-3 py-2 border small fw-bold"
                          >
                            VIEW
                          </Button>
                        )}
                        
                        {(order.status === 'pending' || order.status === 'active') && (
                          <Button 
                            variant="primary" 
                            className="flex-grow-1 rounded-3 py-2 fw-bold shadow-sm small"
                            onClick={() => handleUpdateStatus(order._id, 'preparing')}
                          >
                            PREPARE
                          </Button>
                        )}
                        {order.status === 'preparing' && (
                          <Button 
                            variant="info" 
                            className="flex-grow-1 rounded-3 py-2 fw-bold text-white shadow-sm small"
                            onClick={() => handleUpdateStatus(order._id, 'ready')}
                          >
                            READY
                          </Button>
                        )}
                        {order.status === 'ready' && (
                          <Button 
                            variant="success" 
                            className="flex-grow-1 rounded-3 py-2 fw-bold shadow-sm small"
                            onClick={() => handleUpdateStatus(order._id, 'served')}
                          >
                            SERVE
                          </Button>
                        )}
                        {order.status === 'served' && (
                          <Button 
                            variant="dark" 
                            className="flex-grow-1 rounded-3 py-2 fw-bold shadow-sm small"
                            onClick={() => handleUpdateStatus(order._id, 'completed')}
                          >
                            COMPLETE
                          </Button>
                        )}
                      </div>
                      {order.status !== 'cancelled' && order.status !== 'completed' && (
                        <Button 
                          variant="link" 
                          className="w-100 text-danger text-decoration-none mt-1 py-0 small fw-bold"
                          onClick={() => {
                            setOrderToCancel(order._id);
                            setShowConfirmModal(true);
                          }}
                        >
                          Cancel Order
                        </Button>
                      )}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      <ConfirmModal
        show={showConfirmModal}
        onHide={() => {
          setShowConfirmModal(false);
          setOrderToCancel(null);
        }}
        onConfirm={() => {
          if (orderToCancel) {
            handleUpdateStatus(orderToCancel, 'cancelled');
          }
        }}
        title="Cancel Order"
        message="Are you sure you want to cancel this order?"
        confirmText="Cancel Order"
      />

      {/* Create Order Modal */}
      <Modal 
        show={showCreateModal} 
        onHide={() => setShowCreateModal(false)} 
        size="lg" 
        centered 
        scrollable 
        className="create-order-modal"
      >
        <Modal.Header closeButton className=" bg-white pt-4 px-4">
          <div>
            <Modal.Title className="h4 fw-bold text-dark">Create New Order</Modal.Title>
            <p className="text-muted small mb-0">Select table and items to place a new order</p>
          </div>
        </Modal.Header>
        <Modal.Body className="px-4 pb-4">
          <Form onSubmit={handleCreateOrder}>
            <div className="form-section mb-4 p-3 rounded-4 bg-light">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0 text-primary">Order Type</h6>
                <div className="btn-group btn-group-sm rounded-pill overflow-hidden shadow-sm">
                  <Button 
                    variant={orderForm.orderType === 'dine-in' ? 'primary' : 'outline-primary'}
                    onClick={() => setOrderForm({ ...orderForm, orderType: 'dine-in' })}
                  >
                    🍽️ Dine-in
                  </Button>
                  <Button 
                    variant={orderForm.orderType === 'takeaway' ? 'primary' : 'outline-primary'}
                    onClick={() => setOrderForm({ ...orderForm, orderType: 'takeaway', tableId: '', floor: 'All' })}
                  >
                    🥡 Takeaway
                  </Button>
                  <Button 
                    variant={orderForm.orderType === 'packing' ? 'primary' : 'outline-primary'}
                    onClick={() => setOrderForm({ ...orderForm, orderType: 'packing', tableId: '', floor: 'All' })}
                  >
                    📦 Packing
                  </Button>
                </div>
              </div>

              <Row>
                {orderForm.orderType === 'dine-in' && (
                  <>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold">Floor</Form.Label>
                        <Form.Select
                          value={orderForm.floor}
                          onChange={(e) => setOrderForm({ ...orderForm, floor: e.target.value, tableId: '' })}
                          className="rounded-3 border-0 shadow-sm"
                        >
                          {floors.map(floor => (
                            <option key={floor} value={floor}>{floor}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold">Table *</Form.Label>
                        <Form.Select
                          value={orderForm.tableId}
                          onChange={(e) => setOrderForm({ ...orderForm, tableId: e.target.value })}
                          required
                          className="rounded-3 border-0 shadow-sm"
                        >
                          <option value="">Select Table</option>
                          {tables
                            .filter(t => (orderForm.floor === 'All' || (t.floor || 'Ground Floor') === orderForm.floor) && t.status === 'available')
                            .map(table => (
                              <option key={table._id} value={table.tableId}>
                                {orderForm.floor === 'All' ? `${table.floor} - ` : ''}{table.label} ({table.capacity} seats)
                              </option>
                            ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </>
                )}
                <Col md={6}>
                  <Form.Group className="mb-3 position-relative">
                    <Form.Label className="small fw-bold">Customer Phone</Form.Label>
                    <Form.Control
                      type="tel"
                      value={orderForm.customerPhone}
                      onChange={(e) => {
                        setOrderForm({ ...orderForm, customerPhone: e.target.value });
                        searchCustomers(e.target.value);
                      }}
                      placeholder="Search by phone..."
                      className="rounded-3 border-0 shadow-sm"
                    />
                    {customerResults.length > 0 && (
                      <div className="customer-search-results position-absolute w-100 shadow rounded-3 mt-1 bg-white z-index-modal overflow-hidden border">
                        {customerResults.map(customer => (
                          <div 
                            key={customer._id} 
                            className="p-2 border-bottom cursor-pointer hover-bg-light small"
                            onClick={() => handleCustomerSelect(customer)}
                          >
                            <strong>{customer.name}</strong> - {customer.phone}
                          </div>
                        ))}
                      </div>
                    )}
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold">Customer Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={orderForm.customerName}
                      onChange={(e) => setOrderForm({ ...orderForm, customerName: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="rounded-3 border-0 shadow-sm"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>
            
            <div className="menu-selection-section mb-4">
              <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
                <h6 className="fw-bold mb-0 text-primary">Menu Selection</h6>
                <div className="d-flex gap-2">
                  <Form.Control 
                    size="sm"
                    placeholder="Search menu..."
                    className="rounded-pill px-3 border-0 shadow-sm"
                    style={{ width: '150px' }}
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                  />
                  <Form.Select 
                    size="sm"
                    className="rounded-pill border-0 shadow-sm"
                    style={{ width: '120px' }}
                    value={menuFilterCategory}
                    onChange={(e) => setMenuFilterCategory(e.target.value)}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </Form.Select>
                </div>
              </div>
              
              <div className="menu-grid p-2 rounded-4 bg-light" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <Row xs={1} md={1} lg={2} className="g-3">
                  {menuItems
                    .filter(item => 
                      (menuFilterCategory === 'All' || item.category === menuFilterCategory) &&
                      (item.name.toLowerCase().includes(menuSearch.toLowerCase()))
                    )
                    .map(item => {
                    const orderItem = orderForm.items.find(i => i.menuItem === item._id);
                    return (
                      <Col key={item._id}>
                        <Card className="h-100 border-0 shadow-sm rounded-3 menu-item-card overflow-hidden">
                          <Card.Body className="p-2 d-flex justify-content-between align-items-center">
                            <div className="flex-grow-1 me-2 text-truncate">
                              <div className="fw-bold small text-dark text-truncate" title={item.name}>{item.name}</div>
                              <div className="text-primary fw-bold" style={{fontSize: '0.8rem'}}>₹{item.price.toFixed(0)}</div>
                            </div>
                            <div className="action-area flex-shrink-0">
                              {orderItem ? (
                                <InputGroup size="sm" className="quantity-selector-v2 shadow-sm rounded-pill overflow-hidden">
                                  <Button 
                                    variant="primary" 
                                    className="border-0 px-2 py-0"
                                    onClick={() => handleUpdateQuantity(item._id, orderItem.quantity - 1)}
                                  >
                                    -
                                  </Button>
                                  <Form.Control 
                                    className="text-center bg-white border-0 fw-bold px-0" 
                                    style={{width: '30px', fontSize: '0.8rem'}}
                                    readOnly 
                                    value={orderItem.quantity} 
                                  />
                                  <Button 
                                    variant="primary" 
                                    className="border-0 px-2 py-0"
                                    onClick={() => handleAddItem(item)}
                                  >
                                    +
                                  </Button>
                                </InputGroup>
                              ) : (
                                <Button 
                                  variant="outline-primary" 
                                  size="sm" 
                                  className="rounded-pill px-3 py-1 fw-bold small"
                                  onClick={() => handleAddItem(item)}
                                >
                                  ADD
                                </Button>
                              )}
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              </div>
            </div>

            {orderForm.items.length > 0 && (
              <div className="order-summary-section p-3 rounded-4 bg-white border border-primary-subtle shadow-sm mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0">Order Summary</h6>
                  <span className="text-muted small">
                    {orderForm.orderType === 'takeaway' ? '🥡 Takeaway' : 
                     orderForm.orderType === 'packing' ? '📦 Packing' : 
                     `Table ${orderForm.tableId || 'Not Selected'}`}
                  </span>
                </div>
                <div className="summary-list mb-3" style={{maxHeight: '150px', overflowY: 'auto'}}>
                  {orderForm.items.map((item, index) => {
                    const menuItem = menuItems.find(m => m._id === item.menuItem);
                    return (
                      <div key={index} className="d-flex justify-content-between align-items-center mb-2 small py-1 border-bottom-dashed">
                        <span>
                          <span className="fw-bold text-primary me-2">{item.quantity}x</span>
                          {menuItem?.name}
                        </span>
                        <span className="fw-bold">₹{(item.price * item.quantity).toFixed(0)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="d-flex justify-content-between align-items-center pt-2 mt-2 border-top border-2">
                  <span className="h6 fw-bold mb-0">Total Amount</span>
                  <span className="h5 fw-bold text-primary mb-0">₹{getOrderTotal().toFixed(0)}</span>
                </div>
              </div>
            )}

            <div className="d-flex justify-content-end gap-3 pt-3 mt-2 border-top">
              <Button variant="light" className="rounded-pill px-4 fw-bold" onClick={() => setShowCreateModal(false)}>
                DISCARD
              </Button>
              <Button variant="primary" type="submit" className="rounded-pill px-5 fw-bold shadow-sm" disabled={orderForm.items.length === 0 || (orderForm.orderType === 'dine-in' && !orderForm.tableId)}>
                PLACE ORDER
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Orders;

