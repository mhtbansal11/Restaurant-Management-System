import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Spinner, Form, Modal } from 'react-bootstrap';
import axios from 'axios';
import toast from 'react-hot-toast';
import config from '../config';
import SeatingPreview from '../components/SeatingPreview';
import TableActionModal from '../components/TableActionModal';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants/roles';
import { formatOrderTime, formatTimeAgo } from '../utils/timeAgo';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalMenuItems: 0,
    totalTables: 0,
    activeOrders: 0,
    todayRevenue: 0,
    lowStockItems: 0,
    cashCollected: 0,
    onlineReceived: 0,
    dueAmount: 0,
    newOrders: 0,
    completedOrders: 0,
    averageOrderValue: 0
  });
  const [layout, setLayout] = useState(null);
  const [tableStatuses, setTableStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState(null);
  const [operationalInsights, setOperationalInsights] = useState(null);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topMenuItems, setTopMenuItems] = useState([]);
  const [offTableOrders, setOffTableOrders] = useState([]);
  const [floorViewMode, setFloorViewMode] = useState({}); // per-floor: 'list' | 'editor'
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tableToDelete, setTableToDelete] = useState(null); // { floorId, table }
  const [deleting, setDeleting] = useState(false);
  const [settingsTable, setSettingsTable] = useState(null); // table open for settings (maintenance/delete)

  const formatHour = (hour) => {
    const h = hour % 12 || 12;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${h} ${ampm}`;
  };

  const fetchStats = async () => {
    try {
      const [menuRes, seatingRes, allOrdersRes, tablesRes, inventoryRes, financeRes, insightsRes] = await Promise.all([
        axios.get(config.ENDPOINTS.MENU),
        axios.get(`${config.API_URL}/seating/layout`),
        axios.get(config.ENDPOINTS.ORDERS),
        axios.get(config.ENDPOINTS.TABLES),
        axios.get(config.ENDPOINTS.INVENTORY),
        axios.get(config.ENDPOINTS.DASHBOARD_STATS),
        axios.get(`${config.API_URL}/ai/operational-insights`)
      ]);

      setOperationalInsights(insightsRes.data);

      const seatingLayout = seatingRes.data;
      const totalTables = seatingLayout.floors
        ? seatingLayout.floors.reduce((sum, floor) => sum + (floor.tables?.length || 0), 0)
        : (seatingLayout.tables?.length || 0);

      const completedOrdersTodayRes = await axios.get(`${config.ENDPOINTS.ORDERS}?status=completed`);
      const today = new Date().toISOString().split('T')[0];
      const todayRevenue = completedOrdersTodayRes.data
        .filter(order => order.createdAt.split('T')[0] === today)
        .reduce((sum, order) => sum + order.totalAmount, 0);

      const lowStockCount = inventoryRes.data.filter(item => item.quantity <= item.minThreshold).length;
      const activeOrders = allOrdersRes.data.filter(
        (order) => !['completed', 'cancelled'].includes(order.status)
      );
      
      const newOrdersCount = allOrdersRes.data.filter(
        (order) => order.status === 'pending'
      ).length;
      
      const completedOrdersCount = allOrdersRes.data.filter(
        (order) => order.status === 'completed'
      ).length;
      
      const averageOrderValue = completedOrdersCount > 0 
        ? todayRevenue / completedOrdersCount 
        : 0;

      // Get recent orders
      const recentOrdersData = allOrdersRes.data
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      const nonTableActiveOrders = allOrdersRes.data
        .filter(o => ['takeaway', 'packing'].includes(o.orderType))
        .filter(o => !['completed', 'cancelled'].includes(o.status))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Get top menu items from orders
      const menuItemCounts = {};
      allOrdersRes.data.forEach(order => {
        order.items?.forEach(item => {
          menuItemCounts[item.menuItem] = (menuItemCounts[item.menuItem] || 0) + item.quantity;
        });
      });
      
      const topItems = menuRes.data
        .map(item => ({
          ...item,
          orderCount: menuItemCounts[item._id] || 0
        }))
        .sort((a, b) => b.orderCount - a.orderCount)
        .slice(0, 3);

      setStats({
        totalMenuItems: menuRes.data.length,
        totalTables,
        activeOrders: activeOrders.length,
        todayRevenue,
        lowStockItems: lowStockCount,
        cashCollected: financeRes.data.cashCollected,
        onlineReceived: financeRes.data.onlineReceived,
        dueAmount: financeRes.data.dueAmount,
        newOrders: newOrdersCount,
        completedOrders: completedOrdersCount,
        averageOrderValue
      });
      setLayout(seatingLayout);
      setTableStatuses(tablesRes.data);
      setRecentOrders(recentOrdersData);
      setTopMenuItems(topItems);
      setOffTableOrders(nonTableActiveOrders);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

console.log("stats",stats)

  const handleTableClick = (table) => {
    const tableStatus = tableStatuses.find(t => t.tableId === table.id);
    setSelectedTable({
      ...table,
      status: tableStatus?.status || 'available',
      currentOrder: tableStatus?.currentOrder?._id || tableStatus?.currentOrder
    });
  };

  const getTableStatus = (tableId) => {
    return tableStatuses.find(t => t.tableId === tableId)?.status || 'available';
  };

  const onTableTileClick = (floorId, table) => {
    // Normal behavior: open table details
    handleTableClick(table);
  };

  const handleSetTableStatus = async (tableId, status) => {
    try {
      const current = getTableStatus(tableId);
      if (current === 'occupied') {
        toast.error('Cannot change status while table is occupied');
        return;
      }
      if ((status === 'maintenance' || status === 'unavailable') && current !== 'available') {
        toast.error('Can only change to this status when table is available');
        return;
      }
      await axios.put(`${config.ENDPOINTS.TABLES}/${tableId}`, { status });
      toast.success(`Table set to ${status}`);
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update table status');
    }
  };

  const handleAskDeleteTable = (floorId, table) => {
    const currentStatus = getTableStatus(table.id);
    if (currentStatus !== 'available') {
      toast.error('Table can be deleted only when available');
      return;
    }
    setTableToDelete({ floorId, table });
    setShowDeleteConfirm(true);
  };

  const confirmDeleteTable = async () => {
    if (!tableToDelete || !layout) return;
    try {
      setDeleting(true);
      const { floorId, table } = tableToDelete;
      const updatedLayout = {
        ...layout,
        floors: layout.floors.map(f => 
          f.id === floorId 
            ? { ...f, tables: (f.tables || []).filter(t => t.id !== table.id) }
            : f
        )
      };
      await axios.post(config.ENDPOINTS.SEATING_LAYOUT, updatedLayout);
      toast.success(`Table ${table.label} deleted`);
      setTableToDelete(null);
      fetchStats();
    } catch (error) {
      console.error('Error deleting table:', error);
      toast.error(error.response?.data?.message || 'Failed to delete table');
    } finally {
      setDeleting(false);
    }
  };

  const handleAddNewTable = async (floorId) => {
    if (!layout || !layout.floors) return;
    
    try {
      // Find the floor to get existing tables for proper numbering
      const floor = layout.floors.find(f => f.id === floorId);
      const floorTables = floor?.tables || [];
      
      // Calculate the next table number (find highest existing number + 1)
      const existingNumbers = floorTables
        .map(table => {
          // Match both T01/T1 and Table 1 patterns
          const matchT = table.label.match(/T(\d+)/);
          const matchTable = table.label.match(/Table (\d+)/);
          return matchT ? parseInt(matchT[1]) : (matchTable ? parseInt(matchTable[1]) : 0);
        })
        .filter(num => num > 0);
      
      const nextTableNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
      
      // Create a new table object with proper sequential numbering (T01, T02 format)
      const newTable = {
        id: `table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        label: `T${nextTableNumber.toString().padStart(2, '0')}`,
        floorId: floorId,
        x: 50,
        y: 50,
        width: 100,
        height: 60,
        capacity: 4,
        status: 'available'
      };

      // Update the layout locally first for immediate UI feedback
      const updatedLayout = {
        ...layout,
        floors: layout.floors.map(floor => 
          floor.id === floorId 
            ? { ...floor, tables: [...(floor.tables || []), newTable] }
            : floor
        )
      };

      setLayout(updatedLayout);
      
      // Save the updated layout to the backend
      await axios.post(config.ENDPOINTS.SEATING_LAYOUT, updatedLayout);
      
      toast.success(`Table ${newTable.label} added successfully!`);
      
    } catch (error) {
      console.error('Error adding table:', error);
      toast.error('Failed to add table. Please try again.');
    }
  };

  const handleTableAction = async (action) => {
    if (!selectedTable) return;

    try {
      if (action === 'order') {
        if (selectedTable.status === 'occupied' && selectedTable.currentOrder) {
          // Continue existing order - include orderId
          navigate(`/pos?tableId=${selectedTable.id}&orderId=${selectedTable.currentOrder}&type=dine-in&tableLabel=${selectedTable.label}`);
        } else {
          // New order - only tableId
          navigate(`/pos?tableId=${selectedTable.id}&type=dine-in&tableLabel=${selectedTable.label}`);
        }
      } else if (action === 'book') {
        await axios.put(`${config.ENDPOINTS.TABLES}/${selectedTable.id}`, { status: 'reserved' });
        toast.success(`Table ${selectedTable.label} reserved!`);
        fetchStats();
      } else if (action === 'clear') {
        await axios.put(`${config.ENDPOINTS.TABLES}/${selectedTable.id}`, { status: 'available' });
        toast.success(`Table ${selectedTable.label} cleared`);
        fetchStats();
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
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-3">Loading Dashboard...</span>
      </Container>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header mb-4">
        <div>
          <h2 className="mb-1 fw-bold">Restaurant Dashboard</h2>
          <p className="text-muted small mb-0">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" size="sm" onClick={() => window.location.reload()}>
            🔄 Refresh
          </Button>
        </div>
      </div>


      {/* Key Metrics Row */}
      <Row className="g-4 mb-4">
        {ROLES.MANAGEMENT.includes(user?.role) && (
          <Col lg={3} md={6} sm={6} className="mb-3">
            <Card className="h-100 overflow-hidden">
              <Card.Body className="p-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-success bg-opacity-10 p-3 rounded-3 text-success">
                    <span className="h4 mb-0">💰</span>
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 text-uppercase small fw-bold">Today's Revenue</h6>
                    <h4 className="mb-0 fw-bold">₹{stats.todayRevenue.toLocaleString() || 0}</h4>
                    <div className="text-muted small">{stats.completedOrders || 0} orders completed</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}
        <Col lg={3} md={6} sm={6} className="mb-3">
          <Card className="h-100 overflow-hidden">
            <Card.Body className="p-3">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-primary bg-opacity-10 p-3 rounded-3 text-primary">
                  <span className="h4 mb-0">📋</span>
                </div>
                <div>
                  <h6 className="text-muted mb-1 text-uppercase small fw-bold">Active Orders</h6>
                  <h4 className="mb-0 fw-bold">{stats.activeOrders}</h4>
                  <div className="text-muted small">{stats.newOrders} new orders</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} sm={6} className="mb-3">
          <Card className="h-100 overflow-hidden">
            <Card.Body className="p-3">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-warning bg-opacity-10 p-3 rounded-3 text-warning">
                  <span className="h4 mb-0">🪑</span>
                </div>
                <div>
                  <h6 className="text-muted mb-1 text-uppercase small fw-bold">Occupied Tables</h6>
                  <h4 className="mb-0 fw-bold">{tableStatuses.filter(t => t.status === 'occupied').length}</h4>
                  <div className="text-muted small">out of {stats.totalTables} tables</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        {(ROLES.MANAGEMENT.includes(user?.role) || ROLES.KITCHEN.includes(user?.role)) && (
          <Col lg={3} md={6} sm={6} className="mb-3">
            <Card className="h-100 overflow-hidden">
              <Card.Body className="p-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-danger bg-opacity-10 p-3 rounded-3 text-danger">
                    <span className="h4 mb-0">⚠️</span>
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 text-uppercase small fw-bold">Low Stock Items</h6>
                    <h4 className="mb-0 fw-bold">{stats.lowStockItems}</h4>
                    <div className="text-muted small">Need attention</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      {/* Main Content Grid */}
      <Row>
        {/* Floor Management Section - Visible to Front of House */}
        {(ROLES.POS.includes(user?.role) || ROLES.FRONT_DESK.includes(user?.role)) && (
          <Col lg={12} className="mb-4">
            <Card className="floor-management-card">
              <Card.Header className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div>
                  <h5 className="mb-1">🏢 Floor Management</h5>
                  <small className="text-muted">Click tables to manage orders and reservations</small>
                </div>
                <div className="d-flex gap-2 align-items-center">
                  <div className="d-flex gap-2">
                    <Badge bg="success-subtle" className="text-success border border-success-subtle px-2 py-1">Available</Badge>
                    <Badge bg="danger-subtle" className="text-danger border border-danger-subtle px-2 py-1">Occupied</Badge>
                    <Badge bg="warning-subtle" className="text-warning-emphasis border border-warning-subtle px-2 py-1">Reserved</Badge>
                    <Badge bg="info-subtle" className="text-info-emphasis border border-info-subtle px-2 py-1">Cleaning</Badge>
                  </div>
                </div>
              </Card.Header>
              <Card.Body className="">
                {layout ? (
                    <div className="">
                      {/* <h6 className="mb-3 fw-bold text-primary">Floor-wise Table Overview</h6> */}
                      {layout?.floors?.map(floor => {
                        const floorTables = floor.tables || [];
                        if (floorTables.length === 0) return null;
                        
                        return (
                          <div key={floor.id} className="mb-4">
                            <div className="d-flex align-items-center justify-content-between mb-3 p-3 bg-light rounded-3 flex-wrap gap-2">
                              <div className="d-flex align-items-center">
                                <h6 className="mb-0 fw-bold text-dark">🏢 {floor.name}</h6>
                                <Badge bg="secondary" className="ms-2">
                                  {floorTables.length} table{floorTables.length !== 1 ? 's' : ''}
                                </Badge>
                              </div>
                              <div className="d-flex align-items-center gap-2">
                                <div className="btn-group btn-group-sm rounded-pill overflow-hidden shadow-sm">
                                  <Button
                                    variant={(floorViewMode[floor.id] || 'list') === 'editor' ? 'primary' : 'outline-primary'}
                                    size="sm"
                                    className="border-0 px-3"
                                    onClick={() => setFloorViewMode(prev => ({ ...prev, [floor.id]: 'editor' }))}
                                  >
                                    🎨 Editor
                                  </Button>
                                  <Button
                                    variant={(floorViewMode[floor.id] || 'list') === 'list' ? 'primary' : 'outline-primary'}
                                    size="sm"
                                    className="border-0 px-3"
                                    onClick={() => setFloorViewMode(prev => ({ ...prev, [floor.id]: 'list' }))}
                                  >
                                    📋 List
                                  </Button>
                                </div>
                              </div>
                            </div>
                            { (floorViewMode[floor.id] || 'list') === 'editor' ? (
                              <div className="floor-plan-wrapper">
                                <SeatingPreview 
                                  layout={{ ...layout, floors: [floor] }}
                                  tables={tableStatuses}
                                  onTableClick={handleTableClick}
                                />
                              </div>
                            ) : (
                              <div className="row g-3">
                              {floorTables.map(table => {
                                const tableStatus = tableStatuses.find(t => t.tableId === table.id);
                                const status = tableStatus?.status || 'available';
                                const statusColors = {
                                  available: 'success',
                                  occupied: 'danger',
                                  reserved: 'warning',
                                  cleaning: 'info',
                                  maintenance: 'secondary',
                                  unavailable: 'secondary'
                                };
                                const statusIcons = {
                                  available: '✅',
                                  occupied: '🍽️',
                                  reserved: '📅',
                                  cleaning: '🧹',
                                  maintenance: '🛠️',
                                  unavailable: '🚫'
                                };
                                const statusStyles = {
                                  available: { backgroundColor: '#ffffff', border: '1px solid #dee2e6', color: '#212529' },
                                  occupied: { backgroundColor: '#dcf0e1', border: '1px solid #28a745', color: '#0f5132' },
                                  reserved: { backgroundColor: '#fff3cd', border: '1px solid #ffc107', color: '#664d03' },
                                  cleaning: { backgroundColor: '#cff4fc', border: '1px solid #0dcaf0', color: '#055160' },
                                  maintenance: { backgroundColor: '#e9ecef', border: '1px solid #ced4da', color: '#495057' },
                                  unavailable: { backgroundColor: '#f8f9fa', border: '1px dashed #ced4da', color: '#6c757d' }
                                };
                                const paidAmount = tableStatus?.currentOrder?.paidAmount || 0;
                                const totalAmount = tableStatus?.currentOrder?.totalAmount || tableStatus?.currentOrder?.subtotal || 0;
                                const dueAmount = Math.max(totalAmount - paidAmount, 0);
                                
                                return (
                                  <div key={table.id} className="col-6 col-sm-4 col-md-3 col-lg-2 col-xl-1-5">
                                    <Card 
                                      className="h-100 table-card hover-lift"
                                      style={{ cursor: 'default', ...statusStyles[status] }}
                                    >
                                      <Card.Body className="p-2 d-flex flex-column position-relative">
                                        <div className="d-flex justify-content-between align-items-start mb-2 flex-wrap gap-1">
                                          <Badge 
                                            bg={statusColors[status] + '-subtle'} 
                                            text={statusColors[status]}
                                            className={`border border-${statusColors[status]}-subtle text-truncate`}
                                           
                                          >
                                            {statusIcons[status]} {status.charAt(0).toUpperCase() + status.slice(1)}
                                          </Badge>
                                          
                                          <div className="d-flex gap-1 align-items-center">
                                            <Badge bg="light" text="dark" className="border">
                                              👥 {table.capacity || 4}
                                            </Badge>
                                            
                                            {status === 'available' && (
                                              <div 
                                                role="button"
                                                className="btn btn-sm btn-light border rounded-circle d-flex align-items-center justify-content-center p-0"
                                                style={{ width: '24px', height: '24px', flexShrink: 0 }}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setSettingsTable({ floorId: floor.id, ...table });
                                                }}
                                                title="Manage Table"
                                              >
                                                ⚙️
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        
                                        <div 
                                          role="button" 
                                          onClick={() => onTableTileClick(floor.id, table)} 
                                          style={{ cursor: 'pointer' }}
                                          className="flex-grow-1 d-flex flex-column align-items-center justify-content-center py-2"
                                        >
                                          <h5 className="mb-0 fw-bold text-dark">{table.label}</h5>
                                          
                                          {status === 'occupied' && tableStatus?.currentOrder && (
                                            <div className="mt-2 text-center w-100">
                                              <Badge bg="warning" text="dark" className="mb-1 d-block mx-auto" style={{maxWidth: '80px'}}>
                                                #{tableStatus.currentOrder.orderNumber || tableStatus.currentOrder._id?.slice(-4)}
                                              </Badge>
                                              <small className="text-muted d-block mb-1">
                                                {formatOrderTime(tableStatus.currentOrder.createdAt)}
                                              </small>
                                              <div className="border-top pt-1 w-100">
                                                <div className="d-flex justify-content-between small">
                                                  <span className="text-muted">Total:</span>
                                                  <span className="fw-bold">₹{totalAmount.toLocaleString()}</span>
                                                </div>
                                                {dueAmount > 0 && (
                                                  <div className="d-flex justify-content-between small">
                                                    <span className="text-danger">Due:</span>
                                                    <span className="fw-bold text-danger">₹{dueAmount.toLocaleString()}</span>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </Card.Body>
                                    </Card>
                                  </div>
                                );
                              })}
                              
                              {/* Add New Table Card - At the end */}
                              <div className="col-6 col-sm-4 col-md-3 col-lg-2 col-xl-1-5">
                                <Card 
                                  className="h-100 table-card hover-lift"
                                  style={{ 
                                    cursor: 'pointer', 
                                    border: '2px dashed #cbd5e1',
                                    background: 'transparent'
                                  }}
                                  onClick={() => handleAddNewTable(floor.id)}
                                >
                                  <Card.Body className="p-3 d-flex flex-column align-items-center justify-content-center text-center">
                                    <div className="mb-2 text-muted" style={{fontSize: '1.5rem'}}>➕</div>
                                    <div className="fw-bold text-muted small">Add Table</div>
                                  </Card.Body>
                                </Card>
                              </div>
                            </div>
                            )}
                          </div>
                        );
                      })}
                      
                      {offTableOrders.length > 0 && (
                        <div className="mt-4">
                          <div className="d-flex align-items-center mb-3 p-3 bg-light rounded-3">
                            <h6 className="mb-0 fw-bold text-dark">🥡📦 Takeaway & Packing Orders</h6>
                            <Badge bg="secondary" className="ms-2">
                              {offTableOrders.length} order{offTableOrders.length !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                          <div className="row g-3">
                            {offTableOrders.map(order => {
                              const due = Math.max(
                                (order.totalAmount || order.subtotal || 0) - (order.paidAmount || 0),
                                0
                              );
                              const orderTypeIcon = order.orderType === 'takeaway' ? '🥡' : '📦';
                              const orderTypeLabel = order.orderType === 'takeaway' ? 'Takeaway' : 'Packing';
                              
                              return (
                                <div key={order._id} className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2">
                                  <Card 
                                    className="h-100 takeaway-order-card hover-lift shadow-sm"
                                    onClick={() => navigate(`/pos?orderId=${order._id}&type=${order.orderType}`)}
                                  >
                                    <Card.Body className="p-3 d-flex flex-column">
                                      {/* Order Type Header */}
                                      <div className="order-type-header mb-3">
                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                          <div className="d-flex align-items-center gap-2">
                                            <span className="order-type-emoji">{orderTypeIcon}</span>
                                            <span className="fw-bold text-dark">{orderTypeLabel}</span>
                                          </div>
                                          <Badge 
                                            bg={
                                              order.status === 'completed' ? 'success' :
                                              order.status === 'ready' ? 'warning' :
                                              order.status === 'preparing' ? 'info' :
                                              'primary'
                                            }
                                            className="status-badge-small text-capitalize"
                                          >
                                            {order.status}
                                          </Badge>
                                        </div>
                                      </div>
                                      
                                      {/* Order ID and Time */}
                                      <div className="order-info mb-2">
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                          <h6 className="mb-0 fw-bold text-dark">#{order._id.slice(-6)}</h6>
                                          <Badge bg="light" text="dark" className="time-badge">
                                            {formatOrderTime(order.createdAt)}
                                          </Badge>
                                        </div>
                                      </div>
                                      
                                      {/* Customer Info */}
                                      {(order.customerName || order.customer?.name) && (
                                        <div className="customer-info mb-2">
                                          <div className="d-flex align-items-center gap-2">
                                            <div className="customer-avatar bg-light rounded-circle text-primary fw-bold d-flex align-items-center justify-content-center" style={{width: '20px', height: '20px', fontSize: '0.6rem'}}>
                                              {(order.customerName || order.customer?.name)[0].toUpperCase()}
                                            </div>
                                            <span className="small text-muted text-truncate" style={{maxWidth: '100px'}}>
                                              {order.customerName || order.customer?.name}
                                            </span>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {/* Items Preview */}
                                      {order.items && order.items.length > 0 && (
                                        <div className="items-preview mb-2">
                                          <div className="small text-muted mb-1">Items:</div>
                                          <div className="d-flex flex-wrap gap-1">
                                            {order.items.slice(0, 2).map((item, idx) => (
                                              <Badge key={idx} bg="light" text="dark" className="item-badge">
                                                {item.quantity}x {item.name?.slice(0, 8) || item.menuItem?.name?.slice(0, 8)}
                                              </Badge>
                                            ))}
                                            {order.items.length > 2 && (
                                              <Badge bg="secondary" className="item-badge">
                                                +{order.items.length - 2}
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                      
                                      {/* Amount and Due */}
                                      <div className="amount-section mt-auto pt-2 border-top">
                                        <div className="d-flex justify-content-between align-items-center">
                                          <div>
                                            <small className="text-muted">Total</small>
                                            <div className="fw-bold text-dark">₹{(order.totalAmount || order.subtotal || 0).toLocaleString()}</div>
                                          </div>
                                          {due > 0 && (
                                            <div className="text-end">
                                              <small className="text-muted">Due</small>
                                              <div className="fw-bold text-danger">₹{due.toLocaleString()}</div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </Card.Body>
                                  </Card>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      {(!layout?.floors || layout.floors.length === 0 || layout.floors.every(f => !f.tables || f.tables.length === 0)) && (
                        <div className="text-center py-3">
                          <div className="text-muted mb-2">📋</div>
                          <h6 className="text-muted">No tables configured</h6>
                          <p className="text-muted small">Go to the layout editor to add tables to your floors</p>
                        </div>
                      )}
                    </div>
                  ) : (
                  <div className="text-center p-4">
                    <Spinner animation="border" size="sm" />
                    <p className="mt-2 text-muted">Loading floor plan...</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        )}

        {/* Operational Intelligence - Management Only */}
        {ROLES.MANAGEMENT.includes(user?.role) && (
          <Col lg={12} className="mb-4">
            <Card className="intelligence-card">
              <Card.Header>
                <h5 className="mb-0">🤖 Operational Intelligence</h5>
              </Card.Header>
              <Card.Body>
                {operationalInsights ? (
                  <>
                    <div className="intelligence-item mb-3">
                      <small className="text-muted d-block mb-1">Peak Hour</small>
                      <strong>
                        {operationalInsights.peakHours?.length > 0 
                          ? formatHour(operationalInsights.peakHours[0].hour)
                          : 'No data'}
                      </strong>
                    </div>
                    <div className="intelligence-item mb-3">
                      <small className="text-muted d-block mb-1">Popular Item</small>
                      <strong>
                        {operationalInsights.popularItems?.length > 0 
                          ? operationalInsights.popularItems[0].name 
                          : 'No data'}
                      </strong>
                    </div>
                    <div className="intelligence-item">
                      <small className="text-muted d-block mb-1">AI Summary</small>
                      <div className="small">{operationalInsights.summary || 'Analyzing patterns...'}</div>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <Spinner animation="border" size="sm" />
                    <p className="mt-2 text-muted small">Loading insights...</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      {/* Additional Data Rows */}
      <Row className="mb-4">
        {/* Recent Orders - Visible to POS & Kitchen */}
        {(ROLES.POS.includes(user?.role) || ROLES.KITCHEN.includes(user?.role)) && (
          <Col lg={6} className="mb-3">
            <Card className="data-card">
              <Card.Header>
                <h5 className="mb-0">📊 Recent Orders</h5>
              </Card.Header>
              <Card.Body className='px-4 py-0'>
                {recentOrders.length > 0 ? (
                  <div className="order-list">
                    {recentOrders.map(order => (
                      <div key={order._id} className="order-item d-flex justify-content-between align-items-center py-2 border-bottom">
                        <div>
                          <div className="fw-semibold">#{order._id.slice(-6)}</div>
                          <small className="text-muted d-block">
                            Table: {order.tableLabel || order.tableId} • {new Date(order.createdAt).toLocaleTimeString()}
                          </small>
                        </div>
                        <Badge bg={order.status === 'completed' ? 'success' : order.status === 'preparing' ? 'warning' : 'info'}>
                          {order.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted py-3">
                    No recent orders
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        )}

        {/* Top Menu Items - Management Only */}
        {ROLES.MANAGEMENT.includes(user?.role) && (
          <Col lg={6} className="mb-3">
            <Card className="data-card">
              <Card.Header>
                <h5 className="mb-0">🍽 Top Menu Items</h5>
              </Card.Header>
              <Card.Body className='px-4 py-0'>
                {topMenuItems.length > 0 ? (
                  <div className="menu-items-list">
                    {topMenuItems.map((item) => (
                      <div key={item._id} className="menu-item d-flex justify-content-between align-items-center py-2 border-bottom">
                        <div>
                          <div className="fw-semibold">{item.name}</div>
                          <small className="text-muted">₹{item.price.toFixed(2)}</small>
                        </div>
                        <div className="text-end">
                          <Badge bg="primary" className="order-count-badge">
                            {item.orderCount} orders
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted py-3">
                    No order data available
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      {/* Financial Summary - Finance Role Only */}
      {ROLES.FINANCE.includes(user?.role) && (
        <Row className="mb-4">
          <Col xs={12}>
            <Card className="financial-card">
              <Card.Header>
                <h5 className="mb-0">💳 Financial Summary</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col lg={3} md={6} sm={6} className="mb-3">
                    <div className="financial-item">
                      <small className="text-muted d-block">Cash Collected</small>
                      <div className="financial-value">₹{stats.cashCollected.toLocaleString()}</div>
                    </div>
                  </Col>
                  <Col lg={3} md={6} sm={6} className="mb-3">
                    <div className="financial-item">
                      <small className="text-muted d-block">Online Received</small>
                      <div className="financial-value">₹{stats.onlineReceived.toLocaleString()}</div>
                    </div>
                  </Col>
                  <Col lg={3} md={6} sm={6} className="mb-3">
                    <div className="financial-item">
                      <small className="text-muted d-block">Due Amount</small>
                      <div className="financial-value text-warning">₹{stats.dueAmount.toLocaleString()}</div>
                    </div>
                  </Col>
                  <Col lg={3} md={6} sm={6} className="mb-3">
                    <div className="financial-item">
                      <small className="text-muted d-block">Avg Order Value</small>
                      <div className="financial-value">₹{stats.averageOrderValue.toFixed(2)}</div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Quick Actions */}
      <div className={`floating-quick-action ${isQuickActionOpen ? 'active' : ''}`}>
        <div className="quick-action-menu shadow">
          {ROLES.POS.includes(user?.role) && (
            <Link to="/pos" className="quick-action-item">
              <span className="qa-icon">🛒</span>
              <span>New Order</span>
            </Link>
          )}
          {(ROLES.MANAGEMENT.includes(user?.role) || ROLES.KITCHEN.includes(user?.role)) && (
            <Link to="/inventory" className="quick-action-item">
              <span className="qa-icon">📦</span>
              <span>Inventory</span>
            </Link>
          )}
          {ROLES.MANAGEMENT.includes(user?.role) && (
            <Link to="/menu" className="quick-action-item">
              <span className="qa-icon">📖</span>
              <span>Edit Menu</span>
            </Link>
          )}
          {ROLES.MANAGEMENT.includes(user?.role) && (
            <Link to="/staff" className="quick-action-item">
              <span className="qa-icon">👥</span>
              <span>Staff List</span>
            </Link>
          )}
          {(ROLES.POS.includes(user?.role) || ROLES.KITCHEN.includes(user?.role)) && (
            <Link to="/orders" className="quick-action-item">
              <span className="qa-icon">📋</span>
              <span>All Orders</span>
            </Link>
          )}
          {(ROLES.MANAGEMENT.includes(user?.role) || ROLES.POS.includes(user?.role)) && (
            <Link to="/customers" className="quick-action-item">
              <span className="qa-icon">👤</span>
              <span>Customers</span>
            </Link>
          )}
        </div>
        <button 
          className="quick-action-main rounded-circle shadow-lg" 
          onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
        >
          {isQuickActionOpen ? '✕' : '⚡'}
        </button>
      </div>

      {/* Table Action Modal */}
      {selectedTable && (
        <TableActionModal 
          table={selectedTable} 
          onClose={() => setSelectedTable(null)} 
          onAction={handleTableAction}
        />
      )}

      <ConfirmModal
        show={showDeleteConfirm}
        onHide={() => {
          if (!deleting) setShowDeleteConfirm(false);
        }}
        onConfirm={confirmDeleteTable}
        title="Delete Table"
        message="Are you sure you want to delete this table? This action cannot be undone."
        confirmText="Delete"
        confirmVariant="danger"
        icon="🗑️"
      />

      {/* Table Settings Modal */}
      <Modal show={!!settingsTable} onHide={() => setSettingsTable(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Manage Table {settingsTable?.label}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex flex-column gap-3">
            <div className="text-center mb-3">
              <div className="text-muted small mb-1">Current Status</div>
              <Badge 
                bg={settingsTable?.status === 'available' ? 'success' : 
                    settingsTable?.status === 'occupied' ? 'danger' : 
                    settingsTable?.status === 'reserved' ? 'warning' : 'secondary'}
                className="fs-6 px-3 py-2"
              >
                {settingsTable?.status?.toUpperCase()}
              </Badge>
            </div>
            
            {settingsTable?.status === 'occupied' ? (
              <div className="alert alert-warning mb-0">
                <small>⚠️ This table is currently occupied. You cannot change its status or delete it until the order is completed or cleared.</small>
              </div>
            ) : (
              <>
                <div className="d-grid gap-2">
                  <Button 
                    variant={settingsTable?.status === 'maintenance' ? 'secondary' : 'outline-secondary'}
                    onClick={() => {
                      handleSetTableStatus(settingsTable.id, 'maintenance');
                      setSettingsTable(null);
                    }}
                    disabled={settingsTable?.status !== 'available'}
                  >
                    🔧 Set Under Maintenance
                  </Button>
                  
                  <Button 
                    variant={settingsTable?.status === 'unavailable' ? 'secondary' : 'outline-secondary'}
                    onClick={() => {
                      handleSetTableStatus(settingsTable.id, 'unavailable');
                      setSettingsTable(null);
                    }}
                    disabled={settingsTable?.status !== 'available'}
                  >
                    🚫 Set Unavailable
                  </Button>
                </div>
                
                <hr className="my-2" />
                
                <div className="d-grid">
                  <Button 
                    variant="outline-danger"
                    onClick={() => {
                      handleAskDeleteTable(settingsTable.floorId, settingsTable);
                      setSettingsTable(null);
                    }}
                  >
                    🗑️ Delete Table
                  </Button>
                </div>
              </>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Dashboard;


