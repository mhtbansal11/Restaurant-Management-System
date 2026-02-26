import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import { Container, Row, Col, Card, Button, Form, Modal, Badge, Spinner, Alert, InputGroup } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import './Menu.css';

const Menu = () => {
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showAIUpload, setShowAIUpload] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Main Course',
    image: '',
    isAvailable: true,
    ingredients: []
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [filterCategory, setFilterCategory] = useState('All');

  useEffect(() => {
    fetchMenuItems();
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await axios.get(config.ENDPOINTS.INVENTORY);
      setInventory(response.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get(config.ENDPOINTS.MENU);
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAIUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select an image file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await axios.post(`${config.ENDPOINTS.MENU}/ai-extract`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success(`Successfully extracted ${response.data.items.length} menu items!`);
      setShowAIUpload(false);
      setSelectedFile(null);
      fetchMenuItems();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to extract menu items');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (showEditForm) {
        await axios.put(`${config.ENDPOINTS.MENU}/${editingId}`, formData);
        toast.success('Menu item updated');
        setShowEditForm(false);
        setEditingId(null);
      } else {
        await axios.post(config.ENDPOINTS.MENU, formData);
        toast.success('Menu item created');
        setShowAddForm(false);
      }
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'Main Course',
        image: '',
        isAvailable: true,
        ingredients: []
      });
      fetchMenuItems();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${showEditForm ? 'update' : 'create'} menu item`);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price,
      category: item.category,
      image: item.image || '',
      isAvailable: item.isAvailable,
      ingredients: item.ingredients || []
    });
    setEditingId(item._id);
    setShowEditForm(true);
  };

  const handleDelete = (id) => {
    setItemToDelete(id);
    setShowConfirmModal(true);
  };

  const handleToggleAvailability = async (item) => {
    try {
      await axios.put(`${config.ENDPOINTS.MENU}/${item._id}`, {
        ...item,
        isAvailable: !item.isAvailable
      });
      toast.success(`Item ${!item.isAvailable ? 'available' : 'unavailable'}`);
      fetchMenuItems();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update item');
    }
  };

  const handleOpenRecipe = (item) => {
    setSelectedItem(item);
    setShowRecipeModal(true);
  };

  const handleUpdateRecipe = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${config.ENDPOINTS.MENU}/${selectedItem._id}`, {
        ...selectedItem,
        ingredients: selectedItem.ingredients
      });
      toast.success('Recipe updated');
      setShowRecipeModal(false);
      fetchMenuItems();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update recipe');
    }
  };

  const addIngredient = (isNewItem = false) => {
    const newIngredient = { inventoryItemId: '', quantity: 1, unit: '' };
    if (isNewItem) {
      setFormData({
        ...formData,
        ingredients: [...formData.ingredients, newIngredient]
      });
    } else {
      setSelectedItem({
        ...selectedItem,
        ingredients: [...selectedItem.ingredients, newIngredient]
      });
    }
  };

  const updateIngredient = (index, field, value, isNewItem = false) => {
    if (isNewItem) {
      const newIngredients = [...formData.ingredients];
      newIngredients[index][field] = value;
      if (field === 'inventoryItemId') {
        const item = inventory.find(i => i._id === value);
        if (item) newIngredients[index].unit = item.unit;
      }
      setFormData({ ...formData, ingredients: newIngredients });
    } else {
      const newIngredients = [...selectedItem.ingredients];
      newIngredients[index][field] = value;
      if (field === 'inventoryItemId') {
        const item = inventory.find(i => i._id === value);
        if (item) newIngredients[index].unit = item.unit;
      }
      setSelectedItem({ ...selectedItem, ingredients: newIngredients });
    }
  };

  const removeIngredient = (index, isNewItem = false) => {
    if (isNewItem) {
      const newIngredients = formData.ingredients.filter((_, i) => i !== index);
      setFormData({ ...formData, ingredients: newIngredients });
    } else {
      const newIngredients = selectedItem.ingredients.filter((_, i) => i !== index);
      setSelectedItem({ ...selectedItem, ingredients: newIngredients });
    }
  };

  const categories = ['All', 'Appetizers', 'Main Course', 'Desserts', 'Beverages', 'Salads', 'Soups', 'Other'];
  const filteredItems = filterCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === filterCategory);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  const canManageMenu = ['superadmin', 'owner', 'manager'].includes(user?.role);
  const canToggleAvailability = ['superadmin', 'owner', 'manager', 'kitchen_staff'].includes(user?.role);

  return (
    <div className="menu-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        
         <h2 className="mb-1 fw-bold">Menu Management</h2>
        {canManageMenu && (
          <div className="d-flex gap-2">
            <Button variant="success" onClick={() => setShowAIUpload(true)}>
              📸 Upload Menu Photo (AI)
            </Button>
            <Button variant="primary" onClick={() => setShowAddForm(true)}>
              + Add Item
            </Button>
          </div>
        )}
      </div>

      <ConfirmModal
        show={showConfirmModal}
        onHide={() => {
          setShowConfirmModal(false);
          setItemToDelete(null);
        }}
        onConfirm={async () => {
          try {
            await axios.delete(`${config.ENDPOINTS.MENU}/${itemToDelete}`);
            toast.success('Menu item deleted');
            fetchMenuItems();
            setShowConfirmModal(false);
            setItemToDelete(null);
          } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete item');
          }
        }}
        title="Delete Menu Item"
        message="Are you sure you want to delete this menu item?"
        confirmText="Delete"
      />

      {/* AI Upload Modal */}
      <Modal show={showAIUpload} onHide={() => setShowAIUpload(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Upload Menu Photo (AI Extraction)</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form id="ai-upload-form" onSubmit={handleAIUpload}>
            <Form.Group className="mb-3">
              <Form.Label>Select Menu Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                required
              />
              <Form.Text className="text-muted">
                AI will automatically extract menu items from the image
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAIUpload(false)}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="ai-upload-form" disabled={uploading}>
            {uploading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                Processing...
              </>
            ) : 'Extract Items'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add/Edit Menu Item Modal */}
      <Modal show={showAddForm || showEditForm} onHide={() => { setShowAddForm(false); setShowEditForm(false); setEditingId(null); }} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{showEditForm ? 'Edit Menu Item' : 'Add Menu Item'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form id="menu-form" onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name *</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Price *</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>₹</InputGroup.Text>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Category *</Form.Label>
                  <Form.Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="Appetizers">Appetizers</option>
                    <option value="Main Course">Main Course</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Salads">Salads</option>
                    <option value="Soups">Soups</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Image URL</Form.Label>
              <Form.Control
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </Form.Group>

            <div className="bg-light p-3 rounded mb-3">
              <h5 className="mb-3">Ingredients / Recipe</h5>
              {formData.ingredients.map((ing, index) => (
                <Row key={index} className="g-2 mb-2 align-items-center">
                  <Col md={6}>
                    <Form.Select
                      value={ing.inventoryItemId}
                      onChange={(e) => updateIngredient(index, 'inventoryItemId', e.target.value, true)}
                      required
                      size="sm"
                    >
                      <option value="">Select Item</option>
                      {inventory.map(inv => (
                        <option key={inv._id} value={inv._id}>{inv.name}</option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={3}>
                    <Form.Control
                      type="number"
                      value={ing.quantity}
                      onChange={(e) => updateIngredient(index, 'quantity', e.target.value, true)}
                      placeholder="Qty"
                      required
                      size="sm"
                    />
                  </Col>
                  <Col md={2}>
                    <span className="small text-muted">{ing.unit}</span>
                  </Col>
                  <Col md={1}>
                    <Button variant="outline-danger" size="sm" onClick={() => removeIngredient(index, true)}>
                      &times;
                    </Button>
                  </Col>
                </Row>
              ))}
              <Button variant="outline-primary" size="sm" onClick={() => addIngredient(true)} className="mt-2 w-100">
                + Add Ingredient
              </Button>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShowAddForm(false); setShowEditForm(false); setEditingId(null); }}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="menu-form">
            {showEditForm ? 'Update Item' : 'Add Item'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Recipe Modal */}
      <Modal show={showRecipeModal} onHide={() => setShowRecipeModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Manage Recipe: {selectedItem?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form id="recipe-form" onSubmit={handleUpdateRecipe}>
            <div className="bg-light p-3 rounded">
              {selectedItem?.ingredients.map((ing, index) => (
                <Row key={index} className="g-2 mb-2 align-items-center">
                  <Col md={6}>
                    <Form.Select
                      value={ing.inventoryItemId}
                      onChange={(e) => updateIngredient(index, 'inventoryItemId', e.target.value)}
                      required
                      size="sm"
                    >
                      <option value="">Select Item</option>
                      {inventory.map(inv => (
                        <option key={inv._id} value={inv._id}>{inv.name}</option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={3}>
                    <Form.Control
                      type="number"
                      value={ing.quantity}
                      onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                      placeholder="Qty"
                      required
                      size="sm"
                    />
                  </Col>
                  <Col md={2}>
                    <span className="small text-muted">{ing.unit}</span>
                  </Col>
                  <Col md={1}>
                    <Button variant="outline-danger" size="sm" onClick={() => removeIngredient(index)}>
                      &times;
                    </Button>
                  </Col>
                </Row>
              ))}
              <Button variant="outline-primary" size="sm" onClick={() => addIngredient()} className="mt-2 w-100">
                + Add Ingredient
              </Button>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRecipeModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="recipe-form">
            Save Recipe
          </Button>
        </Modal.Footer>
      </Modal>

      <Row className="mb-4">
        <Col md={4} lg={3}>
          <Form.Group>
            <Form.Label className="small fw-bold text-muted text-uppercase">Filter by Category</Form.Label>
            <Form.Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {filteredItems.length === 0 ? (
        <Alert variant="info" className="text-center py-5">
          <p className="mb-0">No menu items found. Add items to get started!</p>
        </Alert>
      ) : (
        <Row xs={1} md={2} lg={3} xl={4} className="g-4">
          {filteredItems.map(item => (
            <Col key={item._id}>
              <Card className={`h-100 shadow-sm border-0 menu-card-bs ${!item.isAvailable ? 'opacity-75' : ''}`}>
                <div className="position-relative">
                  <Card.Img 
                    variant="top" 
                    src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80'} 
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                  {!item.isAvailable && (
                    <Badge bg="danger" className="position-absolute top-0 end-0 m-3 py-2 px-3">
                      SOLD OUT
                    </Badge>
                  )}
                  {item.aiGenerated && (
                    <Badge bg="info" className="position-absolute top-0 start-0 m-3 py-2 px-3 bg-opacity-75 backdrop-blur">
                      AI GENERATED
                    </Badge>
                  )}
                </div>
                <Card.Body className="d-flex flex-column">
                  <div className="small text-muted text-uppercase fw-bold mb-1">{item.category}</div>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Card.Title className="h5 mb-0 text-truncate me-2">{item.name}</Card.Title>
                    <span className="fw-bold text-primary">₹{item.price.toFixed(2)}</span>
                  </div>
                  {item.description && (
                    <Card.Text className="small text-muted mb-3 flex-grow-1" style={{ display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.description}
                    </Card.Text>
                  )}
                  <div className="d-flex gap-2 justify-content-end mt-auto pt-3 border-top">
                    {canManageMenu && (
                      <Button 
                        variant="light" 
                        size="sm" 
                        onClick={() => handleEdit(item)}
                        title="Edit Item"
                      >
                        ✏️
                      </Button>
                    )}
                    {canManageMenu && (
                      <Button 
                        variant="light" 
                        size="sm" 
                        onClick={() => handleOpenRecipe(item)}
                        title="Manage Recipe"
                      >
                        🍳
                      </Button>
                    )}
                    {canToggleAvailability && (
                      <Button 
                        variant={item.isAvailable ? "light" : "danger"} 
                        size="sm" 
                        onClick={() => handleToggleAvailability(item)}
                        title={item.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                      >
                        {item.isAvailable ? '✅' : '❌'}
                      </Button>
                    )}
                    {canManageMenu && (
                      <Button 
                        variant="light" 
                        size="sm" 
                        onClick={() => handleDelete(item._id)}
                        className="text-danger"
                        title="Delete Item"
                      >
                        🗑️
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default Menu;

