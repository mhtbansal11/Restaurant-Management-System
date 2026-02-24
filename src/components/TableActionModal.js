import React from 'react';
import { Modal, Button, Row, Col } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import './TableActionModal.css';

const TableActionModal = ({ table, onClose, onAction }) => {
  const { user } = useAuth();
  if (!table) return null;
  console.log("table",table)
  return (
    <Modal show={!!table} onHide={onClose} centered size="md">
      <Modal.Header closeButton className="">
        <Modal.Title className="h5 fw-bold">Manage {table.label}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4 pb-4">
        <div className="bg-light p-3 rounded mb-4 border d-flex justify-content-between">
          <div>
            <small className="text-muted d-block">Capacity</small>
            <span className="fw-bold">{table.capacity} Persons</span>
          </div>
          <div className="text-end">
            <small className="text-muted d-block">Status</small>
            <span className="fw-bold text-capitalize">{table.status || 'Available'}</span>
          </div>
        </div>
        
        <Row className="g-3">
          {['superadmin', 'owner', 'manager', 'cashier', 'receptionist', 'waiter'].includes(user?.role) && (
            <Col xs={6}>
              <Button 
                variant="outline-primary"
                className="w-100 h-100 p-3 d-flex flex-column align-items-center gap-2 action-btn-bs border"
                onClick={() => onAction('order')}
                disabled={table.status === 'cleaning'}
                title={table.status === 'cleaning' ? 'Finish cleaning before starting new order' : ''}
              >
                <span className="fs-3">🍽️</span>
                <div className="text-center">
                  <div className="fw-bold small mb-1">
                    {table.status === 'occupied' ? 'Continue Order' : 'New Order'}
                  </div>
                  <small className="text-muted d-block" style={{fontSize: '0.7rem'}}>
                    {table.status === 'occupied' ? 'Add Items' : 'Start Service'}
                  </small>
                </div>
              </Button>
            </Col>
          )}
          
          {['superadmin', 'owner', 'manager', 'receptionist'].includes(user?.role) && (
            <Col xs={6}>
              <Button 
                variant="outline-warning"
                className="w-100 h-100 p-3 d-flex flex-column align-items-center gap-2 action-btn-bs border"
                onClick={() => onAction('book')}
                disabled={table.status === 'occupied' || table.status === 'reserved' || table.status === 'cleaning'}
                title={table.status === 'reserved' ? 'Table already reserved' : table.status === 'cleaning' ? 'Table is being cleaned' : ''}
              >
                <span className="fs-3">📅</span>
                <div className="text-center">
                  <div className="fw-bold small text-dark mb-1">Book Table</div>
                  <small className="text-muted d-block" style={{fontSize: '0.7rem'}}>Reserve</small>
                </div>
              </Button>
            </Col>
          )}

          {table.status === 'occupied' && ['superadmin', 'owner', 'manager', 'cashier', 'receptionist'].includes(user?.role) && (
            <Col xs={6}>
              <Button 
                variant="outline-success"
                className="w-100 h-100 p-3 d-flex flex-column align-items-center gap-2 action-btn-bs border"
                onClick={() => onAction('bill')}
                disabled={!table.currentOrder}
                title={!table.currentOrder ? 'No active order found' : ''}
              >
                <span className="fs-3">🧾</span>
                <div className="text-center">
                  <div className="fw-bold small mb-1">Generate Bill</div>
                  <small className="text-muted d-block" style={{fontSize: '0.7rem'}}>Checkout</small>
                </div>
              </Button>
            </Col>
          )}

          {table.status !== 'available' && ['superadmin', 'owner', 'manager', 'cashier', 'receptionist', 'waiter'].includes(user?.role) && (
            <Col xs={6}>
              <Button 
                variant="outline-danger"
                className="w-100 h-100 p-3 d-flex flex-column align-items-center gap-2 action-btn-bs border"
                onClick={() => onAction('clear')}
                disabled={!!table.currentOrder && (((table.currentOrder.totalAmount || table.currentOrder.subtotal || 0) - (table.currentOrder.paidAmount || 0)) > 0)}
                title={!!table.currentOrder && (((table.currentOrder.totalAmount || table.currentOrder.subtotal || 0) - (table.currentOrder.paidAmount || 0)) > 0) ? 'Settle due before clearing' : ''}
              >
                <span className="fs-3">🧹</span>
                <div className="text-center">
                  <div className="fw-bold small mb-1">
                    {table.status === 'cleaning' ? 'Finish Cleaning' : 'Clear Table'}
                  </div>
                  <small className="text-muted d-block" style={{fontSize: '0.7rem'}}>
                    {table.status === 'reserved' ? 'Cancel Booking' : 'Available'}
                  </small>
                </div>
              </Button>
            </Col>
          )}
        </Row>
      </Modal.Body>
    </Modal>
  );
};

export default TableActionModal;
