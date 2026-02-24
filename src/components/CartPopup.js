import React, { useState } from 'react';
import { Modal, Button, Table, Form, InputGroup, Badge, Row, Col } from 'react-bootstrap';

const CartPopup = ({ 
  show, 
  onHide, 
  cart, 
  onUpdateQuantity, 
  onRemoveItem, 
  onUpdateNotes,
  onCheckout,
  onShowBillModal,
  onApplyDiscount,
  onApplyTax,
  calculateTotal,
  calculateDiscount,
  calculateTax,
  calculateServiceCharge,
  calculateGrandTotal,
  discountPercent,
  setDiscountPercent,
  enableTax,
  setEnableTax,
  enableServiceCharge,
  setEnableServiceCharge,
  outletInfo,
  customerInfo
}) => {
  const [editingNotes, setEditingNotes] = useState(null);
  const [tempNotes, setTempNotes] = useState('');

  const handleNotesEdit = (item, notes) => {
    setEditingNotes(item.cartId || item._id);
    setTempNotes(notes || '');
  };

  const handleNotesSave = (itemId) => {
    onUpdateNotes(itemId, tempNotes);
    setEditingNotes(null);
    setTempNotes('');
  };

  const handleNotesCancel = () => {
    setEditingNotes(null);
    setTempNotes('');
  };

  const handleProceedToCheckout = () => {
    // Close cart popup and show the bill modal
    onHide();
    onShowBillModal();
  };

  const getItemStatusBadge = (item) => {
    if (item.status === 'cancelled') return <Badge bg="danger">Cancelled</Badge>;
    if (item.status === 'served') return <Badge bg="success">Served</Badge>;
    if (item.status === 'preparing') return <Badge bg="warning">Preparing</Badge>;
    return <Badge bg="primary">Queued</Badge>;
  };

  return (
    <>
      <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>🛒 Order Cart</Modal.Title>
      </Modal.Header>
      
      <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        {cart.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted">Your cart is empty</p>
          </div>
        ) : (
          <>
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr key={item.cartId || item._id} className={item.status === 'cancelled' ? 'text-muted' : ''}>
                    <td>
                      <div>
                        <strong>{item.name}</strong>
                        {editingNotes === (item.cartId || item._id) ? (
                          <InputGroup size="sm" className="mt-1">
                            <Form.Control
                              type="text"
                              placeholder="Add notes..."
                              value={tempNotes}
                              onChange={(e) => setTempNotes(e.target.value)}
                            />
                            <Button size="sm" onClick={() => handleNotesSave(item.cartId || item._id)}>
                              ✓
                            </Button>
                            <Button size="sm" variant="outline-secondary" onClick={handleNotesCancel}>
                              ✗
                            </Button>
                          </InputGroup>
                        ) : (
                          <div>
                            <small className="text-muted">
                              {item.notes || 'No notes'}
                            </small>
                            <Button
                              size="sm"
                              variant="link"
                              className="p-0 ms-1"
                              onClick={() => handleNotesEdit(item, item.notes)}
                              title="Edit notes"
                            >
                              ✏️
                            </Button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <InputGroup size="sm">
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          onClick={() => onUpdateQuantity(item.cartId, item._id, -1)}
                          disabled={item.status === 'served'}
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
                          onClick={() => onUpdateQuantity(item.cartId, item._id, 1)}
                          disabled={item.status === 'served'}
                        >
                          +
                        </Button>
                      </InputGroup>
                    </td>
                    <td>₹{item.price}</td>
                    <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                    <td>{getItemStatusBadge(item)}</td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => onRemoveItem(item.cartId, item._id)}
                        disabled={item.status === 'served'}
                        title="Remove item"
                      >
                        ×
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {/* Order Summary */}
            <Row className="mt-3">
              <Col md={6}>
                <h6>Order Settings</h6>
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
                
                <Form.Check
                  type="switch"
                  label="Apply Tax"
                  checked={enableTax}
                  onChange={(e) => setEnableTax(e.target.checked)}
                  className="mb-2"
                />
                
                <Form.Check
                  type="switch"
                  label="Service Charge"
                  checked={enableServiceCharge}
                  onChange={(e) => setEnableServiceCharge(e.target.checked)}
                />
              </Col>
              
              <Col md={6}>
                <h6>Order Summary</h6>
                <div className="d-flex justify-content-between">
                  <span>Subtotal:</span>
                  <span>₹{calculateTotal().toFixed(2)}</span>
                </div>
                
                {discountPercent > 0 && (
                  <div className="d-flex justify-content-between text-danger">
                    <span>Discount ({discountPercent}%):</span>
                    <span>-₹{calculateDiscount().toFixed(2)}</span>
                  </div>
                )}
                
                {enableTax && (
                  <div className="d-flex justify-content-between">
                    <span>Tax ({outletInfo.settings?.taxRate || 5}%):</span>
                    <span>₹{calculateTax().toFixed(2)}</span>
                  </div>
                )}
                
                {enableServiceCharge && (
                  <div className="d-flex justify-content-between">
                    <span>Service Charge ({outletInfo.settings?.serviceCharge || 0}%):</span>
                    <span>₹{calculateServiceCharge().toFixed(2)}</span>
                  </div>
                )}
                
                <hr />
                <div className="d-flex justify-content-between fw-bold">
                  <span>Grand Total:</span>
                  <span>₹{calculateGrandTotal().toFixed(2)}</span>
                </div>
                
                {customerInfo.name && (
                  <div className="mt-2">
                    <small className="text-muted">
                      Customer: {customerInfo.name} ({customerInfo.phone})
                    </small>
                  </div>
                )}
              </Col>
            </Row>
          </>
        )}
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button 
          variant="primary" 
          onClick={handleProceedToCheckout}
          disabled={cart.length === 0 || cart.every(item => item.status === 'cancelled')}
        >
          Proceed to Checkout
        </Button>
      </Modal.Footer>
    </Modal>
    </>
  );
};

export default CartPopup;