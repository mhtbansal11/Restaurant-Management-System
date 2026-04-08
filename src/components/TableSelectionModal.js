import React, { useState, useEffect } from 'react';
import {
  Modal,
  Button,
  Form,
  Spinner,
  Badge
} from 'react-bootstrap';
import axios from 'axios';
import config from '../config';

const TableSelectionModal = ({
  show,
  onHide,
  onSelectTables,
  selectedTables = [],
  singleSelect = false,
  instantConfirm = false,
  title = 'Select Tables',
  selectionHint = 'Select one or more tables',
  confirmLabel = 'Confirm Selection'
}) => {
  const [floors, setFloors] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedFloorTables, setSelectedFloorTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [localSelection, setLocalSelection] = useState([]);

  useEffect(() => {
    if (show) {
      setLocalSelection(selectedTables);
    }
  }, [show, selectedTables]);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const layoutResponse = await axios.get(config.ENDPOINTS.SEATING_LAYOUT || `${config.API_URL}/seating/layout`);
      const layoutData = layoutResponse.data;
      const tablesResponse = await axios.get(config.ENDPOINTS.TABLES);
      const tablesData = tablesResponse.data;

      setFloors(layoutData.floors || []);
      setTables(tablesData);

      if (!selectedFloor && layoutData.floors?.length > 0) {
        setSelectedFloor(layoutData.floors[0].id);
      }
    } catch (error) {
      console.error('Error fetching table data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedFloor]);

  useEffect(() => {
    if (show) {
      fetchData();
    }
  }, [show, fetchData]);

  useEffect(() => {
    if (selectedFloor && floors.length > 0) {
      const currentFloor = floors.find((floor) => floor.id === selectedFloor);
      if (currentFloor) {
        const floorTableIds = currentFloor.tables.map((table) => table.id);
        const floorTables = tables.filter((table) => floorTableIds.includes(table.tableId));

        const mergedTables = currentFloor.tables.map((layoutTable) => {
          const tableStatus = floorTables.find((table) => table.tableId === layoutTable.id);
          return {
            id: layoutTable.id,
            label: layoutTable.label || layoutTable.id,
            capacity: layoutTable.capacity,
            status: tableStatus?.status || 'available',
            customerCount: tableStatus?.customerCount || 0
          };
        });

        setSelectedFloorTables(mergedTables);
      }
    }
  }, [selectedFloor, floors, tables]);

  const toggleTableSelection = (table) => {
    const selectedTablePayload = {
      id: table.id,
      label: table.label,
      capacity: table.capacity,
      status: table.status
    };

    if (singleSelect) {
      const nextSelection = [selectedTablePayload];
      setLocalSelection(nextSelection);

      if (instantConfirm) {
        onSelectTables(nextSelection);
        onHide();
      }
      return;
    }

    setLocalSelection((prev) => {
      const isSelected = prev.find((current) => current.id === table.id);
      if (isSelected) {
        return prev.filter((current) => current.id !== table.id);
      }
      return [...prev, selectedTablePayload];
    });
  };

  const handleConfirm = () => {
    onSelectTables(localSelection);
    onHide();
  };

  const getStatusBadge = (status) => {
    const variants = {
      available: 'success',
      occupied: 'danger',
      reserved: 'warning',
      cleaning: 'secondary'
    };
    return variants[status] || 'secondary';
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title className="h5 fw-bold">
          {'Select '} {title} {localSelection.length > 1 && <Badge bg="info" className="ms-2">Merging {localSelection.length}</Badge>}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4 pb-4">
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" className="me-2" />
            <span>Loading tables...</span>
          </div>
        ) : (
          <>
            <Form.Group className="mb-4">
              <div className="d-flex flex-wrap gap-2">
                {floors.map((floor) => (
                  <Button
                    key={floor.id}
                    variant={selectedFloor === floor.id ? 'primary' : 'outline-primary'}
                    size="sm"
                    className="rounded-pill px-3"
                    onClick={() => setSelectedFloor(floor.id)}
                  >
                    {floor.name}
                  </Button>
                ))}
              </div>
            </Form.Group>

            <Form.Label className="fw-bold text-muted small text-uppercase">{selectionHint}</Form.Label>
            {selectedFloorTables.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <p>No tables found on this floor</p>
              </div>
            ) : (
              <div className="row g-3">
                {selectedFloorTables.map((table) => {
                  const isSelected = localSelection.find((current) => current.id === table.id);
                  return (
                    <div key={table.id} className="col-6 col-md-4">
                      <Button
                        variant={isSelected ? 'primary' : 'outline-primary'}
                        className={`w-100 p-3 d-flex flex-column align-items-center gap-2 rounded-3 ${isSelected ? 'border-3 border-dark' : ''}`}
                        onClick={() => toggleTableSelection(table)}
                        disabled={table.status === 'occupied' || table.status === 'reserved'}
                      >
                        <div className="fw-bold">{table.label}</div>
                        <div className="small opacity-75">Cap: {table.capacity}</div>
                        <Badge bg={getStatusBadge(table.status)}>
                          {table.status}
                        </Badge>
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        {!instantConfirm && (
          <Button variant="primary" onClick={handleConfirm} disabled={localSelection.length === 0}>
            {confirmLabel} ({localSelection.length})
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default TableSelectionModal;
