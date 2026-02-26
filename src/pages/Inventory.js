import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Table, 
  Button, 
  Form, 
  Modal, 
  Badge, 
  Spinner,
  InputGroup
} from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import './Inventory.css';

const Inventory = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    quantity: 0,
    unit: 'pcs',
    minThreshold: 10,
    costPrice: 0,
    category: 'General',
    supplier: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [aiInsights, setAiInsights] = useState([]);

  useEffect(() => {
    fetchInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAiInsights = async () => {
    try {
      const response = await axios.get(`${config.ENDPOINTS.INVENTORY}/insights`);
      setAiInsights(response.data);
    } catch (error) {
      console.error('Error fetching AI insights:', error);
    }
  };

  const categories = ['All', ...new Set(items.map(item => item.category))];

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const fetchInventory = async () => {
    try {
      const response = await axios.get(config.ENDPOINTS.INVENTORY);
      setItems(response.data);
      fetchAiInsights();
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await axios.put(`${config.ENDPOINTS.INVENTORY}/${editItem._id}`, formData);
      } else {
        await axios.post(config.ENDPOINTS.INVENTORY, formData);
      }
      setShowModal(false);
      setEditItem(null);
      setFormData({
        name: '',
        quantity: 0,
        unit: 'pcs',
        minThreshold: 10,
        costPrice: 0,
        category: 'General',
        supplier: ''
      });
      toast.success(`Inventory item ${editItem ? 'updated' : 'added'}`);
      fetchInventory();
    } catch (error) {
      toast.error('Failed to save item');
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setFormData({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      minThreshold: item.minThreshold,
      costPrice: item.costPrice,
      category: item.category,
      supplier: item.supplier
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    setItemToDelete(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await axios.delete(`${config.ENDPOINTS.INVENTORY}/${itemToDelete}`);
      toast.success('Item deleted');
      fetchInventory();
    } catch (error) {
      toast.error('Failed to delete item');
    } finally {
      setItemToDelete(null);
      setShowConfirmModal(false);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-3">Loading inventory...</span>
      </Container>
    );
  }

  const canManageInventory = ['superadmin', 'owner', 'manager'].includes(user?.role);
  const canEditQuantity = ['superadmin', 'owner', 'manager', 'kitchen_staff'].includes(user?.role);

  return (
    <div className="inventory-page">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
         <h2 className="mb-1 fw-bold">Inventory Management</h2>
          <p className="text-muted mb-0">Track stock levels, suppliers, and reorder points.</p>
        </div>
        <div className="d-flex gap-3 flex-wrap align-items-center">
          <InputGroup style={{ maxWidth: '300px' }}>
            <InputGroup.Text className="bg-white border-end-0">
              🔍
            </InputGroup.Text>
            <Form.Control
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-start-0"
            />
          </InputGroup>
          
          <Form.Select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{ width: 'auto' }}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </Form.Select>

          {canManageInventory && (
            <Button variant="primary" onClick={() => { setEditItem(null); setShowModal(true); }}>
              + New Item
            </Button>
          )}
        </div>
      </div>

      {aiInsights.length > 0 && (
        <Card className="shadow-sm border-0 mb-4 bg-light">
          <Card.Body>
            <div className="d-flex align-items-center mb-3">
              <span className="me-2 fs-4">✨</span>
              <h3 className="h5 mb-0">AI Smart Reorder Suggestions</h3>
            </div>
            <Row className="g-3">
              {aiInsights.map((insight, idx) => (
                <Col key={idx} md={6} lg={4}>
                  <Card className={`h-100 border-0 shadow-sm border-start border-4 ${
                    insight.priority === 'high' ? 'border-danger' : 
                    insight.priority === 'medium' ? 'border-warning' : 'border-info'
                  }`}>
                    <Card.Body className="d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-bold">{insight.name}</div>
                        <div className="small text-muted">{insight.suggestion}</div>
                      </div>
                      <Button variant="outline-primary" size="sm" disabled={!canManageInventory}>
                        Create PO
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      )}

      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3">Item Name</th>
                  <th className="py-3">Category</th>
                  <th className="py-3 text-center">Stock</th>
                  <th className="py-3">Unit</th>
                  <th className="py-3">Threshold</th>
                  <th className="py-3">Price</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-end px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => (
                  <tr key={item._id} className={item.quantity <= item.minThreshold ? 'table-warning' : ''}>
                    <td className="px-4">
                      <div className="fw-bold">{item.name}</div>
                      <div className="small text-muted">{item.supplier || 'No supplier'}</div>
                    </td>
                    <td>
                      <Badge bg="secondary" className="fw-normal">{item.category}</Badge>
                    </td>
                    <td className="text-center">
                      <span className={`fw-bold ${item.quantity <= item.minThreshold ? 'text-danger' : ''}`}>
                        {item.quantity}
                      </span>
                    </td>
                    <td>{item.unit}</td>
                    <td>{item.minThreshold}</td>
                    <td>₹{item.costPrice.toFixed(2)}</td>
                    <td>
                      <Badge bg={item.quantity <= item.minThreshold ? 'danger' : 'success'} pill>
                        {item.quantity <= item.minThreshold ? 'Low Stock' : 'In Stock'}
                      </Badge>
                    </td>
                    <td className="text-end px-4">
                      <div className="d-flex justify-content-end gap-2">
                        {canEditQuantity && (
                          <Button variant="link" className="p-0 text-primary" onClick={() => handleEdit(item)} title="Edit Item">
                            ✏️
                          </Button>
                        )}
                        {canManageInventory && (
                          <Button variant="link" className="p-0 text-danger" onClick={() => handleDelete(item._id)} title="Delete Item">
                            🗑️
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <ConfirmModal
        show={showConfirmModal}
        onHide={() => {
          setShowConfirmModal(false);
          setItemToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Item"
        message="Are you sure you want to delete this inventory item?"
        confirmText="Delete"
      />

      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton className="">
          <Modal.Title>{editItem ? 'Edit Item' : 'Add New Item'}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-4">
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Item Name</Form.Label>
              <Form.Control
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                disabled={!canManageInventory && editItem}
              />
            </Form.Group>
            
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Quantity</Form.Label>
                  <Form.Control
                    type="number" 
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseFloat(e.target.value)})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Unit</Form.Label>
                  <Form.Select 
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    disabled={!canManageInventory && editItem}
                  >
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="g">Grams (g)</option>
                    <option value="liters">Liters (l)</option>
                    <option value="ml">Milliliters (ml)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Min Threshold</Form.Label>
                  <Form.Control
                    type="number" 
                    value={formData.minThreshold}
                    onChange={(e) => setFormData({...formData, minThreshold: parseFloat(e.target.value)})}
                    required
                    disabled={!canManageInventory && editItem}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Price (per unit)</Form.Label>
                  <Form.Control
                    type="number" 
                    value={formData.costPrice}
                    onChange={(e) => setFormData({...formData, costPrice: parseFloat(e.target.value)})}
                    required
                    disabled={!canManageInventory && editItem}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Control
                type="text" 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                placeholder="e.g. Vegetables, Meat, Dairy"
                disabled={!canManageInventory && editItem}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Supplier</Form.Label>
              <Form.Control
                type="text" 
                value={formData.supplier}
                onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                disabled={!canManageInventory && editItem}
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="light" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editItem ? 'Update Item' : 'Save Item'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Inventory;
