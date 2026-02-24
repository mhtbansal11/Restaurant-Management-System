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

const TableSelectionModal = ({ show, onHide, onSelectTable, selectedTable }) => {
  const [floors, setFloors] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedFloorTables, setSelectedFloorTables] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch seating layout and tables
  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      // Fetch seating layout for floors
      const layoutResponse = await axios.get(config.ENDPOINTS.SEATING_LAYOUT || `${config.API_URL}/seating/layout`);
      const layoutData = layoutResponse.data;
      
      // Fetch tables for status
      const tablesResponse = await axios.get(config.ENDPOINTS.TABLES);
      const tablesData = tablesResponse.data;
      
      setFloors(layoutData.floors || []);
      setTables(tablesData);
      
      // Set default floor if none selected
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

  // Filter tables for selected floor
  useEffect(() => {
    if (selectedFloor && floors.length > 0) {
      const currentFloor = floors.find(floor => floor.id === selectedFloor);
      if (currentFloor) {
        const floorTableIds = currentFloor.tables.map(table => table.id);
        const floorTables = tables.filter(table => floorTableIds.includes(table.tableId));
        
        // Merge layout data with status data
        const mergedTables = currentFloor.tables.map(layoutTable => {
          const tableStatus = floorTables.find(t => t.tableId === layoutTable.id);
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

  const handleTableSelect = (table) => {
    onSelectTable({
      id: table.id,
      label: table.label,
      capacity: table.capacity,
      status: table.status
    });
    onHide();
  };

  const getStatusBadge = (status) => {
    const variants = {
      available: 'success',
      occupied: 'danger',
      reserved: 'warning',
      cleaning: 'secondary',
      maintenance: 'secondary',
      unavailable: 'secondary'
    };
    return variants[status] || 'secondary';
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton className="">
        <Modal.Title className="h5 fw-bold">🪑 Select Table</Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4 pb-4">
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" className="me-2" />
            <span>Loading tables...</span>
          </div>
        ) : (
          <>
            {/* Floor Selection Pills */}
            <Form.Group className="mb-4">
              {/* <Form.Label className="fw-bold text-muted small text-uppercase mb-2 d-block">Select Floor</Form.Label> */}
              <div className="d-flex flex-wrap gap-2">
                {floors.map(floor => (
                  <Button
                    key={floor.id}
                    variant={selectedFloor === floor.id ? "primary" : "outline-primary"}
                    size="sm"
                    className="rounded-pill px-3"
                    onClick={() => setSelectedFloor(floor.id)}
                  >
                    {floor.name}
                  </Button>
                ))}
              </div>
            </Form.Group>

            {/* Tables Grid */}
            <Form.Label className="fw-bold text-muted small text-uppercase">Select Table</Form.Label>
            {selectedFloorTables.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <div className="mb-2">🪑</div>
                <p>No tables found on this floor</p>
              </div>
            ) : (
              <div className="row g-3">
                {selectedFloorTables.map(table => (
                  <div key={table.id} className="col-6 col-md-4">
                    <Button
                      variant={selectedTable?.id === table.id ? "primary" : "outline-primary"}
                      className="w-100 p-3 d-flex flex-column align-items-center gap-2 rounded-3"
                      onClick={() => handleTableSelect(table)}
                      disabled={table.status === 'occupied' || table.status === 'reserved'}
                    >
                      <div className="fw-bold">{table.label}</div>
                      <div className="small text-muted">Capacity: {table.capacity}</div>
                      <Badge bg={getStatusBadge(table.status)} className="mt-1">
                        {table.status}
                      </Badge>
                      {table.customerCount > 0 && (
                        <div className="small text-muted">
                          {table.customerCount} customers
                        </div>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </Modal.Body>
     
    </Modal>
  );
};

export default TableSelectionModal;
