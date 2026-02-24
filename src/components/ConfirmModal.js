import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const ConfirmModal = ({ 
  show, 
  onHide, 
  onConfirm, 
  title = 'Confirm Action', 
  message = 'Are you sure you want to proceed?', 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  icon = '⚠️'
}) => {
  return (
    <Modal show={show} onHide={onHide} centered size="sm" className="confirm-modal-bs">
      <Modal.Body className="text-center py-4 px-4">
        <div className="confirm-modal-icon-bs mb-3" style={{ fontSize: '3rem' }}>
          {icon}
        </div>
        <h4 className="fw-bold mb-2">{title}</h4>
        <p className="text-muted mb-4">{message}</p>
        <div className="d-flex gap-2 justify-content-center">
          <Button 
            variant="light" 
            onClick={onHide} 
            className="rounded-pill px-4 py-2 fw-semibold"
          >
            {cancelText}
          </Button>
          <Button 
            variant={confirmVariant} 
            onClick={() => {
              onConfirm();
              onHide();
            }}
            className="rounded-pill px-4 py-2 fw-semibold shadow-sm"
          >
            {confirmText}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ConfirmModal;
