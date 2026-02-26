import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import config from '../config';
import { 
  Container, 
  Button, 
  Badge, 
  Spinner, 
  Card,
  ToggleButton,
  ToggleButtonGroup,
  Row,
  Col
} from 'react-bootstrap';
import SeatingPreview from '../components/SeatingPreview';
import TableActionModal from '../components/TableActionModal';
import './Seating.css';

const Seating = () => {
  const navigate = useNavigate();
  const [layout, setLayout] = useState(null);
  const [tableStatuses, setTableStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState(null);
  const [viewMode, setViewMode] = useState('editor'); // 'editor' or 'list'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [layoutRes, tablesRes] = await Promise.all([
        axios.get(`${config.API_URL}/seating/layout`),
        axios.get(config.ENDPOINTS.TABLES)
      ]);
      setLayout(layoutRes.data);
      setTableStatuses(tablesRes.data);
    } catch (error) {
      console.error('Error fetching seating data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableClick = (table) => {
    // Find the current status from tableStatuses
    const tableStatus = tableStatuses.find(t => t.tableId === table.id);
    setSelectedTable({
      ...table,
      status: tableStatus?.status || 'available',
      currentOrder: tableStatus?.currentOrder?._id || tableStatus?.currentOrder
    });
  };

  const handleTableAction = async (action) => {
    if (!selectedTable) return;

    try {
      if (action === 'order') {
        if (selectedTable.status === 'occupied') {
          navigate(`/orders?table=${selectedTable.id}`);
        } else {
          navigate(`/pos?tableId=${selectedTable.id}&type=dine-in&tableLabel=${selectedTable.label}`);
        }
      } else if (action === 'book') {
        await axios.put(`${config.ENDPOINTS.TABLES}/${selectedTable.id}`, { status: 'reserved' });
        toast.success(`Table ${selectedTable.label} reserved!`);
        fetchData();
      } else if (action === 'clear') {
        await axios.put(`${config.ENDPOINTS.TABLES}/${selectedTable.id}`, { status: 'available' });
        toast.success(`Table ${selectedTable.label} cleared`);
        fetchData();
      } else if (action === 'bill') {
        if (selectedTable.currentOrder) {
            navigate(`/pos?tableId=${selectedTable.id}&orderId=${selectedTable.currentOrder}&type=dine-in&tableLabel=${selectedTable.label}`);
        } else {
            toast.error("No active order for this table.");
        }
      }
    } catch (error) {
      console.error('Action failed:', error);
      toast.error('Action failed: ' + (error.response?.data?.message || error.message));
    }
    setSelectedTable(null);
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-2">Loading Floor Plan...</span>
      </Container>
    );
  }

  return (
    <div className="seating-page-bs">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
         <h2 className="mb-1 fw-bold">Floor Management</h2>
          <p className="text-muted mb-0">Book tables, manage orders, and track service status</p>
        </div>
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <div className="d-flex gap-2">
            <Badge bg="success-subtle" className="text-success border border-success-subtle px-2 py-1">Available</Badge>
            <Badge bg="danger-subtle" className="text-danger border border-danger-subtle px-2 py-1">Occupied</Badge>
            <Badge bg="warning-subtle" className="text-warning-emphasis border border-warning-subtle px-2 py-1">Reserved</Badge>
            <Badge bg="info-subtle" className="text-info-emphasis border border-info-subtle px-2 py-1">Cleaning</Badge>
          </div>
          <ToggleButtonGroup
            type="radio"
            name="view-mode"
            value={viewMode}
            onChange={setViewMode}
            className="rounded-pill"
          >
            <ToggleButton
              id="tbg-btn-1"
              value="editor"
              variant={viewMode === 'editor' ? 'primary' : 'outline-primary'}
              size="sm"
              className="rounded-pill px-3"
            >
              🎨 Editor View
            </ToggleButton>
            <ToggleButton
              id="tbg-btn-2"
              value="list"
              variant={viewMode === 'list' ? 'primary' : 'outline-primary'}
              size="sm"
              className="rounded-pill px-3"
            >
              📋 Direct View
            </ToggleButton>
          </ToggleButtonGroup>
          <Button variant="outline-primary" onClick={fetchData} size="sm" className="rounded-pill px-3">
            Refresh Status
          </Button>
        </div>
      </div>

      {viewMode === 'editor' ? (
        <Card className="shadow-sm border-0 floor-plan-card-bs">
          <Card.Body className="p-0 overflow-hidden">
            <div className="floor-plan-container">
              <SeatingPreview 
                layout={layout} 
                tables={tableStatuses}
                onTableClick={handleTableClick}
              />
            </div>
          </Card.Body>
        </Card>
      ) : (
        <Card className="shadow-sm border-0">
          <Card.Body className="p-4">
            <h5 className="mb-3 fw-bold text-primary">Floor-wise Table Overview</h5>
            {layout?.floors?.map(floor => {
              const floorTables = floor.tables || [];
              if (floorTables.length === 0) return null;
              
              return (
                <div key={floor.id} className="mb-4">
                  <div className="d-flex align-items-center mb-3 p-3 bg-light rounded-3">
                    <h6 className="mb-0 fw-bold text-dark">🏢 {floor.name}</h6>
                    <Badge bg="secondary" className="ms-2">
                      {floorTables.length} table{floorTables.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  
                  <Row className="g-3">
                    {floorTables.map(table => {
                      const tableStatus = tableStatuses.find(t => t.tableId === table.id);
                      const status = tableStatus?.status || 'available';
                      const statusColors = {
                        available: 'success',
                        occupied: 'danger',
                        reserved: 'warning',
                        cleaning: 'info'
                      };
                      const statusIcons = {
                        available: '✅',
                        occupied: '🍽️',
                        reserved: '📅',
                        cleaning: '🧹'
                      };
                      
                      return (
                        <Col key={table.id} xs={6} md={4} lg={3}>
                          <Card 
                            className="h-100 table-card shadow-sm"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleTableClick(table)}
                          >
                            <Card.Body className="p-3 d-flex flex-column">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <Badge 
                                  bg={statusColors[status] + '-subtle'} 
                                  text={statusColors[status]}
                                  className={`border border-${statusColors[status]}-subtle`}
                                >
                                  {statusIcons[status]} {status.charAt(0).toUpperCase() + status.slice(1)}
                                </Badge>
                                <Badge bg="primary" className="ms-2">
                                  👥 {table.capacity || 4}
                                </Badge>
                              </div>
                              
                              <h6 className="mb-1 fw-bold text-dark">{table.label}</h6>
                              <small className="text-muted">Table ID: {table.id}</small>
                              
                              <div className="mt-auto pt-2">
                                <small className="text-muted">
                                  Dimensions: {table.width}×{table.height}px
                                </small>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      );
                    })}
                  </Row>
                </div>
              );
            })}
            
            {(!layout?.floors || layout.floors.length === 0 || layout.floors.every(f => !f.tables || f.tables.length === 0)) && (
              <div className="text-center py-5">
                <div className="text-muted mb-3">📋</div>
                <h6 className="text-muted">No tables configured</h6>
                <p className="text-muted small">Go to the layout editor to add tables to your floors</p>
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {selectedTable && (
        <TableActionModal 
          table={selectedTable}
          onClose={() => setSelectedTable(null)}
          onAction={handleTableAction}
        />
      )}
    </div>
  );
};

export default Seating;
