import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import config from '../config';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { CheckCircleIcon, PlayIcon, CheckIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import './KDS.css';

const KDS = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [keepTableOccupied, setKeepTableOccupied] = useState(false);

  const [viewMode, setViewMode] = useState('orders'); // 'orders' or 'tables'

  const fetchOrders = useCallback(async () => {
    try {
      const response = await axios.get(config.ENDPOINTS.ORDERS);
      // Show orders that are not 'completed' or 'cancelled'
      // If order is 'ready', it might still be in KDS for final pickup
      const activeOrders = response.data.filter(order => 
        ['active', 'pending', 'preparing', 'ready', 'served'].includes(order.status)
      );
      setOrders(activeOrders);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load kitchen orders');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    // Poll for new orders every 15 seconds
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleUpdateItemStatus = async (orderId, itemId, newStatus) => {
    try {
      await axios.patch(`${config.ENDPOINTS.ORDERS}/${orderId}/item/${itemId}/status`, {
        status: newStatus
      });
      fetchOrders();
    } catch (err) {
      console.error('Error updating item status:', err);
      toast.error('Failed to update item status');
    }
  };

  const handleUpdateStatus = async (orderId, newStatus, options = {}) => {
    try {
      await axios.put(`${config.ENDPOINTS.ORDERS}/${orderId}/status`, {
        status: newStatus,
        ...options
      });
      toast.success(`Order ${newStatus} successfully`);
      fetchOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
      toast.error('Failed to update order status');
    }
  };

  const handleCompleteOrder = (order) => {
    setSelectedOrder(order);
    setKeepTableOccupied(false);
    setShowCompleteModal(true);
  };

  const confirmCompleteOrder = async () => {
    if (!selectedOrder) return;
    
    try {
      await axios.put(`${config.ENDPOINTS.ORDERS}/${selectedOrder._id}/status`, {
        status: 'completed',
        keepTableOccupied: keepTableOccupied
      });
      toast.success(`Order completed${keepTableOccupied ? ' (table remains occupied)' : ''}`);
      
      setShowCompleteModal(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      console.error('Error completing order:', err);
      toast.error('Failed to complete order');
    }
  };

  const getWaitTime = (createdAt) => {
    const start = new Date(createdAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now - start) / 60000);
    return diffInMinutes;
  };

  const getTimerColor = (minutes) => {
    if (minutes > 15) return '#ef4444'; // Urgent - Red
    if (minutes > 8) return '#f59e0b';  // Warning - Orange
    return '#10b981';                   // Normal - Green
  };

  const getTablesWithPendingItems = () => {
    const tableMap = {};
    orders.forEach(order => {
      const tableName = order.tableLabel || order.tableId || 'Takeaway/Packing';
      if (!tableMap[tableName]) {
        tableMap[tableName] = {
          name: tableName,
          items: [],
          orderIds: new Set(),
          oldestOrder: order.createdAt
        };
      }
      
      order.items.forEach(item => {
        if (['queued', 'preparing', 'ready'].includes(item.status)) {
          tableMap[tableName].items.push({
            ...item,
            orderId: order._id
          });
          tableMap[tableName].orderIds.add(order._id);
          if (new Date(order.createdAt) < new Date(tableMap[tableName].oldestOrder)) {
            tableMap[tableName].oldestOrder = order.createdAt;
          }
        }
      });
    });
    
    return Object.values(tableMap).filter(t => t.items.length > 0);
  };

  if (loading && orders.length === 0) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-3 text-light">Loading Kitchen Display...</span>
      </Container>
    );
  }

  return (
    <Container fluid className="kds-container-bs py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 px-3">
        <div>
          <h2 className="text-light mb-0">Kitchen Display System</h2>
          <p className="text-white mb-0 small">Real-time order management</p>
        </div>
        <div className="d-flex align-items-center gap-3">
          <div className="btn-group me-2 shadow-sm">
            <Button 
              variant={viewMode === 'orders' ? 'primary' : 'outline-light'} 
              size="sm"
              onClick={() => setViewMode('orders')}
            >
              Order View
            </Button>
            <Button 
              variant={viewMode === 'tables' ? 'primary' : 'outline-light'} 
              size="sm"
              onClick={() => setViewMode('tables')}
            >
              Table View
            </Button>
          </div>
          <Badge bg="dark" className="border border-secondary p-2">
            Active Orders: {orders.length}
          </Badge>
          <Button 
            variant="outline-light" 
            size="sm" 
            onClick={fetchOrders}
            className="rounded-pill px-3"
          >
            Refresh
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger" className="mx-3">{error}</Alert>}

    
        {orders.length === 0 ? (
           <Row className="g-4 px-3">
          <Col xs={12}>
            <div className="text-center py-5 mt-5">
              <div className="empty-state-container p-5 rounded-4 shadow-sm mx-auto">
                <CheckCircleIcon className="text-success mb-3" style={{ width: '64px', height: '64px' }} />
                <h3 className="text-white fw-bold mb-2">All Caught Up!</h3>
                <p className="text-white mb-4 fs-5">There are no active orders in the kitchen right now.</p>
                <Button 
                  variant="light" 
                  onClick={fetchOrders}
                  className="rounded-pill px-4"
                >
                  Refresh Status
                </Button>
              </div>
            </div>
          </Col>
          </Row>
        ) : viewMode === 'orders' ? (
           <Row  className="g-4 px-3">
         { orders.map((order) => (
            <Col xs={12} md={6} lg={4} xl={4} key={order._id}>
              <Card className={`kds-card-bs h-100 ${order.status}`}>
                <Card.Header className="kds-card-header-bs d-flex justify-content-between align-items-start border-0 bg-transparent pt-3">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="order-number-bs fw-bold">#{order._id.slice(-4)}</span>
                      <div className="d-flex align-items-center gap-1">
                        {order.previousOrderType && (
                          <Badge bg="secondary" className="text-uppercase small text-decoration-line-through opacity-50">
                            {order.previousOrderType}
                          </Badge>
                        )}
                        {order.previousOrderType && <span className="text-light small">→</span>}
                        <Badge bg={order.orderType === 'dine-in' ? 'primary' : 'info'} className="text-uppercase small">
                          {order.orderType}
                        </Badge>
                      </div>
                    </div>
                    {order.tableLabel ? (
                      <div className="table-info-bs text-light small">Table: {order.tableLabel}</div>
                    ) : order.tableId && (
                      <div className="table-info-bs text-light small">Table: {order.tableId}</div>
                    )}
                  </div>
                  <div className="text-end">
                    <div 
                      className="wait-timer-bs fw-bold h4 mb-0" 
                      style={{ color: getTimerColor(getWaitTime(order.createdAt)) }}
                    >
                      {getWaitTime(order.createdAt)}m
                    </div>
                    <div className="text-muted small">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </Card.Header>

                <Card.Body className="kds-card-body-bs py-3">
                  <div className="items-list-bs">
                    {order.items.map((item, idx) => (
                      <div key={idx} className={`order-item-bs d-flex justify-content-between align-items-center mb-1 px-2 rounded-3 ${item.status === 'ready' ? 'item-ready opacity-75' : item.status === 'served' ? 'item-served opacity-50' : item.status === 'cancelled' ? 'item-cancelled opacity-50' : ''}`}>
                        <div className="d-flex flex-column">
                          <div className="d-flex align-items-center gap-2">
                            <span className={`item-qty-bs fw-bold ${item.status === 'cancelled' ? 'text-muted text-decoration-line-through' : 'text-primary'}`}>{item?.quantity}x</span>
                            <span className={`item-name-bs ${['served', 'cancelled'].includes(item.status) ? 'text-decoration-line-through text-light' : 'text-light'}`}>
                              {item?.menuItem?.name}
                            </span>
                            {item.status === 'queued' && (
                              <Badge bg="danger" className="item-new-badge item-status-badge">New</Badge>
                            )}
                            {item.status === 'cancelled' && (
                              <Badge bg="secondary" className="item-status-badge">Cancelled</Badge>
                            )}
                          </div>
                          {item.notes && (
                            <div className="item-notes-bs small text-warning italic mt-0">
                              * {item.notes}
                            </div>
                          )}
                        </div>
                        <div className="d-flex gap-2">
                          {item.status === 'queued' && (
                            <Button 
                              variant="warning" 
                              className="item-status-btn"
                              onClick={() => handleUpdateItemStatus(order._id, item._id, 'preparing')}
                            >
                              <PlayIcon style={{ width: '14px' }} /> Start
                            </Button>
                          )}
                          {item.status === 'preparing' && (
                            <Button 
                              variant="success" 
                              className="item-status-btn"
                              onClick={() => handleUpdateItemStatus(order._id, item._id, 'ready')}
                            >
                              <CheckIcon style={{ width: '14px' }} /> Done
                            </Button>
                          )}
                          {item.status === 'ready' && (
                            <div className="d-flex align-items-center gap-2">
                              <Badge bg="success" className="item-status-badge">Ready</Badge>
                              <Button 
                                variant="primary" 
                                className="item-status-btn"
                                onClick={() => handleUpdateItemStatus(order._id, item._id, 'served')}
                              >
                                <RocketLaunchIcon style={{ width: '14px' }} /> Serve
                              </Button>
                            </div>
                          )}
                          {item.status === 'served' && (
                            <Badge bg="info" className="item-status-badge text-white">Served</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card.Body>

                <Card.Footer className="kds-card-footer-bs bg-transparent border-0 pb-3">
                  <div className="d-grid gap-2">
                    {(order.status === 'pending' || order.status === 'active') && (
                      <Button 
                        variant="warning" 
                        onClick={() => handleUpdateStatus(order._id, 'preparing')}
                        className="fw-bold py-2"
                      >
                        START PREPARING
                      </Button>
                    )}
                    {order.status === 'preparing' && (
                      <Button 
                        variant="success" 
                        onClick={() => handleUpdateStatus(order._id, 'ready')}
                        className="fw-bold py-2"
                      >
                        MARK ALL AS READY
                      </Button>
                    )}
                    {order.status === 'ready' && (
                      <Button 
                        variant="primary" 
                        onClick={() => handleUpdateStatus(order._id, 'served')}
                        className="fw-bold py-2"
                      >
                        MARK ALL AS SERVED
                      </Button>
                    )}
                    {order.status === 'served' && (
                      <Button 
                        variant="info" 
                        onClick={() => handleCompleteOrder(order)}
                        className="fw-bold py-2 text-white"
                      >
                        COMPLETE ORDER
                      </Button>
                    )}
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          ))}
          </Row>
        ) : (
          <Row className="g-4 px-3">
            {getTablesWithPendingItems().map((table) => (
              <Col xs={12} md={6} lg={4} xl={4} key={table.name}>
                <Card className="kds-card-bs border-0 shadow-sm h-100 preparing">
                  <Card.Header className="kds-card-header-bs d-flex justify-content-between align-items-start border-0 bg-transparent pt-3">
                    <div>
                      <h4 className="text-white mb-0">{table.name}</h4>
                      <Badge bg="secondary" className="mt-1">
                        {table.orderIds.size} Order(s)
                      </Badge>
                    </div>
                    <div className="text-end">
                      <div 
                        className="wait-timer-bs fw-bold h4 mb-0" 
                        style={{ color: getTimerColor(getWaitTime(table.oldestOrder)) }}
                      >
                        {getWaitTime(table.oldestOrder)}m
                      </div>
                    </div>
                  </Card.Header>
                  <Card.Body className="kds-card-body-bs py-3">
                    <div className="items-list-bs">
                      {table.items.map((item, idx) => (
                        <div key={`${item.orderId}-${idx}`} className={`order-item-bs d-flex justify-content-between align-items-center mb-1 px-2 rounded-3 ${item.status === 'ready' ? 'item-ready opacity-75' : ''}`}>
                          <div className="d-flex flex-column">
                            <div className="d-flex align-items-center gap-2">
                              <span className="item-qty-bs fw-bold text-primary">{item.quantity}x</span>
                              <span className="item-name-bs text-light">{item.menuItem?.name}</span>
                              {item.status === 'queued' && (
                                <Badge bg="danger" className="item-new-badge item-status-badge">New</Badge>
                              )}
                            </div>
                            <span className="text-muted extra-small" style={{fontSize: '0.65rem'}}>Order: #{item.orderId.slice(-4)}</span>
                          </div>
                          <div className="d-flex gap-2">
                            {item.status === 'queued' && (
                              <Button 
                                variant="warning" 
                                className="item-status-btn"
                                onClick={() => handleUpdateItemStatus(item.orderId, item._id, 'preparing')}
                              >
                                <PlayIcon style={{ width: '12px' }} /> Start
                              </Button>
                            )}
                            {item.status === 'preparing' && (
                              <Button 
                                variant="success" 
                                className="item-status-btn"
                                onClick={() => handleUpdateItemStatus(item.orderId, item._id, 'ready')}
                              >
                                <CheckIcon style={{ width: '12px' }} /> Done
                              </Button>
                            )}
                            {item.status === 'ready' && (
                              <div className="d-flex align-items-center gap-2">
                                <Badge bg="success" className="item-status-badge">Ready</Badge>
                                <Button 
                                  variant="primary" 
                                  className="item-status-btn"
                                  onClick={() => handleUpdateItemStatus(item.orderId, item._id, 'served')}
                                >
                                  <RocketLaunchIcon style={{ width: '12px' }} /> Serve
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
     
      <Modal show={showCompleteModal} onHide={() => setShowCompleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Complete Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <div>
              <p>Complete order #{selectedOrder._id.slice(-6)} for {selectedOrder.tableLabel || 'Takeaway'}?</p>
              
              {selectedOrder.tableId && (
                <Form.Check
                  type="checkbox"
                  label="Keep table occupied"
                  checked={keepTableOccupied}
                  onChange={(e) => setKeepTableOccupied(e.target.checked)}
                  className="mb-3"
                />
              )}
              
              {keepTableOccupied && (
                <div className="alert alert-info small">
                  <strong>Note:</strong> The table will remain occupied after payment completion.
                  Use this when customers are staying for additional service.
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCompleteModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={confirmCompleteOrder}>
            Complete Order
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default KDS;
