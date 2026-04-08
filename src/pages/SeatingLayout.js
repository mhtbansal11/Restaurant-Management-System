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

  const activeFloor = layout?.floors?.find((floor) => floor.id === activeFloorId) || null;

  const updateActiveFloor = (updates) => {
    if (!layout?.floors) return;
    const updatedFloors = layout.floors.map((floor) =>
      floor.id === activeFloorId ? { ...floor, ...updates } : floor
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
    const updatedTables = activeFloor.tables.map((table) =>
      table.id === tableId ? { ...table, x: data.x, y: data.y } : table
    );
    updateActiveFloor({ tables: updatedTables });
  };

  const handleAddTable = (e) => {
    if (!activeFloor || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - newTableType.width / 2;
    const y = e.clientY - rect.top - newTableType.height / 2;

    const nextNumber = activeFloor.tables.length > 0
      ? Math.max(...activeFloor.tables.map((table) => {
          const match = table.label.match(/\d+/);
          return match ? parseInt(match[0], 10) : 0;
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
      toast.error('Cannot delete the last floor.');
      return;
    }
    setFloorToDelete(floorId);
    setShowConfirmModal(true);
  };

  const confirmDeleteFloor = () => {
    if (!floorToDelete) return;
    const updatedFloors = layout.floors.filter((floor) => floor.id !== floorToDelete);
    setLayout({ ...layout, floors: updatedFloors });
    if (activeFloorId === floorToDelete) {
      setActiveFloorId(updatedFloors[0].id);
    }
    setShowConfirmModal(false);
    setFloorToDelete(null);
  };

  const deleteTable = (id) => {
    if (!activeFloor) return;
    const updatedTables = activeFloor.tables.filter((table) => table.id !== id);
    updateActiveFloor({ tables: updatedTables });
    setSelectedTable(null);
  };

  const updateSelectedTable = (updates) => {
    if (!activeFloor || !selectedTable) return;
    const updatedTables = activeFloor.tables.map((table) =>
      table.id === selectedTable.id ? { ...table, ...updates } : table
    );
    updateActiveFloor({ tables: updatedTables });
    setSelectedTable({ ...selectedTable, ...updates });
  };

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant="primary" className="mb-3" />
        <p className="text-muted fw-medium">Loading Layout Editor...</p>
      </div>
    );
  }

  if (!activeFloor) {
    return <div className="p-5 text-center">No floor layout found.</div>;
  }

  return (
    <div className="seating-editor-page d-flex flex-column overflow-hidden">
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

      <div className="editor-toolbar">
        <div>
          <p className="editor-eyebrow mb-1">Floor Planner</p>
          <h1 className="h4 fw-bold mb-1 text-gradient page-title">Seating Layout Editor</h1>
          <p className="editor-subtitle page-subtitle mb-0">
            Design floor plans, place tables, and review seating capacity in one workspace.
          </p>
        </div>
        <div className="editor-toolbar-actions page-header-actions">
          <Badge className="editor-badge">
            <span className="editor-badge-label">Active Floor</span>
            <span className="editor-badge-value">{activeFloor.name}</span>
          </Badge>
          <Button variant="primary" size="sm" onClick={saveLayout} className="editor-save-btn">
            Save Changes
          </Button>
        </div>
      </div>

      <div className="seating-editor-shell d-flex overflow-hidden">
        <div className="seating-editor-sidebar d-flex flex-column">
          <div className="overflow-auto flex-grow-1 p-3 custom-scrollbar">
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <label className="section-label">Floor Management</label>
                <Button variant="link" size="sm" className="editor-link-btn" onClick={handleAddFloor}>
                  + Add New
                </Button>
              </div>

              <div className="editor-panel">
                <div className="mb-3">
                  <label className="field-label">Switch Floor</label>
                  <Nav variant="pills" className="editor-floor-nav">
                    {layout.floors.map((floor) => (
                      <Nav.Item key={floor.id}>
                        <Nav.Link
                          active={activeFloorId === floor.id}
                          onClick={() => setActiveFloorId(floor.id)}
                          className="editor-floor-pill"
                        >
                          {floor.name}
                        </Nav.Link>
                      </Nav.Item>
                    ))}
                  </Nav>
                </div>

                <hr className="editor-divider" />

                <Form.Group className="mb-3">
                  <Form.Label className="field-label">Floor Name</Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    value={activeFloor.name}
                    onChange={(e) => updateActiveFloor({ name: e.target.value })}
                    className="editor-input"
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label className="field-label">Background Image</Form.Label>
                  <div className="d-flex gap-2 align-items-center">
                    <Form.Control
                      size="sm"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      ref={fileInputRef}
                      className="editor-input small"
                    />
                    {activeFloor.backgroundImage && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={handleRemoveBackgroundImage}
                        title="Remove background image"
                        className="editor-icon-btn"
                      >
                        ×
                      </Button>
                    )}
                  </div>
                </Form.Group>

                {layout.floors.length > 1 && (
                  <div className="mt-3 pt-3 border-top text-end">
                    <Button
                      variant="link"
                      size="sm"
                      className="editor-danger-btn"
                      onClick={() => handleDeleteFloor(activeFloorId)}
                    >
                      Delete Current Floor
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <hr className="editor-divider my-3" />

            <div className="mb-2">
              {selectedTable ? (
                <div className="animate-in editor-panel">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <label className="section-label mb-0">Table Details</label>
                    <Button
                      variant="link"
                      size="sm"
                      className="editor-close-btn"
                      onClick={() => setSelectedTable(null)}
                    >
                      ×
                    </Button>
                  </div>

                  <Form.Group className="mb-3">
                    <Form.Label className="field-label">Label</Form.Label>
                    <Form.Control
                      size="sm"
                      type="text"
                      value={selectedTable.label}
                      onChange={(e) => updateSelectedTable({ label: e.target.value })}
                      className="editor-input"
                    />
                  </Form.Group>

                  <Row className="g-2 mb-3">
                    <Col xs={4}>
                      <Form.Group>
                        <Form.Label className="field-label">Width</Form.Label>
                        <Form.Control
                          size="sm"
                          type="number"
                          value={selectedTable.width}
                          onChange={(e) => updateSelectedTable({ width: parseInt(e.target.value, 10) })}
                          className="editor-input px-1 text-center"
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={4}>
                      <Form.Group>
                        <Form.Label className="field-label">Height</Form.Label>
                        <Form.Control
                          size="sm"
                          type="number"
                          value={selectedTable.height}
                          onChange={(e) => updateSelectedTable({ height: parseInt(e.target.value, 10) })}
                          className="editor-input px-1 text-center"
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={4}>
                      <Form.Group>
                        <Form.Label className="field-label">Cap.</Form.Label>
                        <Form.Control
                          size="sm"
                          type="number"
                          value={selectedTable.capacity}
                          onChange={(e) => updateSelectedTable({ capacity: parseInt(e.target.value, 10) })}
                          className="editor-input px-1 text-center"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-grid">
                    <Button variant="danger" size="sm" className="fw-bold rounded-3 py-2" onClick={() => deleteTable(selectedTable.id)}>
                      Delete Table
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="section-label mb-3 d-block">Add New Table</label>
                  <div className="editor-drop-preview text-center mb-3">
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
                    <p className="editor-hint mb-0">Drag to canvas</p>
                  </div>

                  <div className="editor-panel mb-3">
                    <Form.Group className="mb-3">
                      <Form.Label className="field-label">Shape</Form.Label>
                      <Form.Select
                        size="sm"
                        value={newTableType.shape}
                        onChange={(e) => {
                          const shape = e.target.value;
                          let width = 100;
                          let height = 80;
                          if (shape === 'circle' || shape === 'square') {
                            width = 80;
                            height = 80;
                          }
                          setNewTableType({ ...newTableType, shape, width, height });
                        }}
                        className="editor-input"
                      >
                        <option value="rectangle">Rectangle</option>
                        <option value="circle">Circle</option>
                        <option value="square">Square</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-0">
                      <Form.Label className="field-label">Default Capacity</Form.Label>
                      <Form.Control
                        size="sm"
                        type="number"
                        value={newTableType.capacity}
                        onChange={(e) => setNewTableType({ ...newTableType, capacity: parseInt(e.target.value, 10) })}
                        className="editor-input"
                      />
                    </Form.Group>
                  </div>

                  <Alert variant="info" className="editor-tip mb-0">
                    <strong>Quick tip:</strong> Click anywhere on the canvas to add a table instantly.
                  </Alert>
                </div>
              )}
            </div>
          </div>

          <div className="editor-stats-footer mt-auto">
            <div className="editor-stat-row">
              <span>Total Tables</span>
              <strong>{activeFloor.tables.length}</strong>
            </div>
            <div className="editor-stat-row">
              <span>Total Capacity</span>
              <strong>{activeFloor.tables.reduce((sum, table) => sum + (table.capacity || 0), 0)}</strong>
            </div>
          </div>
        </div>

        <div className="seating-editor-main position-relative overflow-hidden d-flex flex-column">
          <div className="canvas-header">
            <div>
              <h2 className="canvas-title mb-1">{activeFloor.name}</h2>
              <p className="canvas-subtitle mb-0">
                {activeFloor.tables.length} tables across a {activeFloor.canvasWidth} x {activeFloor.canvasHeight} canvas
              </p>
            </div>
          </div>

          <div className="canvas-container flex-grow-1 d-block" onDragOver={handleDragOver} onDrop={handleDrop}>
            <div
              className="layout-canvas position-relative mx-auto"
              ref={canvasRef}
              style={{
                width: `${activeFloor.canvasWidth}px`,
                height: `${activeFloor.canvasHeight}px`,
                backgroundImage: activeFloor.backgroundImage ? `url(${activeFloor.backgroundImage})` : undefined,
                backgroundSize: activeFloor.backgroundImage ? 'cover' : undefined,
                cursor: 'crosshair',
                flexShrink: 0
              }}
              onClick={(e) => {
                if (e.target === canvasRef.current) {
                  handleAddTable(e);
                }
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
