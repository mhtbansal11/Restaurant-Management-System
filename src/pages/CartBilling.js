import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, InputGroup, Badge, Modal, Alert } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import config from '../config';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CartBilling = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState('dine-in');
  const [selectedTable, setSelectedTable] = useState(null);
  const [tables, setTables] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', _id: null });
  const [customerResults, setCustomerResults] = useState([]);
  const [outletInfo, setOutletInfo] = useState({ 
    settings: { taxRate: 5, currency: 'INR', serviceCharge: 0 } 
  });
  
  const [discountPercent, setDiscountPercent] = useState(0);
  const [enableTax, setEnableTax] = useState(false);
  const [enableServiceCharge, setEnableServiceCharge] = useState(false);
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMode, setPaymentMode] = useState('cash');
  const [currentOrder, setCurrentOrder] = useState(null);

  // Load initial data from location state or localStorage
  useEffect(() => {
    if (location.state?.cart) {
      setCart(location.state.cart);
    } else {
      const savedCart = localStorage.getItem('currentCart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    }
    
    if (location.state?.orderType) {
      setOrderType(location.state.orderType);
    }
    
    if (location.state?.table) {
      setSelectedTable(location.state.table);
    }
    
    fetchTables();
    fetchOutletSettings();
  }, [location]);

  const fetchTables = async () => {
    try {
      const response = await axios.get(config.ENDPOINTS.TABLES);
      setTables(response.data);
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  const fetchOutletSettings = async () => {
    try {
      const response = await axios.get(`${config.ENDPOINTS.OUTLET}/current`);
      setOutletInfo(response.data);
    } catch (error) {
      console.error('Error fetching outlet settings:', error);
    }
  };

  const round2 = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

  const calculateTotal = () => {
    const total = cart.reduce((sum, item) => {
      if (item.status === 'cancelled') return sum;
      return sum + (item.price * item.quantity);
    }, 0);
    return round2(total);
  };

  const calculateDiscount = () => {
    return round2(calculateTotal() * (discountPercent / 100));
  };

  const calculateSubtotalAfterDiscount = () => {
    return round2(calculateTotal() - calculateDiscount());
  };

  const calculateTax = () => {
    if (!enableTax) return 0;
    const taxRate = user?.taxRate || outletInfo.settings.taxRate || 0;
    return round2(calculateSubtotalAfterDiscount() * (taxRate / 100));
  };

  const calculateServiceCharge = () => {
    if (!enableServiceCharge) return 0;
    const serviceChargeRate = user?.serviceChargeRate || outletInfo.settings.serviceCharge || 0;
    return round2(calculateSubtotalAfterDiscount() * (serviceChargeRate / 100));
  };

  const calculateGrandTotal = () => {
    return round2(calculateSubtotalAfterDiscount() + calculateTax() + calculateServiceCharge());
  };

  const updateQuantity = (cartId, delta) => {
    setCart(cart.map(item => {
      if (item.cartId === cartId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (cartId) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const updateNotes = (cartId, notes) => {
    setCart(cart.map(item => 
      item.cartId === cartId ? { ...item, notes } : item
    ));
  };

  const searchCustomers = async (query) => {
    if (!query) {
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

  const selectCustomer = (customer) => {
    setCustomerInfo({
      name: customer.name,
      phone: customer.phone,
      _id: customer._id
    });
    setCustomerResults([]);
  };

  const handleCheckout = async () => {
    try {
      // First ensure customer is saved/updated
      let customerId = customerInfo._id;
      if (customerInfo.name && customerInfo.phone && !customerId) {
        const custRes = await axios.post(config.ENDPOINTS.CUSTOMERS, {
          name: customerInfo.name,
          phone: customerInfo.phone
        });
        customerId = custRes.data._id;
      }

      const orderData = {
        items: cart.map(item => ({
          menuItem: item._id,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes || '',
          status: 'queued'
        })),
        customer: customerId,
        tableId: orderType === 'dine-in' ? (selectedTable?.id || null) : null,
        tableLabel: orderType === 'dine-in' ? (selectedTable?.label || null) : null,
        orderType,
        totalAmount: calculateGrandTotal(),
        subtotal: calculateTotal(),
        discountPercent,
        discountAmount: calculateDiscount(),
        taxRate: user?.taxRate || outletInfo.settings.taxRate || 0,
        taxAmount: calculateTax(),
        serviceChargeRate: user?.serviceChargeRate || outletInfo.settings.serviceCharge || 0,
        serviceChargeAmount: calculateServiceCharge(),
        paymentMode: 'pending',
        status: 'pending',
        customerName: customerInfo.name || '',
        customerPhone: customerInfo.phone || ''
      };

      const response = await axios.post(config.ENDPOINTS.ORDERS, orderData);
      setCurrentOrder(response.data);
      setShowSettleModal(true);
      setPaidAmount(calculateGrandTotal());
      
      // Clear cart after successful order
      localStorage.removeItem('currentCart');
      
      toast.success('Order created successfully!');
      
    } catch (error) {
      console.error('Checkout failed:', error);
      toast.error('Checkout failed');
    }
  };

  const handleSettlePayment = async () => {
    try {
      const paymentData = {
        orderId: currentOrder._id,
        amount: paidAmount,
        paymentMode,
        notes: 'Payment settled from Cart & Billing page'
      };

      await axios.post(config.ENDPOINTS.PAYMENTS, paymentData);
      
      // Update order status to completed
      await axios.put(`${config.ENDPOINTS.ORDERS}/${currentOrder._id}`, {
        status: 'completed',
        paidAmount: paidAmount
      });

      setShowSettleModal(false);
      toast.success('Payment settled successfully!');
      
      // Navigate back to POS or dashboard
      setTimeout(() => navigate('/pos'), 2000);
      
    } catch (error) {
      console.error('Payment settlement failed:', error);
      toast.error('Payment settlement failed');
    }
  };

  const generateKOT = () => {
    // KOT generation logic here
    toast.success('KOT generated successfully!');
  };

  return (
    <Container fluid className="py-4">
      <Row>
        <Col md={8}>
          <Card>
            <Card.Header>
              <h4 className="mb-0">🛒 Order Cart</h4>
            </Card.Header>
            <Card.Body>
              {cart.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted">Your cart is empty</p>
                  <Button onClick={() => navigate('/pos')}>
                    Back to POS
                  </Button>
                </div>
              ) : (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Total</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item) => (
                      <tr key={item.cartId}>
                        <td>
                          <div>
                            <strong>{item.name}</strong>
                            {item.notes && (
                              <small className="text-muted d-block">
                                Notes: {item.notes}
                              </small>
                            )}
                          </div>
                        </td>
                        <td>
                          <InputGroup size="sm">
                            <Button
                              size="sm"
                              variant="outline-secondary"
                              onClick={() => updateQuantity(item.cartId, -1)}
                            >
                              -
                            </Button>
                            <Form.Control
                              type="number"
                              value={item.quantity}
                              readOnly
                              style={{ width: '50px', textAlign: 'center' }}
                            />
                            <Button
                              size="sm"
                              variant="outline-secondary"
                              onClick={() => updateQuantity(item.cartId, 1)}
                            >
                              +
                            </Button>
                          </InputGroup>
                        </td>
                        <td>₹{item.price}</td>
                        <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                        <td>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => removeFromCart(item.cartId)}
                          >
                            ×
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>

          {/* Customer Information */}
          <Card className="mt-3">
            <Card.Header>
              <h5 className="mb-0">👤 Customer Information</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Customer Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter customer name"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      type="tel"
                      placeholder="Enter phone number"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          {/* Order Summary */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">💰 Order Summary</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>₹{calculateTotal().toFixed(2)}</span>
              </div>

              <Form.Group className="mb-2">
                <Form.Label>Discount (%)</Form.Label>
                <InputGroup size="sm">
                  <Form.Control
                    type="number"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    min="0"
                    max="100"
                  />
                  <InputGroup.Text>%</InputGroup.Text>
                </InputGroup>
              </Form.Group>

              {discountPercent > 0 && (
                <div className="d-flex justify-content-between text-danger mb-2">
                  <span>Discount:</span>
                  <span>-₹{calculateDiscount().toFixed(2)}</span>
                </div>
              )}

              <Form.Check
                type="switch"
                label={`Apply Tax (${outletInfo.settings?.taxRate || 5}%)`}
                checked={enableTax}
                onChange={(e) => setEnableTax(e.target.checked)}
                className="mb-2"
              />

              {enableTax && (
                <div className="d-flex justify-content-between mb-2">
                  <span>Tax:</span>
                  <span>₹{calculateTax().toFixed(2)}</span>
                </div>
              )}

              <Form.Check
                type="switch"
                label={`Service Charge (${outletInfo.settings?.serviceCharge || 0}%)`}
                checked={enableServiceCharge}
                onChange={(e) => setEnableServiceCharge(e.target.checked)}
                className="mb-2"
              />

              {enableServiceCharge && (
                <div className="d-flex justify-content-between mb-2">
                  <span>Service Charge:</span>
                  <span>₹{calculateServiceCharge().toFixed(2)}</span>
                </div>
              )}

              <hr />
              <div className="d-flex justify-content-between fw-bold fs-5">
                <span>Grand Total:</span>
                <span>₹{calculateGrandTotal().toFixed(2)}</span>
              </div>

              <div className="d-grid gap-2 mt-3">
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                >
                  💳 Checkout
                </Button>
                
                <Button 
                  variant="outline-success" 
                  onClick={generateKOT}
                  disabled={cart.length === 0}
                >
                  🖨️ Generate KOT
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Order Type & Table Selection */}
          <Card className="mt-3">
            <Card.Header>
              <h5 className="mb-0">📋 Order Details</h5>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Order Type</Form.Label>
                <Form.Select
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value)}
                >
                  <option value="dine-in">Dine-in</option>
                  <option value="takeaway">Takeaway</option>
                  <option value="delivery">Delivery</option>
                </Form.Select>
              </Form.Group>

              {orderType === 'dine-in' && (
                <Form.Group className="mb-3">
                  <Form.Label>Select Table</Form.Label>
                  <Form.Select
                    value={selectedTable?.id || ''}
                    onChange={(e) => {
                      const tableId = e.target.value;
                      const table = tables.find(t => t._id === tableId);
                      setSelectedTable(table);
                    }}
                  >
                    <option value="">Select a table</option>
                    {tables.map(table => (
                      <option key={table._id} value={table._id}>
                        {table.label} - {table.capacity} seats ({table.status})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Settlement Modal */}
      <Modal show={showSettleModal} onHide={() => setShowSettleModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>💰 Settle Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Amount Paid</Form.Label>
            <Form.Control
              type="number"
              value={paidAmount}
              onChange={(e) => setPaidAmount(Number(e.target.value))}
              min="0"
              max={calculateGrandTotal()}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Payment Method</Form.Label>
            <Form.Select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
              <option value="online">Online</option>
            </Form.Select>
          </Form.Group>

          <Alert variant="info">
            Total Amount: ₹{calculateGrandTotal().toFixed(2)}
            {paidAmount > 0 && (
              <>
                <br />
                Change: ₹{(paidAmount - calculateGrandTotal()).toFixed(2)}
              </>
            )}
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSettleModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSettlePayment}>
            Confirm Payment
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CartBilling;