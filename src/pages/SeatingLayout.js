import React, { useState, useEffect, useCallback, useRef } from 'react';
import Draggable from 'react-draggable';
import axios from 'axios';
import toast from 'react-hot-toast';
import config from '../config';
import { Button, Form, Nav, Badge, Spinner, Alert, Row, Col } from 'react-bootstrap';
import ConfirmModal from '../components/ConfirmModal';
import './SeatingLayout.css';

const SeatingLayout = () => {
  const [layout, setLayout] = useState({
    floors: [{
      id: 'floor-1',
      name: 'Main Floor',
      canvasWidth: 1200,
      canvasHeight: 800,
      tables: [],
      backgroundImage: ''
    }]
  });
  const [activeFloorId, setActiveFloorId] = useState('floor-1');
  const [selectedTable, setSelectedTable] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [floorToDelete, setFloorToDelete] = useState(null);
  const [newTableType, setNewTableType] = useState({
    shape: 'rectangle',
    width: 100,
    height: 80,
    capacity: 4
  });
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const fetchLayout = useCallback(async () => {
    try {
      const response = await axios.get(config.ENDPOINTS.SEATING_LAYOUT);
      const data = response.data;
      
      if (data.floors && data.floors.length > 0) {
        setLayout(data);
        setActiveFloorId(data.floors[0].id);
      } else if (data.tables) {
        // Handle migration if data is in old format
        setLayout({
          floors: [{
            id: 'floor-1',
            name: 'Main Floor',
            canvasWidth: data.canvasWidth || 1200,
            canvasHeight: data.canvasHeight || 800,
            tables: data.tables || [],
            backgroundImage: data.backgroundImage || ''
          }]
        });
        setActiveFloorId('floor-1');
      } else {
        // Set default if no data
        setLayout({
          floors: [{
            id: 'floor-1',
            name: 'Main Floor',
            canvasWidth: 1200,
            canvasHeight: 800,
            tables: [],
            backgroundImage: ''
          }]
        });
        setActiveFloorId('floor-1');
      }
    } catch (error) {
      console.error('Error fetching layout:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLayout();
  }, [fetchLayout]);

  const activeFloor = layout?.floors?.find(f => f.id === activeFloorId) || null;

  const updateActiveFloor = (updates) => {
    if (!layout?.floors) return;
    const updatedFloors = layout.floors.map(f => 
      f.id === activeFloorId ? { ...f, ...updates } : f
    );
    setLayout({ ...layout, floors: updatedFloors });
  };

  const saveLayout = async () => {
    try {
      await axios.post(config.ENDPOINTS.SEATING_LAYOUT, layout);
      toast.success('Layout saved successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save layout');
    }
  };

  const handleTableDrag = (tableId, data) => {
    if (!activeFloor) return;
    const updatedTables = activeFloor.tables.map(t => 
      t.id === tableId ? { ...t, x: data.x, y: data.y } : t
    );
    updateActiveFloor({ tables: updatedTables });
  };

  const handleAddTable = (e) => {
    if (!activeFloor || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - newTableType.width / 2;
    const y = e.clientY - rect.top - newTableType.height / 2;

    const nextNumber = activeFloor.tables.length > 0 
      ? Math.max(...activeFloor.tables.map(t => {
          const match = t.label.match(/\d+/);
          return match ? parseInt(match[0]) : 0;
        })) + 1 
      : 1;

    const newTable = {
      id: `table-${Date.now()}`,
      label: `T${nextNumber}`,
      x: Math.min(Math.max(0, x), activeFloor.canvasWidth - newTableType.width),
      y: Math.min(Math.max(0, y), activeFloor.canvasHeight - newTableType.height),
      width: newTableType.width,
      height: newTableType.height,
      capacity: newTableType.capacity,
      shape: newTableType.shape,
      rotation: 0
    };

    updateActiveFloor({ tables: [...activeFloor.tables, newTable] });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleAddTable(e);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post(`${config.API_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateActiveFloor({ backgroundImage: response.data.url });
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload image');
    }
  };

  const handleRemoveBackgroundImage = () => {
    updateActiveFloor({ backgroundImage: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddFloor = () => {
    const newFloorId = `floor-${Date.now()}`;
    const newFloor = {
      id: newFloorId,
      name: `Floor ${layout.floors.length + 1}`,
      canvasWidth: 1200,
      canvasHeight: 800,
      tables: [],
      backgroundImage: ''
    };
    setLayout({ ...layout, floors: [...layout.floors, newFloor] });
    setActiveFloorId(newFloorId);
  };

  const handleDeleteFloor = (floorId) => {
    if (layout.floors.length <= 1) {
      toast.error("Cannot delete the last floor.");
      return;
    }
    setFloorToDelete(floorId);
    setShowConfirmModal(true);
  };

  const confirmDeleteFloor = () => {
    if (!floorToDelete) return;
    const updatedFloors = layout.floors.filter(f => f.id !== floorToDelete);
    setLayout({ ...layout, floors: updatedFloors });
    if (activeFloorId === floorToDelete) {
      setActiveFloorId(updatedFloors[0].id);
    }
    setShowConfirmModal(false);
    setFloorToDelete(null);
  };

  const deleteTable = (id) => {
    if (!activeFloor) return;
    const updatedTables = activeFloor.tables.filter(t => t.id !== id);
    updateActiveFloor({ tables: updatedTables });
    setSelectedTable(null);
  };

  const updateSelectedTable = (updates) => {
    if (!activeFloor || !selectedTable) return;
    const updatedTables = activeFloor.tables.map(t => 
      t.id === selectedTable.id ? { ...t, ...updates } : t
    );
    updateActiveFloor({ tables: updatedTables });
    setSelectedTable({ ...selectedTable, ...updates });
  };

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" className="mb-3" />
        <p className="text-muted fw-medium">Loading Layout Editor...</p>
      </div>
    );
  }

  if (!activeFloor) return <div className="p-5 text-center">No floor layout found.</div>;

  return (
    <div className="seating-editor-page bg-light vh-100 d-flex flex-column overflow-hidden">
      <ConfirmModal
        show={showConfirmModal}
        onHide={() => {
          setShowConfirmModal(false);
          setFloorToDelete(null);
        }}
        onConfirm={confirmDeleteFloor}
        title="Delete Floor"
        message="Are you sure you want to delete this floor? All tables on it will be removed."
        confirmText="Delete"
      />
      {/* Top Header */}
      <div className="bg-white border-bottom px-4 py-2 d-flex justify-content-between align-items-center gap-2 shadow-sm" style={{ zIndex: 100 }}>
        <div>
          <h1 className="h5 fw-bold mb-0 text-primary">Seating Layout Editor</h1>
          <p className="text-muted small mb-0">Design and manage restaurant floor plans</p>
        </div>
        <div className="d-flex gap-3 align-items-center">
          <Badge bg="primary" className="d-flex align-items-center px-3 py-2 rounded-pill shadow-sm">
            <span className="small opacity-75 me-2">Active Floor:</span> {activeFloor.name}
          </Badge>
          <Button variant="success" size="sm" onClick={saveLayout} className="px-4 fw-bold rounded-pill shadow-sm">
            💾 Save Changes
          </Button>
        </div>
      </div>

      <div className="d-flex flex-grow-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="bg-white border-end shadow-sm d-flex flex-column" style={{ width: '320px', minWidth: '320px', zIndex: 90 }}>
          <div className="overflow-auto flex-grow-1 p-3 custom-scrollbar">
            {/* Floor Management (Merged) */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <label className="small fw-bold text-muted text-uppercase ls-1">Floor Management</label>
                <Button variant="link" size="sm" className="p-0 text-primary fw-bold text-decoration-none" onClick={handleAddFloor}>
                  + Add New
                </Button>
              </div>
              
              <div className="bg-light p-3 rounded-4 border shadow-sm">
                <div className="mb-3">
                  <label className="small text-muted mb-2 fw-bold d-block" style={{ fontSize: '0.7rem' }}>SWITCH FLOOR</label>
                  <Nav variant="pills" className="flex-row flex-wrap gap-1">
                    {layout.floors.map(floor => (
                      <Nav.Item key={floor.id}>
                        <Nav.Link 
                          active={activeFloorId === floor.id}
                          onClick={() => setActiveFloorId(floor.id)}
                          className="rounded-pill py-1 px-3 border-0"
                          style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                        >
                          {floor.name}
                        </Nav.Link>
                      </Nav.Item>
                    ))}
                  </Nav>
                </div>

                <hr className="my-2 opacity-10" />

                <Form.Group className="mb-2">
                  <Form.Label className="small text-muted mb-1 fw-bold">Floor Name</Form.Label>
                  <Form.Control 
                    size="sm"
                    type="text" 
                    value={activeFloor.name}
                    onChange={(e) => updateActiveFloor({ name: e.target.value })}
                    className="bg-white border shadow-none"
                  />
                </Form.Group>
                
                <Form.Group className="mb-2">
                  <Form.Label className="small text-muted mb-1 fw-bold">Background Image</Form.Label>
                  <div className="d-flex gap-2 align-items-center">
                    <Form.Control 
                       size="sm"
                       type="file" 
                       accept="image/*"
                       onChange={handleImageUpload}
                       ref={fileInputRef}
                       className="bg-white border shadow-none small"
                     />
                    {activeFloor.backgroundImage && (
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        onClick={handleRemoveBackgroundImage}
                        title="Remove background image"
                        className="px-2"
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                </Form.Group>

                {layout.floors.length > 1 && (
                  <div className="mt-2 pt-2 border-top text-end">
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="text-danger p-0 small text-decoration-none fw-bold"
                      onClick={() => handleDeleteFloor(activeFloorId)}
                      style={{ fontSize: '0.75rem' }}
                    >
                      🗑️ Delete Current Floor
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <hr className="my-3 opacity-10" />

            {/* Selected Table / Add Table Tools */}
            <div className="mb-2">
              {selectedTable ? (
                <div className="animate-in bg-light p-3 rounded-4 border">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <label className="small fw-bold text-primary text-uppercase ls-1">Table Details</label>
                    <Button variant="link" size="sm" className="p-0 text-muted" onClick={() => setSelectedTable(null)}>✕</Button>
                  </div>
                  <Form.Group className="mb-3">
                    <Form.Label className="small text-muted mb-1 fw-bold">Label</Form.Label>
                    <Form.Control 
                      size="sm"
                      type="text" 
                      value={selectedTable.label}
                      onChange={(e) => updateSelectedTable({ label: e.target.value })}
                      className="bg-white border shadow-none"
                    />
                  </Form.Group>
                  <Row className="g-2 mb-3">
                    <Col xs={4}>
                      <Form.Group>
                        <Form.Label className="small text-muted mb-1 fw-bold">Width</Form.Label>
                        <Form.Control 
                          size="sm"
                          type="number" 
                          value={selectedTable.width}
                          onChange={(e) => updateSelectedTable({ width: parseInt(e.target.value) })}
                          className="bg-white border shadow-none px-1 text-center"
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={4}>
                      <Form.Group>
                        <Form.Label className="small text-muted mb-1 fw-bold">Height</Form.Label>
                        <Form.Control 
                          size="sm"
                          type="number" 
                          value={selectedTable.height}
                          onChange={(e) => updateSelectedTable({ height: parseInt(e.target.value) })}
                          className="bg-white border shadow-none px-1 text-center"
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={4}>
                      <Form.Group>
                        <Form.Label className="small text-muted mb-1 fw-bold">Cap.</Form.Label>
                        <Form.Control 
                          size="sm"
                          type="number" 
                          value={selectedTable.capacity}
                          onChange={(e) => updateSelectedTable({ capacity: parseInt(e.target.value) })}
                          className="bg-white border shadow-none px-1 text-center"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <div className="d-grid gap-2">
                    <Button variant="danger" size="sm" className="fw-bold rounded-3 py-2" onClick={() => deleteTable(selectedTable.id)}>
                      🗑️ Delete Table
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="small fw-bold text-muted text-uppercase ls-1 mb-3 d-block">Add New Table</label>
                  <div className="text-center mb-2 bg-light p-3 rounded-4 border border-dashed border-primary border-opacity-25">
                    <div 
                      className={`draggable-source mx-auto mb-2 d-flex align-items-center justify-content-center text-white shadow ${newTableType.shape}`}
                      draggable="true"
                      onDragStart={(e) => e.dataTransfer.setData('text/plain', 'table')}
                      style={{ 
                        width: '64px', 
                        height: '64px', 
                        backgroundColor: '#10b981',
                        border: '3px solid #374151',
                        borderRadius: newTableType.shape === 'circle' ? '50%' : '8px',
                        cursor: 'grab',
                        fontSize: '1.2rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {newTableType.capacity}
                    </div>
                    <p className="small text-primary fw-bold mb-0" style={{ fontSize: '0.7rem' }}>DRAG TO CANVAS</p>
                  </div>

                  <div className="bg-light p-3 rounded-4 border mb-3">
                    <Form.Group className="mb-3">
                      <Form.Label className="small text-muted mb-1 fw-bold">Shape</Form.Label>
                      <Form.Select 
                        size="sm"
                        value={newTableType.shape}
                        onChange={(e) => {
                          const shape = e.target.value;
                          let width = 100, height = 80;
                          if (shape === 'circle' || shape === 'square') { width = 80; height = 80; }
                          setNewTableType({...newTableType, shape, width, height});
                        }}
                        className="bg-white border shadow-none"
                      >
                        <option value="rectangle">Rectangle</option>
                        <option value="circle">Circle</option>
                        <option value="square">Square</option>
                      </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-0">
                      <Form.Label className="small text-muted mb-1 fw-bold">Default Capacity</Form.Label>
                      <Form.Control 
                        size="sm"
                        type="number" 
                        value={newTableType.capacity}
                        onChange={(e) => setNewTableType({...newTableType, capacity: parseInt(e.target.value)})}
                        className="bg-white border shadow-none"
                      />
                    </Form.Group>
                  </div>
                  <Alert variant="info" className="border-0 small py-2 px-3 mb-0 text-center rounded-3 shadow-sm" style={{ fontSize: '0.75rem' }}>
                    💡 <strong>Quick Tip:</strong> Click on the canvas to quickly add a table.
                  </Alert>
                </div>
              )}
            </div>

          </div>

          {/* Sidebar Footer Stats */}
          <div className="p-3 bg-white border-top mt-auto shadow-sm" style={{ backgroundColor: '#f8f9fa' }}>
            <div className="d-flex justify-content-between mb-1">
              <span className="small text-muted fw-medium">Total Tables:</span>
              <span className="small fw-bold text-primary">{activeFloor.tables.length}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="small text-muted fw-medium">Total Capacity:</span>
              <span className="small fw-bold text-primary">{activeFloor.tables.reduce((sum, t) => sum + (t.capacity || 0), 0)}</span>
            </div>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-grow-1 bg-light position-relative overflow-hidden d-flex flex-column">
          <div 
            className="canvas-container flex-grow-1 d-block"
            onDragOver={handleDragOver} 
            onDrop={handleDrop}
            style={{ 
              overflow: 'auto', 
              backgroundColor: '#e9ecef',
              padding: '20px', /* Add significant padding to allow scrolling past edges */
              scrollBehavior: 'smooth'
            }}
          >
            <div 
              className="layout-canvas shadow-lg bg-white position-relative mx-auto"
              ref={canvasRef}
              style={{
                width: `${activeFloor.canvasWidth}px`,
                height: `${activeFloor.canvasHeight}px`,
                backgroundImage: activeFloor.backgroundImage ? `url(${activeFloor.backgroundImage})` : undefined,
                backgroundSize: activeFloor.backgroundImage ? 'cover' : undefined,
                cursor: 'crosshair',
                border: '1px solid #dee2e6',
                flexShrink: 0
              }}
              onClick={(e) => {
                if (e.target === canvasRef.current) { handleAddTable(e); }
                setSelectedTable(null);
              }}
            >
              {activeFloor.tables.map((table) => (
                <Draggable
                  key={table.id}
                  position={{ x: table.x, y: table.y }}
                  onStop={(e, data) => handleTableDrag(table.id, data)}
                  bounds="parent"
                >
                  <div 
                    className={`table-item ${table.shape} ${selectedTable?.id === table.id ? 'selected' : ''} position-absolute`}
                    style={{
                      width: `${table.width}px`,
                      height: `${table.height}px`,
                      zIndex: selectedTable?.id === table.id ? 10 : 1
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTable(table);
                    }}
                  >
                    <div className="table-label">{table.label}</div>
                    <div className="capacity-badge">{table.capacity}</div>
                  </div>
                </Draggable>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatingLayout;

