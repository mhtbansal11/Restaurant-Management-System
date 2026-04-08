import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Button, Badge, Spinner, Modal } from 'react-bootstrap';
import axios from 'axios';
import toast from 'react-hot-toast';
import config from '../config';
import SeatingPreview from '../components/SeatingPreview';
import TableActionModal from '../components/TableActionModal';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants/roles';
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

  const formatReservationSummary = (reservation) => {
    if (!reservation?.reservedFor) return '';

    const date = new Date(reservation.reservedFor);
    if (Number.isNaN(date.getTime())) return '';

    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
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
        .filter((order) => ['takeaway', 'packing'].includes(order.orderType))
        .filter((order) => !['completed', 'cancelled'].includes(order.status))
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
      currentOrder: tableStatus?.currentOrder?._id || tableStatus?.currentOrder,
      currentOrderData: tableStatus?.currentOrder || null,
      reservation: tableStatus?.reservation || null
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

  const handleTableAction = async (action, payload = {}) => {
    if (!selectedTable) return;

    try {
      if (action === 'order') {
        const tableId = encodeURIComponent(selectedTable.id);
        const tableLabel = encodeURIComponent(selectedTable.label);
        if (selectedTable.status === 'occupied' && selectedTable.currentOrder) {
          const orderId = encodeURIComponent(selectedTable.currentOrder);
          navigate(`/pos?tableId=${tableId}&orderId=${orderId}&type=dine-in&tableLabel=${tableLabel}`);
        } else {
          navigate(`/pos?tableId=${tableId}&type=dine-in&tableLabel=${tableLabel}`);
        }
      } else if (action === 'book') {
        await axios.put(`${config.ENDPOINTS.TABLES}/${selectedTable.id}`, {
          status: 'reserved',
          reservation: payload.reservation
        });
        toast.success(`Table ${selectedTable.label} reserved!`);
        fetchStats();
      } else if (action === 'clear') {
        await axios.put(`${config.ENDPOINTS.TABLES}/${selectedTable.id}`, { status: 'available' });
        toast.success(`Table ${selectedTable.label} cleared`);
        fetchStats();
      } else if (action === 'maintenance') {
        await axios.put(`${config.ENDPOINTS.TABLES}/${selectedTable.id}`, { status: 'maintenance' });
        toast.success(`Table ${selectedTable.label} marked under maintenance`);
        fetchStats();
      } else if (action === 'block') {
        await axios.put(`${config.ENDPOINTS.TABLES}/${selectedTable.id}`, { status: 'unavailable' });
        toast.success(`Table ${selectedTable.label} blocked`);
        fetchStats();
      } else if (action === 'activate') {
        await axios.put(`${config.ENDPOINTS.TABLES}/${selectedTable.id}`, { status: 'available' });
        toast.success(`Table ${selectedTable.label} is available again`);
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

  const openDirectOrder = (type) => {
    navigate(`/pos?type=${encodeURIComponent(type)}`);
  };

  const openOffTableOrder = (order) => {
    navigate(`/pos?orderId=${encodeURIComponent(order._id)}&type=${encodeURIComponent(order.orderType)}`);
  };

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <Spinner animation="grow" variant="primary" className="mb-3" />
        <p className="text-muted fw-bold">Synchronizing command center...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-premium">
      <div className="dashboard-header-premium d-flex justify-content-between align-items-center">
        <div>
          <h1 className="h3 fw-bold text-main mb-1 text-gradient">Command Center</h1>
          <p className="extra-small text-muted mb-0">Welcome back, {user?.name}. Here's your real-time snapshot.</p>
        </div>
        <div className="d-flex gap-2">
           <Link to="/pos" className="btn btn-primary d-flex align-items-center gap-2 rounded-pill px-4 shadow-sm border-0">
            <span className="fs-5">🛒</span> <span className="fw-bold">New Order</span>
          </Link>
           <Button variant="outline-subtle" className="btn-premium d-flex align-items-center gap-2 p-2 rounded-lg" onClick={fetchStats} title="Refresh Live Data">
            <span>🔄</span>
          </Button>
        </div>
      </div>


      {/* Key Metrics Row */}
      <div className="stats-grid-premium py-4">
        <div className="stat-card-premium glass-card">
          <div className="stat-header-premium">
            <div className="stat-icon-premium">💰</div>
            <span className="stat-label-premium">Revenue</span>
          </div>
          <div className="stat-value-premium text-gradient">₹{stats.todayRevenue.toLocaleString()}</div>
          <div className="stat-footer-premium mt-2">
            <span className="stat-change-premium stat-change-up">↑ 12%</span>
          </div>
        </div>
        
        <div className="stat-card-premium glass-card">
          <div className="stat-header-premium">
            <div className="stat-icon-premium text-primary">📋</div>
            <span className="stat-label-premium">Orders</span>
          </div>
          <div className="stat-value-premium">{stats.activeOrders}</div>
          <div className="stat-footer-premium mt-1 d-flex gap-2">
            <div className="extra-small text-primary fw-bold">{stats.newOrders} New</div>
            <div className="extra-small text-warning fw-bold">{stats.activeOrders - stats.newOrders} Live</div>
          </div>
        </div>

        <div className="stat-card-premium glass-card">
          <div className="stat-header-premium">
            <div className="stat-icon-premium text-info">🪑</div>
            <span className="stat-label-premium">Occupancy</span>
          </div>
          <div className="stat-value-premium">
            {stats.totalTables > 0 ? Math.round((tableStatuses.filter(t => t.status === 'occupied').length / stats.totalTables) * 100) : 0}%
          </div>
          <div className="stat-footer-premium mt-2">
            <div className="progress rounded-pill overflow-hidden bg-light" style={{ height: '4px' }}>
              <div 
                className="progress-bar bg-primary" 
                style={{ width: `${stats.totalTables > 0 ? (tableStatuses.filter(t => t.status === 'occupied').length / stats.totalTables) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="stat-card-premium glass-card">
          <div className="stat-header-premium">
            <div className="stat-icon-premium text-danger">⚠️</div>
            <span className="stat-label-premium">Critical Stock</span>
          </div>
          <div className="stat-value-premium text-danger">{stats.lowStockItems}</div>
          <Link to="/inventory" className="extra-small text-danger fw-bold text-decoration-none mt-1">Review Items →</Link>
        </div>
      </div>

      {/* Main Content Grid */}
      <Row>
        {/* Floor Management Section */}
        {(ROLES.POS.includes(user?.role) || ROLES.FRONT_DESK.includes(user?.role)) && (
          <Col lg={12} className="mb-4">
            <Card className="glass-card border-0">
              <Card.Header className="bg-transparent border-0 d-flex justify-content-between align-items-center flex-wrap gap-2 pt-4 px-4">
                <div>
                  <h5 className="mb-1 fw-bold">🏢 Floor Management</h5>
                  <small className="text-muted">Interactive floor plan and seating coordination</small>
                </div>
                <div className="d-flex align-items-center flex-wrap gap-2">
                  <Badge bg="success-subtle" className="text-success border border-success-subtle px-3 py-2 rounded-pill">Available</Badge>
                  <Badge bg="danger-subtle" className="text-danger border border-danger-subtle px-3 py-2 rounded-pill">Occupied</Badge>
                </div>
              </Card.Header>
              <Card.Body className="p-4">
                {layout ? (
                    <div className="">
                      
                      {layout?.floors?.map(floor => {
                        const floorTables = floor.tables || [];
                        if (floorTables.length === 0) return null;
                        
                        return (
                          <div key={floor.id} className="mb-4">
                            <div className="d-flex align-items-center justify-content-between mb-3 p-3 bg-light rounded-4 flex-wrap gap-2 border">
                              <div className="d-flex align-items-center">
                                <h6 className="mb-0 fw-bold text-dark">📍 {floor.name}</h6>
                                <Badge bg="secondary" className="ms-2 rounded-pill">
                                  {floorTables.length} Tables
                                </Badge>
                              </div>
                              <div className="btn-group btn-group-sm rounded-pill overflow-hidden shadow-sm border">
                                <Button
                                  variant={(floorViewMode[floor.id] || 'list') === 'editor' ? 'primary' : 'white'}
                                  onClick={() => setFloorViewMode(prev => ({ ...prev, [floor.id]: 'editor' }))}
                                  className="border-0"
                                >
                                  🎨 Visual
                                </Button>
                                <Button
                                  variant={(floorViewMode[floor.id] || 'list') === 'list' ? 'primary' : 'white'}
                                  onClick={() => setFloorViewMode(prev => ({ ...prev, [floor.id]: 'list' }))}
                                  className="border-0"
                                >
                                  📋 Active
                                </Button>
                              </div>
                            </div>
                            
                            {(floorViewMode[floor.id] || 'list') === 'editor' ? (
                              <div className="floor-plan-wrapper rounded-4 border overflow-hidden">
                                <SeatingPreview 
                                  layout={{ ...layout, floors: [floor] }}
                                  tables={tableStatuses}
                                  onTableClick={handleTableClick}
                                />
                              </div>
                            ) : (
                              <div className="row g-2 table-grid-compact">
                                {floorTables.map(table => {
                                  const status = getTableStatus(table.id);
                                  const tableStatus = tableStatuses.find(t => t.tableId === table.id);
                                  const currentOrder = tableStatus?.currentOrder || null;
                                  const reservationSummary = formatReservationSummary(tableStatus?.reservation);
                                  const totalAmount = currentOrder?.totalAmount || 0;
                                  const paidAmount = currentOrder?.paidAmount || 0;
                                  const dueAmount = Math.max(currentOrder?.dueAmount ?? (totalAmount - paidAmount), 0);
                                  const cardClass = {
                                    occupied: 'table-card--occupied',
                                    reserved: 'table-card--reserved',
                                    maintenance: 'table-card--maintenance',
                                    unavailable: 'table-card--blocked',
                                    available: 'table-card--available'
                                  }[status] || 'table-card--available';
                                  const statusLabel = {
                                    occupied: 'Occupied',
                                    reserved: 'Reserved',
                                    maintenance: 'Maintenance',
                                    unavailable: 'Blocked',
                                    available: 'Available'
                                  }[status] || 'Available';
                                  
                                  return (
                                    <div key={table.id} className="col-6 col-md-4 col-lg-3 col-xl-2 col-xxl-1">
                                      <Card 
                                        className={`h-100 border shadow-sm rounded-4 table-card-bs ${cardClass}`}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => onTableTileClick(floor.id, table)}
                                      >
                                        <Card.Body className="p-2 p-xl-3">
                                          <div className="d-flex justify-content-between align-items-start mb-1">
                                            <Badge className="table-capacity-badge">
                                              {table.capacity} Seats
                                            </Badge>
                                            <div className={`status-dot ${status === 'occupied' ? 'bg-success pulse-small' : status === 'reserved' ? 'bg-warning' : status === 'maintenance' ? 'bg-secondary' : status === 'unavailable' ? 'bg-dark' : 'bg-secondary opacity-25'}`} style={{width: '10px', height: '10px', borderRadius: '50%'}}></div>
                                          </div>
                                          <div className="table-card-heading mb-1">
                                            <h5 className="fw-bold mb-0 table-card-title">{table.label}</h5>
                                            <Badge className={`table-status-badge table-status-badge--${status}`}>
                                              {statusLabel}
                                            </Badge>
                                          </div>
                                          <div className="small text-muted table-card-copy mb-1">
                                            {status === 'occupied'
                                              ? 'Open order in progress'
                                              : status === 'reserved'
                                              ? reservationSummary || 'Reserved instantly'
                                              : status === 'maintenance'
                                              ? 'Under maintenance'
                                              : status === 'unavailable'
                                              ? 'Temporarily blocked'
                                              : 'Ready for a new guest'}
                                          </div>
                                          {status === 'occupied' && totalAmount > 0 ? (
                                            <div className="table-financials">
                                              <div className="table-financial-row">
                                                <span>Total</span>
                                                <strong>Rs {totalAmount.toLocaleString()}</strong>
                                              </div>
                                              <div className="table-financial-row">
                                                <span>Paid</span>
                                                <strong className="text-success">Rs {paidAmount.toLocaleString()}</strong>
                                              </div>
                                              <div className="table-financial-row">
                                                <span>Due</span>
                                                <strong className={dueAmount > 0 ? 'text-danger' : 'text-success'}>
                                                  Rs {dueAmount.toLocaleString()}
                                                </strong>
                                              </div>
                                            </div>
                                          ) : (
                                            <div className="table-status-note">
                                              {status === 'available' ? 'Tap to start order' : 'Tap for actions'}
                                            </div>
                                          )}
                                        </Card.Body>
                                      </Card>
                                    </div>
                                  );
                                })}
                                <div className="col-6 col-md-4 col-lg-3 col-xl-2 col-xxl-1">
                                  <Card 
                                    className="h-100 border-dashed rounded-4 d-flex align-items-center justify-content-center bg-transparent opacity-50 hover-opacity-100 transition-all"
                                    style={{ cursor: 'pointer', borderStyle: 'dashed' }}
                                    onClick={() => handleAddNewTable(floor.id)}
                                  >
                                    <Card.Body className="p-3 py-4">
                                      <div className="h3 mb-0">+</div>
                                      <div className="small fw-bold">Add Table</div>
                                    </Card.Body>
                                  </Card>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {ROLES.POS.includes(user?.role) && (
                        <div className="">
                          <div className="d-flex align-items-center mb-3 p-3 bg-light rounded-4 flex-wrap gap-2 border">
                            <div>
                              <h6 className="mb-0 fw-bold text-dark">Quick Orders</h6>
                              <small className="text-muted">Start off-table orders directly from the dashboard</small>
                            </div>
                          </div>
                          <div className="row g-2 table-grid-compact">
                             {offTableOrders.map((order) => {
                              const dueAmount = Math.max(order.dueAmount ?? ((order.totalAmount || 0) - (order.paidAmount || 0)), 0);
                              const orderTypeLabel = order.orderType === 'packing' ? 'Packing' : 'Takeaway';
                              const orderCardClass = order.orderType === 'packing'
                                ? 'quick-order-card quick-order-card--packing-live'
                                : 'quick-order-card quick-order-card--takeaway-live';
                              const statusClass = {
                                pending: 'quick-order-status-badge--pending',
                                preparing: 'quick-order-status-badge--preparing',
                                ready: 'quick-order-status-badge--ready',
                                served: 'quick-order-status-badge--served'
                              }[order.status] || 'quick-order-status-badge--pending';

                              return (
                                <div key={order._id} className="col-6 col-md-4 col-lg-3 col-xl-2 col-xxl-1">
                                  <Card
                                    className={`h-100 border shadow-sm rounded-4 table-card-bs ${orderCardClass}`}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => openOffTableOrder(order)}
                                  >
                                    <Card.Body className="p-2 p-xl-3">
                                      <div className="d-flex justify-content-between align-items-start mb-1">
                                        <Badge className="table-capacity-badge">{orderTypeLabel}</Badge>
                                        <Badge className={`table-status-badge quick-order-status-badge ${statusClass}`}>
                                          {order.status}
                                        </Badge>
                                      </div>
                                      <div className="table-card-heading mb-1">
                                        <h5 className="fw-bold mb-0 table-card-title">#{order._id.slice(-4)}</h5>
                                        <span className="quick-order-time">
                                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      </div>
                                      <div className="small text-muted table-card-copy mb-1">
                                        {order.customerName || 'Walk-in customer'}
                                      </div>
                                      <div className="quick-order-detail-list">
                                        <div className="quick-order-detail-row">
                                          <span>Items</span>
                                          <strong>{order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0}</strong>
                                        </div>
                                        <div className="quick-order-detail-row">
                                          <span>Total</span>
                                          <strong>Rs {(order.totalAmount || 0).toLocaleString()}</strong>
                                        </div>
                                        <div className="quick-order-detail-row">
                                          <span>Due</span>
                                          <strong className={dueAmount > 0 ? 'text-danger' : 'text-success'}>
                                            Rs {dueAmount.toLocaleString()}
                                          </strong>
                                        </div>
                                      </div>
                                      <div className="table-status-note">
                                        Tap to continue this {orderTypeLabel.toLowerCase()} order
                                      </div>
                                    </Card.Body>
                                  </Card>
                                </div>
                              );
                            })}
                            <div className="col-6 col-md-4 col-lg-3 col-xl-2 col-xxl-1">
                              <Card
                                className="h-100 border shadow-sm rounded-4 table-card-bs quick-order-card quick-order-card--takeaway"
                                style={{ cursor: 'pointer' }}
                                onClick={() => openDirectOrder('takeaway')}
                              >
                                <Card.Body className="p-2 p-xl-3">
                                  <div className="d-flex justify-content-between align-items-start mb-1">
                                    <Badge className="table-capacity-badge">Quick</Badge>
                                    <div className="status-dot bg-info" style={{width: '10px', height: '10px', borderRadius: '50%'}}></div>
                                  </div>
                                  <div className="table-card-heading mb-1">
                                    <h5 className="fw-bold mb-0 table-card-title">Takeaway</h5>
                                    <Badge className="table-status-badge quick-order-badge">Start</Badge>
                                  </div>
                                  <div className="small text-muted table-card-copy mb-1">
                                    Create a pickup order without assigning a table
                                  </div>
                                  <div className="table-status-note">
                                    Tap to start takeaway order
                                  </div>
                                </Card.Body>
                              </Card>
                            </div>
                            <div className="col-6 col-md-4 col-lg-3 col-xl-2 col-xxl-1">
                              <Card
                                className="h-100 border shadow-sm rounded-4 table-card-bs quick-order-card quick-order-card--packing"
                                style={{ cursor: 'pointer' }}
                                onClick={() => openDirectOrder('packing')}
                              >
                                <Card.Body className="p-2 p-xl-3">
                                  <div className="d-flex justify-content-between align-items-start mb-1">
                                    <Badge className="table-capacity-badge">Quick</Badge>
                                    <div className="status-dot bg-primary" style={{width: '10px', height: '10px', borderRadius: '50%'}}></div>
                                  </div>
                                  <div className="table-card-heading mb-1">
                                    <h5 className="fw-bold mb-0 table-card-title">Packing</h5>
                                    <Badge className="table-status-badge quick-order-badge">Start</Badge>
                                  </div>
                                  <div className="small text-muted table-card-copy mb-1">
                                    Create a packed order directly without table selection
                                  </div>
                                  <div className="table-status-note">
                                    Tap to start packing order
                                  </div>
                                </Card.Body>
                              </Card>
                            </div>
                           
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                  <div className="text-center p-5">
                    <Spinner animation="grow" variant="primary" />
                    <p className="mt-3 text-muted">Synchronizing floor layout...</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        )}

        {/* Operational Intelligence Card */}
        {ROLES.MANAGEMENT.includes(user?.role) && (
          <Col lg={12} className="mb-4">
            <Card className="glass-card ai-glow border-0 overflow-hidden">
              <Card.Header className="bg-transparent border-0 pt-4 px-4 d-flex align-items-center gap-2">
                <div className="bg-indigo-600 p-2 rounded-3 text-white shadow-sm" style={{background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'}}>
                  🤖
                </div>
                <h5 className="mb-0 fw-bold">AI Operational briefing</h5>
              </Card.Header>
              <Card.Body className="p-4">
                {operationalInsights ? (
                  <Row className="g-4">
                    <Col md={8}>
                      <div className="p-4 rounded-4 border bg-glass-inner bg-opacity-50 h-100">
                        <div className="d-flex align-items-center gap-2 mb-3">
                          <Badge className="badge-premium-indigo">Strategic Insight</Badge>
                          <span className="text-muted extra-small">GENERATED JUST NOW</span>
                        </div>
                        <div className="ai-report-text lh-lg fs-5 text-dark">
                          {operationalInsights?.briefing || operationalInsights?.summary || "No automated briefing available for today yet."}
                        </div>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="d-flex flex-column gap-3">
                        <div className="p-3 rounded-4 border bg-glass-inner">
                          <small className="text-muted d-block mb-1 text-uppercase fw-bold tracking-tighter extra-small">Peak Traffic Window</small>
                          <div className="h4 mb-0 fw-bold text-gradient-indigo">
                            {operationalInsights?.peakHours?.length > 0 
                              ? formatHour(operationalInsights.peakHours[0].hour)
                              : 'Pending Data'}
                          </div>
                        </div>
                        <div className="p-3 rounded-4 border bg-glass-inner">
                          <small className="text-muted d-block mb-1 text-uppercase fw-bold tracking-tighter extra-small">Bestseller Today</small>
                          <div className="h4 mb-0 fw-bold text-gradient-indigo">
                            {operationalInsights?.popularItems?.length > 0 
                              ? operationalInsights.popularItems[0].name 
                              : 'Pending Data'}
                          </div>
                        </div>
                        <div className="p-3 rounded-4 border bg-glass-inner">
                          <small className="text-muted d-block mb-1 text-uppercase fw-bold tracking-tighter extra-small">Inventory Health</small>
                          <div className={`h4 mb-0 fw-bold ${stats.lowStockItems > 3 ? 'text-danger' : 'text-success'}`}>
                            {stats.lowStockItems > 3 ? 'Critical' : 'Stable'}
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                ) : (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="indigo" />
                    <p className="mt-3 text-muted">AI is analyzing patterns...</p>
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
                          <div className="fw-semibold">#{order?._id?.slice(-6) || 'N/A'}</div>
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
