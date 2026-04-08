import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Button, Row, Col, Form } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import './TableActionModal.css';

const EMPTY_RESERVATION_FORM = {
  reservedFor: '',
  guestName: '',
  guestPhone: '',
  notes: ''
};

const toDatetimeLocalValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
};

const formatReservationDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
};

const TableActionModal = ({ table, onClose, onAction }) => {
  const { user } = useAuth();
  const canReserve = ['superadmin', 'owner', 'manager', 'receptionist'].includes(user?.role);
  const reservationSummary = useMemo(
    () => formatReservationDate(table?.reservation?.reservedFor),
    [table]
  );
  const isInstantReservation = table?.status === 'reserved' && !table?.reservation?.reservedFor;
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [reservationForm, setReservationForm] = useState(() => ({
    reservedFor: toDatetimeLocalValue(table?.reservation?.reservedFor),
    guestName: table?.reservation?.guestName || '',
    guestPhone: table?.reservation?.guestPhone || '',
    notes: table?.reservation?.notes || ''
  }));

  useEffect(() => {
    setShowReservationForm(false);
    setReservationForm({
      reservedFor: toDatetimeLocalValue(table?.reservation?.reservedFor),
      guestName: table?.reservation?.guestName || '',
      guestPhone: table?.reservation?.guestPhone || '',
      notes: table?.reservation?.notes || ''
    });
  }, [table]);

  if (!table) return null;

  const submitReservation = () => {
    if (!reservationForm.reservedFor) return;

    onAction('book', {
      reservation: {
        reservedFor: new Date(reservationForm.reservedFor).toISOString(),
        guestName: reservationForm.guestName.trim(),
        guestPhone: reservationForm.guestPhone.trim(),
        notes: reservationForm.notes.trim()
      }
    });
  };

  const reserveInstantly = () => {
    onAction('book', {
      reservation: {
        reservedFor: null,
        guestName: '',
        guestPhone: '',
        notes: ''
      }
    });
  };

  const openReservationForm = () => {
    setReservationForm({
      reservedFor: toDatetimeLocalValue(table?.reservation?.reservedFor),
      guestName: table?.reservation?.guestName || '',
      guestPhone: table?.reservation?.guestPhone || '',
      notes: table?.reservation?.notes || ''
    });
    setShowReservationForm(true);
  };

  return (
    <Modal show={!!table} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title className="h5 fw-bold">Manage {table.label}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4 pb-4">
        <div className="table-summary-card">
          <div>
            <small className="text-muted d-block">Capacity</small>
            <span className="fw-bold">{table.capacity} Persons</span>
          </div>
          <div className="text-end">
            <small className="text-muted d-block">Status</small>
            <span className="fw-bold text-capitalize">{table.status || 'Available'}</span>
          </div>
        </div>

        {(reservationSummary || isInstantReservation) && (
          <div className="reservation-summary-card">
            <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
              <div>
                <div className="reservation-summary-title">
                  {reservationSummary ? 'Reserved For' : 'Reservation Status'}
                </div>
                <div className="reservation-summary-value">
                  {reservationSummary || 'Reserved Instantly'}
                </div>
                {table.reservation?.guestName && (
                  <div className="reservation-summary-meta">Guest: {table.reservation.guestName}</div>
                )}
                {table.reservation?.guestPhone && (
                  <div className="reservation-summary-meta">Phone: {table.reservation.guestPhone}</div>
                )}
              </div>
              {canReserve && (
                <Button
                  variant="outline-warning"
                  size="sm"
                  className="rounded-pill px-3"
                  onClick={openReservationForm}
                  disabled={table.status === 'occupied' || table.status === 'cleaning'}
                >
                  {reservationSummary ? 'Edit Reservation' : 'Schedule for Later'}
                </Button>
              )}
            </div>
            {table.reservation?.notes && (
              <div className="reservation-summary-notes">{table.reservation.notes}</div>
            )}
          </div>
        )}

        {table.currentOrderData && (
          <div className="bg-white p-3 rounded mb-4 border">
            <div className="d-flex justify-content-between small mb-1">
              <span className="text-muted">Total</span>
              <span className="fw-bold">Rs {(table.currentOrderData.totalAmount || 0).toLocaleString()}</span>
            </div>
            <div className="d-flex justify-content-between small mb-1">
              <span className="text-muted">Paid</span>
              <span className="fw-bold text-success">Rs {(table.currentOrderData.paidAmount || 0).toLocaleString()}</span>
            </div>
            <div className="d-flex justify-content-between small">
              <span className="text-muted">Due</span>
              <span className="fw-bold text-danger">
                Rs {Math.max(table.currentOrderData.dueAmount ?? ((table.currentOrderData.totalAmount || 0) - (table.currentOrderData.paidAmount || 0)), 0).toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {showReservationForm && canReserve && (
          <div className="reservation-form-card">
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
              <div>
                <div className="fw-bold">Schedule reservation</div>
                <small className="text-muted">Choose a booking date and time for this table.</small>
              </div>
              <Button
                variant="link"
                className="p-0 text-decoration-none"
                onClick={() => {
                  setShowReservationForm(false);
                  setReservationForm(EMPTY_RESERVATION_FORM);
                }}
              >
                Cancel
              </Button>
            </div>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold">Reservation Date & Time</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={reservationForm.reservedFor}
                    min={toDatetimeLocalValue(new Date())}
                    onChange={(event) => setReservationForm((prev) => ({
                      ...prev,
                      reservedFor: event.target.value
                    }))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold">Guest Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Optional"
                    value={reservationForm.guestName}
                    onChange={(event) => setReservationForm((prev) => ({
                      ...prev,
                      guestName: event.target.value
                    }))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold">Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="Optional"
                    value={reservationForm.guestPhone}
                    onChange={(event) => setReservationForm((prev) => ({
                      ...prev,
                      guestPhone: event.target.value
                    }))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold">Notes</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Optional"
                    value={reservationForm.notes}
                    onChange={(event) => setReservationForm((prev) => ({
                      ...prev,
                      notes: event.target.value
                    }))}
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end mt-3">
              <Button
                variant="warning"
                className="rounded-pill px-4 fw-semibold"
                onClick={submitReservation}
                disabled={!reservationForm.reservedFor}
              >
                Save Reservation
              </Button>
            </div>
          </div>
        )}

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
                <span className="fs-3" aria-hidden="true">🍽️</span>
                <div className="text-center">
                  <div className="fw-bold small mb-1">
                    {table.status === 'occupied' ? 'Continue Order' : 'New Order'}
                  </div>
                  <small className="text-muted d-block action-btn-copy">
                    {table.status === 'occupied' ? 'Add Items' : 'Start Service'}
                  </small>
                </div>
              </Button>
            </Col>
          )}

          {canReserve && (
            <Col xs={6}>
              <Button
                variant="outline-warning"
                className="w-100 h-100 p-3 d-flex flex-column align-items-center gap-2 action-btn-bs border"
                onClick={reserveInstantly}
                disabled={table.status === 'occupied' || table.status === 'cleaning'}
                title={table.status === 'cleaning' ? 'Table is being cleaned' : ''}
              >
                <span className="fs-3" aria-hidden="true">📅</span>
                <div className="text-center">
                  <div className="fw-bold small text-dark mb-1">
                    {isInstantReservation ? 'Reserved Now' : 'Reserve Instantly'}
                  </div>
                  <small className="text-muted d-block action-btn-copy">
                    Hold table right away
                  </small>
                </div>
              </Button>
            </Col>
          )}

          {canReserve && (
            <Col xs={6}>
              <Button
                variant="outline-warning"
                className="w-100 h-100 p-3 d-flex flex-column align-items-center gap-2 action-btn-bs border"
                onClick={openReservationForm}
                disabled={table.status === 'occupied' || table.status === 'cleaning'}
                title={table.status === 'cleaning' ? 'Table is being cleaned' : ''}
              >
                <span className="fs-3" aria-hidden="true">🗓️</span>
                <div className="text-center">
                  <div className="fw-bold small text-dark mb-1">
                    {reservationSummary ? 'Update Later Booking' : 'Reserve for Later'}
                  </div>
                  <small className="text-muted d-block action-btn-copy">
                    Date and time required
                  </small>
                </div>
              </Button>
            </Col>
          )}

          {['superadmin', 'owner', 'manager'].includes(user?.role) && (
            <Col xs={6}>
              <Button
                variant="outline-secondary"
                className="w-100 h-100 p-3 d-flex flex-column align-items-center gap-2 action-btn-bs border"
                onClick={() => onAction(table.status === 'maintenance' ? 'activate' : 'maintenance')}
                disabled={table.status === 'occupied' || table.status === 'reserved'}
              >
                <span className="fs-3" aria-hidden="true">🛠️</span>
                <div className="text-center">
                  <div className="fw-bold small text-dark mb-1">
                    {table.status === 'maintenance' ? 'Mark Available' : 'Maintenance'}
                  </div>
                  <small className="text-muted d-block action-btn-copy">
                    {table.status === 'maintenance' ? 'Back in service' : 'Disable service'}
                  </small>
                </div>
              </Button>
            </Col>
          )}

          {['superadmin', 'owner', 'manager'].includes(user?.role) && (
            <Col xs={6}>
              <Button
                variant="outline-dark"
                className="w-100 h-100 p-3 d-flex flex-column align-items-center gap-2 action-btn-bs border"
                onClick={() => onAction(table.status === 'unavailable' ? 'activate' : 'block')}
                disabled={table.status === 'occupied' || table.status === 'reserved'}
              >
                <span className="fs-3" aria-hidden="true">🚫</span>
                <div className="text-center">
                  <div className="fw-bold small text-dark mb-1">
                    {table.status === 'unavailable' ? 'Unblock Table' : 'Block Table'}
                  </div>
                  <small className="text-muted d-block action-btn-copy">
                    {table.status === 'unavailable' ? 'Allow bookings again' : 'Mark unavailable'}
                  </small>
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
                <span className="fs-3" aria-hidden="true">🧾</span>
                <div className="text-center">
                  <div className="fw-bold small mb-1">Generate Bill</div>
                  <small className="text-muted d-block action-btn-copy">Checkout</small>
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
                disabled={table.status === 'occupied' && !!table.currentOrder}
                title={table.status === 'occupied' && !!table.currentOrder ? 'Complete or cancel the order before clearing' : ''}
              >
                <span className="fs-3" aria-hidden="true">🧹</span>
                <div className="text-center">
                  <div className="fw-bold small mb-1">
                    {table.status === 'cleaning' ? 'Finish Cleaning' : table.status === 'reserved' ? 'Cancel Reservation' : 'Clear Table'}
                  </div>
                  <small className="text-muted d-block action-btn-copy">
                    {table.status === 'reserved' ? 'Release this slot' : 'Available'}
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
