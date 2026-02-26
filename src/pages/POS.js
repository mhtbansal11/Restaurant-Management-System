import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../config';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Badge,
  Form, 
  InputGroup, 
  Modal,
  Table,
  ListGroup,
  Alert
} from 'react-bootstrap';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import TableSelectionModal from '../components/TableSelectionModal';
import CartPopup from '../components/CartPopup';
import './POS.css';

const POS = () => {
  const { user } = useAuth();
  console.log("user",user)
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orderType, setOrderType] = useState('dine-in');
  const [tables, setTables] = useState([]);
  console.log("tables", tables);
  const [loadingTables, setLoadingTables] = useState(false);
  console.log("loadingTables", loadingTables);
  const [selectedTable, setSelectedTable] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [showBillModal, setShowBillModal] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', _id: null, pendingBalance: 0 });
  const [customerResults, setCustomerResults] = useState([]);
  const [loading, setLoading] = useState(true);
  console.log("loading", loading, setLoading);
  const [outletInfo, setOutletInfo] = useState({ 
    name: '', 
    address: '', 
    phone: '', 
    settings: { taxRate: 5, currency: 'INR', gstNumber: '', isGstEnabled: false, serviceCharge: 0 } 
  });
  const [recommendations, setRecommendations] = useState([]);
  console.log("recommendations", recommendations);
  const [loadingRecs, setLoadingRecs] = useState(false);
  console.log("loadingRecs", loadingRecs);
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMode, setPaymentMode] = useState('cash');
  const [showSettleModal, setShowSettleModal] = useState(false);
    const [showKOTModal, setShowKOTModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [keepTableOccupiedAfterPay, setKeepTableOccupiedAfterPay] = useState(false);
  const [showCartPopup, setShowCartPopup] = useState(false);

  // Invoicing and Tax States
  const [discountPercent, setDiscountPercent] = useState(0);
  const [enableTax, setEnableTax] = useState(user?.isGstEnabled || user?.enableGST || false);
  const [enableServiceCharge, setEnableServiceCharge] = useState(false);

  const round2 = useCallback((value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100, []);

  const resolveDiscountPercent = useCallback((order) => {
    const directPercent = Number(order?.discountPercent);
    if (!Number.isNaN(directPercent) && directPercent > 0) {
      return directPercent;
    }
    const discountAmount = Number(order?.discountAmount || 0);
    const subtotal = Number(order?.subtotal || 0);
    if (discountAmount > 0 && subtotal > 0) {
      return round2((discountAmount / subtotal) * 100);
    }
    return 0;
  }, [round2]);

  // Update enableTax when user context or outlet settings change
  useEffect(() => {
    const isGstEnabled = outletInfo.settings.isGstEnabled || user?.isGstEnabled || user?.enableGST || false;
    if (currentOrder) {
      const orderTaxApplied = (currentOrder.taxAmount || 0) > 0;
      setEnableTax(orderTaxApplied);
      return;
    }
    setEnableTax(isGstEnabled);
  }, [user, outletInfo.settings.isGstEnabled, currentOrder]);

  useEffect(() => {
    if (!currentOrder) return;
    const orderServiceChargeApplied = (currentOrder.serviceChargeAmount || 0) > 0;
    setEnableServiceCharge(orderServiceChargeApplied);
  }, [currentOrder]);

  // Explicitly declare selectedTable for ESLint
  const selectedTableState = selectedTable;
  console.log("selectedTableState",selectedTableState)
  const setSelectedTableState = setSelectedTable;
  console.log("selectedTable",selectedTable)

  const fetchTables = async () => {
    try {
      setLoadingTables(true);
      const response = await axios.get(config.ENDPOINTS.TABLES);
      setTables(response.data);
    } catch (error) {
      console.error('Error fetching tables:', error);
      toast.error('Failed to fetch tables');
    } finally {
      setLoadingTables(false);
    }
  };

  useEffect(() => {
    if (orderType === 'dine-in') {
      fetchTables();
    }
  }, [orderType]);

  const fetchActiveOrderForTable = useCallback(async () => {
    if (!selectedTableState) return;
    try {
      const orderResponse = await axios.get(`${config.ENDPOINTS.ORDERS}?tableId=${selectedTableState.id}`);
      const activeOrders = orderResponse.data.filter(
        (order) => !['completed', 'cancelled'].includes(order.status)
      );
      if (activeOrders.length > 0) {
        const order = activeOrders[0];
        setCurrentOrder(order);
        setCart(order.items.map(item => ({
          ...item,
          _id: item.menuItem?._id || item.menuItem,
          orderItemId: item._id,
          cartId: item._id, // Use order item ID as cartId for existing items
          name: item.menuItem?.name || 'Unknown Item',
          quantity: item.quantity || 1
        })));
        setCustomerInfo({
          name: order.customerName,
          phone: order.customerPhone,
          _id: order.customer?._id || order.customer,
          pendingBalance: 0 // Will be fetched if needed
        });
        setPaidAmount((order.paidAmount || 0) > 0 ? (order.dueAmount || 0) : (order.totalAmount || 0));
        setDiscountPercent(resolveDiscountPercent(order));
        const orderTaxApplied = (order.taxAmount || 0) > 0;
        setEnableTax(orderTaxApplied);
        const orderServiceChargeApplied = (order.serviceChargeAmount || 0) > 0;
        setEnableServiceCharge(orderServiceChargeApplied);
      }
    } catch (error) {
      console.error('Error fetching active order:', error);
    }
  }, [selectedTableState, resolveDiscountPercent]);

  const fetchOrderById = async (orderId) => {
    try {
      const response = await axios.get(`${config.ENDPOINTS.ORDERS}/${orderId}`);
      const order = response.data;
      setCurrentOrder(order);
      setOrderType(order.orderType);
      if (order.orderType === 'dine-in' && order.tableId) {
        setSelectedTable({ id: order.tableId, label: order.tableLabel });
      }
      setCart(order.items.map(item => ({
        ...item,
        _id: item.menuItem?._id || item.menuItem,
        orderItemId: item._id,
        cartId: item._id, // Use order item ID as cartId for existing items
        name: item.menuItem?.name || 'Unknown Item',
        quantity: item.quantity || 1
      })));
      setCustomerInfo({
        name: order.customerName,
        phone: order.customerPhone,
        _id: order.customer?._id || order.customer,
        pendingBalance: 0
      });
      setPaidAmount((order.paidAmount || 0) > 0 ? (order.dueAmount || 0) : (order.totalAmount || 0));
      setDiscountPercent(resolveDiscountPercent(order));
      const orderTaxApplied = (order.taxAmount || 0) > 0;
      setEnableTax(orderTaxApplied);
      const orderServiceChargeApplied = (order.serviceChargeAmount || 0) > 0;
      setEnableServiceCharge(orderServiceChargeApplied);
    } catch (error) {
      console.error('Error fetching order by ID:', error);
    }
  };

  useEffect(() => {
    fetchMenu();
    fetchOutletSettings();
  }, []);

  useEffect(() => {
    if (orderType === 'dine-in' && !currentOrder) {
      fetchActiveOrderForTable();
    }
  }, [orderType, fetchActiveOrderForTable, currentOrder]);

  useEffect(() => {
    // Check for pre-selected table from URL parameters
    const tableId = searchParams.get('tableId');
    const tableLabel = searchParams.get('tableLabel');
    const orderTypeParam = searchParams.get('type');
    const orderId = searchParams.get('orderId');
    
    if (tableId && tableLabel) {
      setSelectedTable({
        id: tableId,
        label: tableLabel
      });
    }
    
    if (orderTypeParam) {
      setOrderType(orderTypeParam);
    }
    
    // If specific orderId is provided, load that order
    if (orderId) {
      fetchOrderById(orderId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // Added searchParams as dependency

  const fetchOutletSettings = async () => {
    try {
      const response = await axios.get(`${config.ENDPOINTS.OUTLET}/current`);
      setOutletInfo(response.data);
    } catch (error) {
      console.error('Error fetching outlet settings:', error);
    }
  };

  const fetchRecommendations = async () => {
    setLoadingRecs(true);
    try {
      // Debounce could be added here
      const response = await axios.post(config.ENDPOINTS.AI_CHAT.replace('/chat', '/recommend'), {
        cartItems: cart
      });
      setRecommendations(response.data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoadingRecs(false);
    }
  };

  useEffect(() => {
    if (cart.length > 0) {
      fetchRecommendations();
    } else {
      setRecommendations([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart]);

  const fetchMenu = async () => {
    try {
      const response = await axios.get(config.ENDPOINTS.MENU);
      setMenuItems(response.data);
      
      const cats = ['All', ...new Set(response.data.map(item => item.category))];
      setCategories(cats);
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  };

  const addToCart = (item) => {
    // Prevent adding out of stock items
    if (item.isAvailable === false) {
      toast.error('This item is currently out of stock');
      return;
    }
    
    // In POS, we want to merge new items with:
    // 1. Items that haven't been sent to the kitchen yet (no orderItemId)
    // 2. Items that are already sent but are still 'queued' (not started yet)
    
    const existingIndex = cart.findIndex(i => 
      i._id === item._id && 
      (!i.status || i.status === 'queued')
    );
    
    if (existingIndex > -1) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += 1;
      setCart(newCart);
    } else {
      setCart([...cart, { ...item, quantity: 1, cartId: Date.now() }]);
    }
  };

  const removeFromCart = (cartId, itemId) => {
    const item = cart.find(i => (cartId && i.cartId === cartId) || (!cartId && i._id === itemId));
    
    // Prevent removing or cancelling if item is already served
    if (item && item.status === 'served') {
      toast.error('Served items cannot be removed or cancelled');
      return;
    }

    // If item is already in the order (has an _id from the database), mark it as cancelled instead of removing it
    if (item && item._id && !item.cartId) {
      if (item.status === 'cancelled') {
        // If it's already cancelled, maybe we want to un-cancel it? 
        // For now, let's just allow toggling or removing if it's new
        setCart(cart.map(i => i._id === itemId ? { ...i, status: 'queued' } : i));
      } else {
        setCart(cart.map(i => i._id === itemId ? { ...i, status: 'cancelled' } : i));
      }
      return;
    }

    if (cartId) {
      setCart(cart.filter(i => i.cartId !== cartId));
    } else {
      setCart(cart.filter(i => i._id !== itemId));
    }
  };

  const updateQuantity = (cartId, itemId, delta) => {
    const item = cart.find(i => (cartId && i.cartId === cartId) || (!cartId && i._id === itemId));
    
    // Prevent updating quantity if item is already served
    if (item && item.status === 'served') {
      toast.error('Quantity cannot be updated for served items');
      return;
    }

    setCart(cart.map(i => {
      if ((cartId && i.cartId === cartId) || (!cartId && i._id === itemId)) {
        const newQty = i.quantity + delta;
        return newQty > 0 ? { ...i, quantity: newQty } : i;
      }
      return i;
    }));
  };

  const calculateTotal = () => {
    const total = cart.reduce((sum, item) => {
      if (item.status === 'cancelled') return sum;
      return sum + (item.price * item.quantity);
    }, 0);
    return round2(total);
  };

  const calculateDiscount = () => {
    return round2(calculateTotal() * (discountPercent / 100));
  };

  const calculateSubtotalAfterDiscount = () => {
    return round2(calculateTotal() - calculateDiscount());
  };

  const calculateTax = () => {
    if (!enableTax) return 0;
    const taxRate = user?.taxRate || outletInfo.settings.taxRate || 0;
    return round2(calculateSubtotalAfterDiscount() * (taxRate / 100));
  };

  const calculateServiceCharge = () => {
    if (!enableServiceCharge) return 0;
    const serviceChargeRate = user?.serviceChargeRate || outletInfo.settings.serviceCharge || 0;
    return round2(calculateSubtotalAfterDiscount() * (serviceChargeRate / 100));
  };

  const calculateGrandTotal = () => {
    return round2(calculateSubtotalAfterDiscount() + calculateTax() + calculateServiceCharge());
  };

  const baseTotal = calculateGrandTotal();
  const existingPaidAmount = Number(currentOrder?.paidAmount || 0);
  const hasExistingPayment = existingPaidAmount > 0;
  const computedDueAmount = round2(Math.max(baseTotal - existingPaidAmount, 0));
  const effectiveTotal = currentOrder && hasExistingPayment ? computedDueAmount : baseTotal;

  const getFrequentlyBoughtTogether = () => {
    if (cart.length === 0) return [];
    
    // Get all menu items that are not in cart and are available
    const frequentlyBought = menuItems.filter(item => {
      const notInCart = !cart.find(cartItem => cartItem._id === item._id);
      const isAvailable = item.isAvailable !== false;
      return notInCart && isAvailable;
    });
    
    // Simple logic: return items from same categories as cart items
    const cartCategories = [...new Set(cart.map(item => item.category))];
    const filteredItems = frequentlyBought.filter(item => 
      cartCategories.includes(item.category)
    );
    
    // Return top 6 items, sorted by category
    return filteredItems
      .sort((a, b) => a.category.localeCompare(b.category))
      .slice(0, 6);
  };

  const searchCustomers = async (query) => {
    if (!query) {
      setCustomerResults([]);
      return;
    }
    try {
      const response = await axios.get(`${config.ENDPOINTS.CUSTOMERS}?search=${query}`);
      setCustomerResults(response.data);
    } catch (error) {
      console.error('Error searching customers:', error);
    }
  };

  const selectCustomer = (customer) => {
    setCustomerInfo({
      name: customer.name,
      phone: customer.phone,
      _id: customer._id,
      pendingBalance: customer.pendingBalance || 0
    });
    setCustomerResults([]);
  };

  const handleCustomerInputChange = (field, value) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value, _id: null, pendingBalance: 0 }));
    if (value.length > 2) {
      searchCustomers(value);
    } else {
      setCustomerResults([]);
    }
  };

  const handleCheckout = async () => {
    console.log("orderType",orderType, selectedTable)
    if (orderType === 'dine-in' && (!selectedTable?.id || selectedTable?.id === 'null')) {
      toast.error('You need to select a table in order to give dine-in order');
      return;
    }
    try {
      // First ensure customer is saved/updated if they have a name and phone
      let customerId = customerInfo._id;
      if (customerInfo.name && customerInfo.phone && !customerId) {
        const custRes = await axios.post(config.ENDPOINTS.CUSTOMERS, {
          name: customerInfo.name,
          phone: customerInfo.phone
        });
        customerId = custRes.data._id;
      }

      const orderData = {
        items: cart.map(item => ({
          _id: item.orderItemId,
          menuItem: item._id,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes || '',
          status: item.status || 'queued'
        })),
        customer: customerId,
        tableId: orderType === 'dine-in' ? (selectedTable?.id || null) : null,
        tableLabel: orderType === 'dine-in' ? (selectedTable?.label || null) : null,
        orderType,
        totalAmount: calculateGrandTotal(),
        subtotal: calculateTotal(),
        discountPercent: discountPercent,
        discountAmount: calculateDiscount(),
        taxRate: user?.taxRate || outletInfo.settings.taxRate || 0,
        taxAmount: calculateTax(),
        serviceChargeRate: user?.serviceChargeRate || outletInfo.settings.serviceCharge || 0,
        serviceChargeAmount: calculateServiceCharge(),
        paymentMode: 'cash',
        status: 'pending',
        customerName: customerInfo.name || '',
        customerPhone: customerInfo.phone || ''
      };

      let response = {};
      
      if (currentOrder) {
        // Update existing order
         response = await axios.put(`${config.ENDPOINTS.ORDERS}/${currentOrder._id}`, orderData);
      } else {
        // Create new order
        response = await axios.post(config.ENDPOINTS.ORDERS, orderData);
      }
      
      setCurrentOrder(response.data);
      setPaidAmount(effectiveTotal); // Default to full payment
      setShowKOTModal(true);
    } catch (error) {
      console.error('Checkout failed:', error);
      toast.error('Checkout failed');
    }
  };

  // Print functionality
  const handlePrint = () => {
    // Only show items that are NEW (queued)
    const newItems = currentOrder?.items.filter(item => item.status === 'queued') || [];

    if (newItems.length === 0) {
      toast('No new items to print KOT', { icon: 'ℹ️' });
      return;
    }

    const printContent = `
      <style>
        @media print {
          @page { margin: 0; }
          body { 
            font-family: 'Courier New', Courier, monospace;
            font-size: 14px;
            line-height: 1.2;
            width: 80mm; 
            margin: 0;
            padding: 5mm;
            color: #000;
          }
          .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 5px; margin-bottom: 10px; }
          .section-header { 
            font-weight: bold; 
            text-align: center;
            margin-top: 10px; 
            margin-bottom: 5px;
            font-size: 18px;
            background: #000;
            color: #fff;
            padding: 2px;
          }
          table { width: 100%; }
          .qty { font-weight: bold; width: 30px; font-size: 18px; }
          .item-name { font-weight: bold; font-size: 16px; }
          .footer { border-top: 1px dashed #000; margin-top: 10px; padding-top: 5px; text-align: center; font-size: 12px; }
          .print-only { display: block !important; }
        }
        @media screen {
          .print-only { display: none; }
        }
      </style>
      
      <div class="print-only">
        <div class="header">
          <h2 style="margin:0;">KOT (NEW)</h2>
          <div style="font-size: 22px; font-weight: bold;">
            ${orderType === 'dine-in' 
              ? `DINE-IN: ${currentOrder?.tableLabel || selectedTableState?.label || 'N/A'}`
              : orderType === 'takeaway'
              ? 'TAKEAWAY'
              : orderType === 'packing'
              ? 'PACKING'
              : `TABLE: ${currentOrder?.tableLabel || selectedTableState?.label || 'TAKEAWAY'}`}
          </div>
          <div>Order: #${currentOrder?.orderNumber || currentOrder?._id?.slice(-6)}</div>
          <div>Time: ${new Date().toLocaleTimeString()}</div>
        </div>

        <div class="section-header">ITEMS TO PREPARE</div>
        <table cellspacing="0" cellpadding="5">
          ${newItems.map(item => `
            <tr>
              <td class="qty">${item.quantity}x</td>
              <td class="item-name">${(item.menuItem?.name || item.name).toUpperCase()}</td>
            </tr>
            ${item.notes ? `<tr><td></td><td style="font-size:14px; font-style:italic;">* ${item.notes}</td></tr>` : ''}
          `).join('')}
        </table>

        <div class="footer">
          *** End of Ticket ***
        </div>
      </div>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head><title>Print KOT</title></head>
        <body>${printContent}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // Settlement and Print functionality
  const handlePrintBill = () => {
    const printContent = `
      <style>
        @media print {
          @page { margin: 0; }
          body { 
            font-family: 'Courier New', Courier, monospace;
            font-size: 12px;
            line-height: 1.2;
            width: 80mm;
            margin: 0;
            padding: 5mm;
            color: #000;
          }
          .text-center { text-align: center; }
          .fw-bold { font-weight: bold; }
          .my-2 { margin-top: 10px; margin-bottom: 10px; }
          .mb-1 { margin-bottom: 5px; }
          .mb-3 { margin-bottom: 15px; }
          .d-flex { display: flex; }
          .justify-content-between { justify-content: space-between; }
          .flex-grow-1 { flex-grow: 1; }
          .border-dashed { border-top: 1px dashed #000; }
          .border-double { border-top: 3px double #000; }
          .print-only { display: block !important; }
        }
        @media screen {
          .print-only { display: none; }
        }
      </style>
      
      <div class="print-only">
        <div class="text-center">
          <h2 style="margin:0; font-size: 20px;">${user?.restaurantName}</h2>
          <div style="font-size: 11px;">${outletInfo.address}</div>
          ${outletInfo.settings.gstNumber ? `<div style="font-size: 11px;">GSTIN: ${outletInfo.settings.gstNumber}</div>` : ''}
          <div style="font-size: 11px;">PH: ${outletInfo.phone}</div>
          <div class="my-2 border-dashed"></div>
          <div class="fw-bold" style="font-size: 16px;">TAX INVOICE</div>
          <div class="my-2 border-dashed"></div>
        </div>

        <div class="mb-3" style="font-size: 11px;">
          <div class="d-flex justify-content-between">
            <span>BILL NO: #${currentOrder?._id.slice(-6).toUpperCase()}</span>
            <span class="fw-bold">
              ${orderType === 'dine-in' 
                ? `DINE-IN (${currentOrder?.tableLabel || selectedTableState?.label || 'N/A'})`
                : orderType?.toUpperCase() || 'T-AWAY'}
            </span>
          </div>
          <div class="d-flex justify-content-between">
            <span>DATE: ${new Date().toLocaleDateString('en-GB')}</span>
            <span>TIME: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        <div class="border-dashed py-2 mb-3">
          <div class="d-flex fw-bold mb-1" style="font-size: 11px;">
            <span style="width: 30px;">QTY</span>
            <span class="flex-grow-1">ITEM DESCRIPTION</span>
            <span style="width: 70px; text-align: right;">PRICE</span>
          </div>
          <div class="border-dashed mb-1"></div>
          ${currentOrder?.items.filter(item => item.status !== 'cancelled').map(item => `
            <div class="d-flex mb-1" style="font-size: 12px;">
              <span style="width: 30px;">${item.quantity}</span>
              <span class="flex-grow-1">${(item.name || item.menuItem?.name).toUpperCase()}</span>
              <span style="width: 70px; text-align: right;">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          `).join('')}
        </div>

        <div style="margin-left: auto; width: 100%;">
          <div class="border-dashed mb-1"></div>
          <div class="d-flex justify-content-between mb-1">
            <span>Subtotal:</span>
            <span>₹${calculateTotal().toFixed(2)}</span>
          </div>
           <div class="d-flex justify-content-between" style="font-size: 12px; margin-top:4px;">
              <span>PAID:</span>
              <span>-₹${existingPaidAmount.toFixed(2)}</span>
            </div>
          ${discountPercent > 0 ? `
            <div class="d-flex justify-content-between mb-1">
              <span>Discount (${discountPercent}%):</span>
              <span>-₹${calculateDiscount().toFixed(2)}</span>
            </div>
          ` : ''}
          ${enableTax ? `
            <div class="d-flex justify-content-between mb-1">
              <span>CGST (${(user?.taxRate || outletInfo.settings.taxRate) / 2}%):</span>
              <span>₹${(calculateTax() / 2).toFixed(2)}</span>
            </div>
            <div class="d-flex justify-content-between mb-1">
              <span>SGST (${(user?.taxRate || outletInfo.settings.taxRate) / 2}%):</span>
              <span>₹${(calculateTax() / 2).toFixed(2)}</span>
            </div>
          ` : ''}
          ${enableServiceCharge ? `
            <div class="d-flex justify-content-between mb-1">
              <span>Service Charge (${user?.serviceChargeRate || outletInfo.settings.serviceCharge || 0}%):</span>
              <span>₹${calculateServiceCharge().toFixed(2)}</span>
            </div>
          ` : ''}
          <div class="border-dashed my-1"></div>
           ${existingPaidAmount > 0 ? `
           
            <div class="d-flex justify-content-between my-2" style="font-size: 12px;">
              <span>DUE NOW:</span>
              <span>₹${computedDueAmount.toFixed(2)}</span>
            </div>
          ` : ''}
           <div class="border-dashed my-1"></div>
          <div class="d-flex justify-content-between fw-bold" style="font-size: 18px;">
            <span>GRAND TOTAL:</span>
            <span>₹${(existingPaidAmount > 0 ? computedDueAmount : calculateGrandTotal()).toFixed(2)}</span>
          </div>
         
          <div class="border-double my-1"></div>
        </div>

        <div class="text-center mt-4" style="font-size: 11px;">
          <div>THANK YOU FOR VISITING!</div>
          <div class="fw-bold">HAVE A NICE DAY</div>
          <div class="mt-2" style="font-size: 9px;">* Computer Generated Invoice *</div>
        </div>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head><title>Print Invoice</title></head>
        <body>${printContent}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleSettleOrder = async (autoPrint = false) => {
    try {
      if (effectiveTotal <= 0) {
        toast.error('No due amount to settle');
        return;
      }

      if (paymentMode === 'due') {
        if (hasExistingPayment) {
          setShowSettleModal(false);
          setShowBillModal(false);
          setCart([]);
          setCustomerInfo({ name: '', phone: '', _id: null, pendingBalance: 0 });
          toast.success('Order closed with due amount');
          navigate('/');
          return;
        }
        const response = await axios.put(`${config.ENDPOINTS.ORDERS}/${currentOrder._id}/pay`, {
          paymentMode: 'due',
          paidAmount: 0,
          customerId: customerInfo._id
        });
        setShowSettleModal(false);
        setShowBillModal(false);
        setCurrentOrder(response.data);
        setPaidAmount(0);
        toast.success('Order marked as due');
        return;
      }

      const amountToCollect = Number(paidAmount || 0);
      if (Number.isNaN(amountToCollect) || amountToCollect <= 0) {
        toast.error('Please enter a valid amount');
        return;
      }
      if (hasExistingPayment && amountToCollect > effectiveTotal + 0.01) {
        toast.error('Collected amount cannot exceed due amount');
        return;
      }

      let response = null;
      if (hasExistingPayment || (currentOrder?.dueAmount || 0) > 0) {
        response = await axios.put(`${config.ENDPOINTS.ORDERS}/${currentOrder._id}/settle-due`, {
          settledAmount: amountToCollect,
          paymentMode
        });
      } else {
        response = await axios.put(`${config.ENDPOINTS.ORDERS}/${currentOrder._id}/pay`, {
          paymentMode,
          paidAmount: amountToCollect,
          customerId: customerInfo._id,
          keepTableOccupied: keepTableOccupiedAfterPay,
          markCompleted: false,
          freeTable: !keepTableOccupiedAfterPay
        });
      }
      
      if (autoPrint) {
        handlePrintBill();
      }

      setShowSettleModal(false);
      setShowBillModal(false);
      if (response?.data?.dueAmount > 0) {
        setCurrentOrder(response.data);
        setPaidAmount(response.data.dueAmount);
        toast.success('Payment recorded. Due amount remaining.');
        return;
      }

      setCart([]);
      setCustomerInfo({ name: '', phone: '', _id: null, pendingBalance: 0 });
      setKeepTableOccupiedAfterPay(false);
      toast.success('Order settled successfully!');
      navigate('/');
    } catch (error) {
      console.error('Settlement failed:', error);
      toast.error('Settlement failed');
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Container fluid className="pos-container m-0 p-0">
      <Row className="g-0 h-100">
        {/* Main Content: Menu */}
        <Col lg={8} xl={9} className="p-4 overflow-auto h-100">
          <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="d-flex align-items-center">
                <div className="btn-group btn-group-sm rounded-pill overflow-hidden shadow-sm">
                  <Button 
                    variant={orderType === 'dine-in' ? 'primary' : 'outline-primary'}
                   
                    onClick={() => setOrderType('dine-in')}
                  >
                    🍽️ Dine-in
                  </Button>
                  <Button 
                    variant={orderType === 'takeaway' ? 'primary' : 'outline-primary'}
                   
                    onClick={() => {
                      setOrderType('takeaway');
                      setSelectedTable(null);
                    }}
                  >
                    🥡 Takeaway
                  </Button>
                  <Button 
                    variant={orderType === 'packing' ? 'primary' : 'outline-primary'}
                   
                    onClick={() => {
                      setOrderType('packing');
                      setSelectedTable(null);
                    }}
                  >
                    📦 Packing
                  </Button>
                </div>
                {currentOrder && <Badge bg="info" className="ms-2 px-3 py-2 rounded-pill">Order #{currentOrder.orderNumber || currentOrder._id.slice(-6)}</Badge>}
              </div>
            <div className="d-flex gap-3 align-items-center" style={{ minWidth: '300px' }}>
              <InputGroup className="shadow-sm rounded-pill overflow-hidden">
                <InputGroup.Text className="bg-white border-end-0 ps-3">🔍</InputGroup.Text>
                <Form.Control
                  placeholder="Search dishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-start-0 py-2"
                />
              </InputGroup>
            </div>
          </div>

          {/* Categories */}
          <div className="category-tabs-scroll d-flex gap-2 mb-4 pb-2 overflow-auto">
            {categories.map(cat => (
              <Button
                key={cat}
                variant={activeCategory === cat ? 'primary' : 'white'}
                className={`px-4 py-2 rounded-pill shadow-sm text-nowrap border-0 ${activeCategory === cat ? '' : 'text-muted'}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>

          {/* Product Grid */}
          <Row className="g-4">
            {filteredItems.map(item => (
              <Col key={item._id} sm={6} md={6} lg={6} xl={3}>
                <Card 
                  className={`menu-card-bs shadow-sm h-100 rounded-4 overflow-hidden ${item.isAvailable === false ? 'out-of-stock-card' : 'clickable'}`}
                  onClick={() => addToCart(item)}
                >
                  {item.isAvailable === false && (
                    <div className="position-absolute top-0 end-0">
                      <Badge bg="danger" className="px-2 py-1" style={{fontSize: '0.7rem'}}>
                        Out of Stock
                      </Badge>
                    </div>
                  )}
                  
                  <Card.Body className="p-3">
                    <div className="d-flex justify-content-between align-items-start gap-2">
                      <Card.Title className={`h6 mb-0 ${item.isAvailable === false ? 'text-muted' : 'text-dark'} fw-semibold`}>{item.name}</Card.Title>
                      <span className={`fw-bold ${item.isAvailable === false ? 'text-muted' : 'text-primary'}`}>₹{item.price}</span>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Frequently Bought Together */}
          {getFrequentlyBoughtTogether().length > 0 && (
            <div className="mt-5 pt-4 border-top">
              <h6 className="text-muted mb-3 fw-bold">🔥 Frequently Bought Together</h6>
              <div className="d-flex gap-2 flex-wrap">
                {getFrequentlyBoughtTogether().map((item, index) => (
                  <div key={index} className="bg-white p-2 rounded border shadow-sm" style={{minWidth: '100px', cursor: 'pointer'}} onClick={() => addToCart(item)}>
                    <div className="text-center">
                      <div className="fw-bold small text-truncate">{item.name}</div>
                      <div className="text-primary small">₹{item.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
           )} 
        </Col>

        {/* Sidebar: Cart & Customer */}
        <Col lg={4} xl={3} className="pos-sidebar-bs bg-white h-100 d-flex flex-column shadow-lg">
          <div className="p-4 border-bottom bg-light">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0 fw-bold">Customer Details</h5>
              <Badge bg={orderType === 'dine-in' ? 'primary' : orderType === 'takeaway' ? 'success' : 'secondary'} className="px-3 py-2 rounded-pill">
                {orderType === 'dine-in' ? '🍽️ Dine-In' : orderType === 'takeaway' ? '🥡 Takeaway' : '📦 Packing'}
              </Badge>
            </div>
            
            {orderType === 'dine-in' && (
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold text-muted text-uppercase">Table Selection</Form.Label>
                <div className="d-flex gap-2 align-items-center">
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => setShowTableModal(true)}
                    className="flex-grow-1"
                  >
                    🪑 {selectedTableState ? 'Change Table' : 'Select Table'}
                  </Button>
                  {selectedTableState && (
                    <Badge bg="info" className="px-2 py-1">
                      {selectedTableState.label}
                    </Badge>
                  )}
                </div>
              </Form.Group>
            )}
            <Form.Group className="mb-3 position-relative">
              <Form.Label className="small fw-bold text-muted text-uppercase">Phone Number</Form.Label>
              <Form.Control
                type="text"
                placeholder="Search or enter phone..."
                value={customerInfo.phone}
                onChange={(e) => handleCustomerInputChange('phone', e.target.value)}
                className="rounded-3 border-0 shadow-sm"
              />
              {customerResults.length > 0 && (
                <ListGroup className="position-absolute w-100 z-3 shadow-lg rounded-3 mt-1 overflow-hidden">
                  {customerResults.map(c => (
                    <ListGroup.Item 
                      key={c._id} 
                      action 
                      onClick={() => selectCustomer(c)}
                      className="border-0 py-2"
                    >
                      <div className="fw-bold">{c.name}</div>
                      <div className="small text-muted">{c.phone}</div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Form.Group>
            <Form.Group>
              <Form.Label className="small fw-bold text-muted text-uppercase">Customer Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Guest Customer"
                value={customerInfo.name}
                onChange={(e) => handleCustomerInputChange('name', e.target.value)}
                className="rounded-3 border-0 shadow-sm"
              />
            </Form.Group>
            
            {customerInfo.pendingBalance > 0 && (
              <Alert variant="warning" className="p-2 mt-3 mb-0 d-flex justify-content-between align-items-center border-0 shadow-sm">
                <div className="small">
                  <strong>Due Balance:</strong> ₹{customerInfo.pendingBalance.toFixed(2)}
                </div>
              </Alert>
            )}
          </div>

          <div className="flex-grow-1 overflow-auto p-4 cart-items-list">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="mb-0 fw-bold">Current Cart</h5>
              <div className="d-flex align-items-center gap-2">
                <Badge bg="primary" pill>{cart.length} items</Badge>
                <Button 
                  size="sm" 
                  variant="outline-primary"
                  onClick={() => setShowCartPopup(true)}
                  disabled={cart.length === 0}
                >
                  🛒 Edit Cart
                </Button>
              </div>
            </div>
            
            {cart.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <div className="display-4 mb-3">🛒</div>
                <p>Your cart is empty</p>
              </div>
            ) : (
              <ListGroup variant="flush" className="compact-cart">
                {cart.map(item => (
                  <ListGroup.Item key={item.cartId || item._id} className={`px-2 py-2 mb-2 border rounded-3 ${item.status === 'cancelled' ? 'bg-light opacity-75' : ''}`}>
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <div className={`fw-bold small ${item.status === 'cancelled' ? 'text-decoration-line-through text-muted' : 'text-dark'}`} style={{wordBreak: 'break-word', lineHeight: '1.2'}}>{item.name}</div>
                        {item.status && (
                          <Badge bg={item.status === 'ready' ? 'success' : item.status === 'cancelled' ? 'danger' : 'info'} size="sm" className="extra-small opacity-75">
                            {item.status}
                          </Badge>
                        )}
                      </div>
                      <Button 
                        variant="link" 
                        className={`p-0 text-decoration-none ${item.status === 'cancelled' ? 'text-primary' : 'text-danger'}`}
                        onClick={() => removeFromCart(item.cartId, item._id)}
                        disabled={item.status === 'served'}
                        style={{visibility: item.status === 'served' ? 'hidden' : 'visible'}}
                      >
                        {item.status === 'cancelled' ? '↺' : '✕'}
                      </Button>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mt-2">
                      <div className="d-flex align-items-center bg-light rounded-pill px-1">
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="p-0 px-1 text-decoration-none text-dark"
                          onClick={() => updateQuantity(item.cartId, item._id, -1)}
                          disabled={item.status === 'cancelled' || item.status === 'served'}
                        >
                          −
                        </Button>
                        <span className={`px-2 small fw-bold ${item.status === 'cancelled' ? 'text-decoration-line-through text-muted' : ''}`}>{item.quantity}</span>
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="p-0 px-1 text-decoration-none text-dark"
                          onClick={() => updateQuantity(item.cartId, item._id, 1)}
                          disabled={item.status === 'cancelled' || item.status === 'served'}
                        >
                          +
                        </Button>
                      </div>
                      <div className={`fw-bold small text-nowrap ${item.status === 'cancelled' ? 'text-decoration-line-through text-muted' : ''}`}>₹{(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </div>
          
          {/* Frequently Bought Together */}
          {/* {cart.length > 0 && getFrequentlyBoughtTogether().length > 0 && (
            <div className="p-3 bg-light border-top">
              <h6 className="text-muted mb-3 fw-bold">🔥 Frequently Bought Together</h6>
              <div className="d-flex gap-2 flex-wrap">
                { getFrequentlyBoughtTogether().map((item, index) => (
                  <div key={index} className="bg-white p-2 rounded border shadow-sm" style={{minWidth: '120px', cursor: 'pointer'}} onClick={() => addToCart(item)}>
                    <div className="text-center">
                      <div className="fw-bold small text-truncate">{item.name}</div>
                      <div className="text-primary small">₹{item.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )} */}

          <div className="p-4 bg-light border-top mt-auto">
            <div className="mb-3">
              <Row className="g-2 mb-2">
                <Col xs={6}>
                  <Form.Group>
                    <Form.Label className="extra-small fw-bold text-muted text-uppercase mb-1">Discount (%)</Form.Label>
                    <Form.Control 
                      type="number" 
                      size="sm" 
                      value={discountPercent} 
                      onChange={(e) => setDiscountPercent(Math.max(0, Math.min(100, Number(e.target.value))))}
                      placeholder="0"
                      className="rounded-3"
                    />
                  </Form.Group>
                </Col>
                <Col xs={6} className="d-flex align-items-end gap-2">
                  <Form.Check 
                    type="switch"
                    id="tax-switch"
                    label={<span className="extra-small fw-bold text-muted text-uppercase">Tax</span>}
                    checked={enableTax}
                    onChange={(e) => setEnableTax(e.target.checked)}
                    className="mb-1"
                  />
                  <Form.Check 
                    type="switch"
                    id="sc-switch"
                    label={<span className="extra-small fw-bold text-muted text-uppercase">SC</span>}
                    checked={enableServiceCharge}
                    onChange={(e) => setEnableServiceCharge(e.target.checked)}
                    className="mb-1"
                  />
                </Col>
              </Row>
            </div>

            <div className="d-flex justify-content-between mb-1 text-muted small">
              <span>Subtotal</span>
              <span>₹{calculateTotal().toFixed(2)}</span>
            </div>
            {discountPercent > 0 && (
              <div className="d-flex justify-content-between mb-1 text-danger small">
                <span>Discount ({discountPercent}%)</span>
                <span>-₹{calculateDiscount().toFixed(2)}</span>
              </div>
            )}
            {enableTax && (
              <div className="d-flex justify-content-between mb-1 text-muted small">
                <span>Tax ({user?.taxRate || outletInfo.settings.taxRate}%)</span>
                <span>₹{calculateTax().toFixed(2)}</span>
              </div>
            )}
            {enableServiceCharge && (
              <div className="d-flex justify-content-between mb-1 text-muted small">
                <span>Service Charge ({user?.serviceChargeRate || outletInfo.settings.serviceCharge || 0}%)</span>
                <span>₹{calculateServiceCharge().toFixed(2)}</span>
              </div>
            )}
            {existingPaidAmount > 0 && (
              <div className="d-flex justify-content-between mb-1 text-muted small">
                <span>Paid so far</span>
                <span>-₹{existingPaidAmount.toFixed(2)}</span>
              </div>
            )}
          
            <div className="d-flex justify-content-between mb-4 pt-2 border-top">
              <h4 className="fw-bold mb-0">{hasExistingPayment ? 'Due' : 'Total'}</h4>
              <h4 className="fw-bold mb-0 text-primary">₹{effectiveTotal.toFixed(2)}</h4>
            </div>
            <div className="d-grid gap-2">
              <Row className="g-2">
                <Col xs={6}>
                  <Button 
                    variant="outline-primary" 
                    className="w-100 py-2 fw-bold"
                    disabled={cart.length === 0}
                    onClick={() => {
                      console.log("orderType",orderType, selectedTable)
                      if (orderType === 'dine-in' && (!selectedTable?.id || selectedTable?.id === 'null')) {
                        toast.error('You need to select a table in order to give dine-in order');
                        return;
                      }
                      setShowCartPopup(true);
                    }}
                  >
                    📄 Bill
                  </Button>
                </Col>
                <Col xs={6}>
                  {['superadmin', 'owner', 'manager', 'cashier', 'receptionist', 'waiter'].includes(user?.role) && (
                    <Button 
                      variant="primary" 
                      className="w-100 py-2 fw-bold shadow-sm"
                      disabled={cart.length === 0}
                      onClick={handleCheckout}
                    >
                      🔥 {currentOrder ? 'Update' : 'Place'}
                    </Button>
                  )}
                </Col>
              </Row>
            </div>
          </div>
        </Col>
      </Row>

      {/* Bill Modal */}
      <Modal show={showBillModal} onHide={() => {
        setShowBillModal(false);
        setShowCartPopup(true);
      }} size="md" centered>
        <Modal.Header className="">
          <Button 
            variant="outline-secondary" 
            size="sm" 
            className="me-2"
            onClick={() => {
              setShowBillModal(false);
              setShowCartPopup(true);
            }}
          >
            ← Back to Cart
          </Button>
          <Modal.Title className="h5">Invoice</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-4">
          <div className="text-center mb-4">
            <h4 className="fw-bold mb-1">{user?.restaurantName}</h4>
            {outletInfo.settings.gstNumber && <p className="text-muted small mb-0">GSTIN: {outletInfo.settings.gstNumber}</p>}
            <p className="text-muted small">
              {orderType === 'dine-in' ? `DINE-IN (${selectedTable?.label || 'N/A'})` : orderType.toUpperCase()} | {new Date().toLocaleString()}
            </p>
          </div>
          
          <Table borderless size="sm" className="mb-4">
            <thead className="border-bottom">
              <tr>
                <th>Item</th>
                <th className="text-center">Qty</th>
                <th className="text-end">Price</th>
                <th className="text-end">Total</th>
              </tr>
            </thead>
            <tbody>
              {cart.map(item => (
                <tr key={item.cartId || item._id}>
                  <td>{item.name}</td>
                  <td className="text-center">{item.quantity}</td>
                  <td className="text-end">₹{item.price}</td>
                  <td className="text-end">₹{(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-top">
              <tr>
                <td colSpan="3" className="text-end pt-3">Subtotal</td>
                <td className="text-end pt-3">₹{calculateTotal().toFixed(2)}</td>
              </tr>
              {discountPercent > 0 && (
                <tr>
                  <td colSpan="3" className="text-end text-danger">Discount ({discountPercent}%)</td>
                  <td className="text-end text-danger">-₹{calculateDiscount().toFixed(2)}</td>
                </tr>
              )}
              {enableTax && (
                <tr>
                  <td colSpan="3" className="text-end">GST ({user?.taxRate || outletInfo.settings.taxRate}%)</td>
                  <td className="text-end">₹{calculateTax().toFixed(2)}</td>
                </tr>
              )}
              {enableServiceCharge && (
                <tr>
                  <td colSpan="3" className="text-end">Service Charge ({user?.serviceChargeRate || outletInfo.settings.serviceCharge || 0}%)</td>
                  <td className="text-end">₹{calculateServiceCharge().toFixed(2)}</td>
                </tr>
              )}
              {existingPaidAmount > 0 && (
                <tr>
                  <td colSpan="3" className="text-end">Paid So Far</td>
                  <td className="text-end">-₹{existingPaidAmount.toFixed(2)}</td>
                </tr>
              )}
             
              <tr className="fw-bold fs-5">
                <td colSpan="3" className="text-end">{hasExistingPayment ? 'Due Amount' : 'Grand Total'}</td>
                <td className="text-end text-primary">₹{effectiveTotal.toFixed(2)}</td>
              </tr>
            </tfoot>
          </Table>

          <div className="d-flex gap-2">
            <Button variant="light" className="flex-grow-1" onClick={handlePrintBill}>Print Bill</Button>
            {['superadmin', 'owner', 'manager', 'cashier', 'receptionist'].includes(user?.role) && (
              <Button 
                variant="primary" 
                className="flex-grow-1"
                onClick={() => {
                  if (currentOrder) {
                    setPaidAmount(effectiveTotal);
                    setShowSettleModal(true);
                  }
                  else {
                    toast.error('Please place order first');
                  }
                }} 
              >
                Settle Bill
              </Button>
            )}
          </div>
        </Modal.Body>
      </Modal>

      {/* Settlement Modal */}
      <Modal show={showSettleModal} onHide={() => setShowSettleModal(false)} centered size="lg">
        <Modal.Body className="p-0 bg-dark rounded overflow-hidden">
          <div className="d-flex flex-column flex-md-row">
            {/* Left Side: The "Physical" Invoice */}
            <div className="p-4 d-flex align-items-center justify-content-center bg-secondary" style={{ minWidth: "400px" }}>
              <div className="invoice-paper bg-white shadow-lg p-4" style={{ 
                width: "320px",
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: "13px",
                color: "#000",
                position: "relative",
                minHeight: "450px"
              }}>
                {/* Header */}
                <div className="text-center mb-3">
                  <h5 className="fw-bold mb-1 text-uppercase">{user?.restaurantName}</h5>
                  <div style={{ fontSize: '11px' }}>{outletInfo.address}</div>
                  {outletInfo.settings.gstNumber && <div style={{ fontSize: '11px' }}>GSTIN: {outletInfo.settings.gstNumber}</div>}
                  <div style={{ fontSize: '11px' }}>PH: {outletInfo.phone}</div>
                  <div className="my-2" style={{ borderTop: '1px dashed #000' }}></div>
                  <div className="fw-bold" style={{ fontSize: '14px' }}>TAX INVOICE</div>
                  <div className="my-2" style={{ borderTop: '1px dashed #000' }}></div>
                </div>

                {/* Bill Info */}
                <div className="mb-3" style={{ fontSize: '11px' }}>
                  <div className="d-flex justify-content-between">
                    <span>BILL NO: #{currentOrder?._id.slice(-6).toUpperCase()}</span>
                    <span className="fw-bold">
                      {orderType === 'dine-in' 
                        ? `DINE-IN (${currentOrder?.tableLabel || selectedTableState?.label || 'N/A'})`
                        : orderType?.toUpperCase() || 'TAKEAWAY'}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>DATE: {new Date().toLocaleDateString('en-GB')}</span>
                    <span>TIME: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                {/* Items Table */}
                <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000' }} className="py-2 mb-3">
                  <div className="d-flex fw-bold mb-1" style={{ fontSize: '11px' }}>
                    <span style={{ width: "35px" }}>QTY</span>
                    <span className="flex-grow-1">ITEM DESCRIPTION</span>
                    <span style={{ width: "65px", textAlign: "right" }}>PRICE</span>
                  </div>
                  {currentOrder?.items.map((item, idx) => (
                    <div key={idx} className="d-flex mb-1" style={{ fontSize: '12px' }}>
                      <span style={{ width: "35px" }}>{item.quantity}</span>
                      <span className="flex-grow-1 text-uppercase">{item.name || item.menuItem?.name}</span>
                      <span style={{ width: "65px", textAlign: "right" }}>{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Calculations */}
                <div className="ms-auto" style={{ width: '180px' }}>
                  <div className="d-flex justify-content-between mb-1">
                    <span>Subtotal:</span>
                    <span>₹{calculateTotal().toFixed(2)}</span>
                  </div>
                   {hasExistingPayment && (
                    <>
                      <div className="d-flex justify-content-between mb-1" style={{ fontSize: '12px' }}>
                        <span>PAID:</span>
                        <span>-₹{existingPaidAmount.toFixed(2)}</span>
                      </div>
                      
                    </>
                  )}

                  {discountPercent > 0 && (
                    <div className="d-flex justify-content-between mb-1 text-danger">
                      <span>Discount ({discountPercent}%):</span>
                      <span>-₹{calculateDiscount().toFixed(2)}</span>
                    </div>
                  )}
                  {enableTax && (
                    <>
                      <div className="d-flex justify-content-between mb-1">
                        <span>CGST ({(user?.taxRate || outletInfo.settings.taxRate) / 2}%):</span>
                        <span>₹{(calculateTax() / 2).toFixed(2)}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-1">
                        <span>SGST ({(user?.taxRate || outletInfo.settings.taxRate) / 2}%):</span>
                        <span>₹{(calculateTax() / 2).toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  {enableServiceCharge && (
                    <div className="d-flex justify-content-between mb-1">
                      <span>Service Charge ({user?.serviceChargeRate || outletInfo.settings.serviceCharge || 0}%):</span>
                      <span>₹{calculateServiceCharge().toFixed(2)}</span>
                    </div>
                  )}
                   {hasExistingPayment && (
                    <>
                     <div className="my-1" style={{ borderTop: '1px solid #000' }}></div>
                   <div className="d-flex justify-content-between" style={{ fontSize: '12px' }}>
                    <span>DUE NOW:</span>
                    <span>₹{computedDueAmount.toFixed(2)}</span>
                  </div>
                  </>
                   )}
                  <div className="my-1" style={{ borderTop: '1px solid #000' }}></div>
                  <div className="d-flex justify-content-between fw-bold" style={{ fontSize: '16px' }}>
                    <span>{ 'TOTAL:'}</span>
                    <span>₹{effectiveTotal.toFixed(2)}</span>
                  </div>
                 
                  <div className="my-1" style={{ borderTop: '1px double #000' }}></div>
                </div>

                {/* Footer */}
                <div className="text-center mt-5" style={{ fontSize: '11px' }}>
                  <div>THANK YOU FOR VISITING!</div>
                  <div className="fw-bold">HAVE A NICE DAY</div>
                  <div className="mt-2" style={{ fontSize: '9px' }}>* Computer Generated Invoice *</div>
                </div>

                {/* Jagged edge effect simulation */}
                <div style={{ 
                  position: 'absolute', 
                  bottom: '-10px', 
                  left: 0, 
                  right: 0, 
                  height: '10px', 
                  background: 'linear-gradient(-45deg, transparent 5px, white 5px), linear-gradient(45deg, transparent 5px, white 5px)',
                  backgroundSize: '10px 10px'
                }}></div>
              </div>
            </div>

            {/* Right Side: Payment Actions */}
            <div className="p-4 flex-grow-1 bg-white d-flex flex-column">
              <div className="mb-4 text-center text-md-start border-bottom">
                <h4 className="fw-bold text-dark mb-1">Settle Payment</h4>
                <p className="text-muted small">Choose payment method and confirm amount</p>
              </div>
              
              <div className="flex-grow-1">
                <label className="small fw-bold text-uppercase text-muted mb-2 d-block">Payment Method</label>
                <div className="row g-2 mb-4">
                  {[
                    { id: 'cash', label: 'Cash', icon: '💸' },
                    { id: 'online', label: 'UPI/Online', icon: '📱' },
                    { id: 'card', label: 'Card', icon: '💳' },
                    { id: 'due', label: 'Due', icon: '⏳' }
                  ].map(mode => (
                    <div className="col-6" key={mode.id}>
                      <button 
                        className={`btn w-100 py-3 d-flex flex-column align-items-center justify-content-center border-2 ${paymentMode === mode.id ? 'btn-primary border-primary' : 'btn-outline-light text-dark border-light'}`}
                        onClick={() => {
                          setPaymentMode(mode.id);
                          if (mode.id === 'due') {
                            setPaidAmount(0);
                          } else if (paidAmount === 0) {
                            setPaidAmount(effectiveTotal);
                          }
                        }}
                        style={{ transition: 'all 0.2s' }}
                      >
                        <span className="fs-3 mb-1">{mode.icon}</span>
                        <span className="fw-bold small">{mode.label}</span>
                      </button>
                    </div>
                  ))}
                </div>

                <label className="small fw-bold text-uppercase text-muted mb-2 d-block">Amount Collected</label>
                <div className="input-group input-group-lg mb-4 shadow-sm">
                  <span className="input-group-text bg-white border-end-0 text-primary fw-bold">₹</span>
                  <input 
                    type="number" 
                    className="form-control border-start-0 ps-0 fw-bold text-primary"
                    value={paidAmount} 
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      // Allow entering more than effectiveTotal for advance payments
                      setPaidAmount(val);
                    }}
                    autoFocus
                  />
                  <button className="btn btn-light border" onClick={() => setPaidAmount(effectiveTotal)}>Full</button>
                </div>

                {paymentMode === 'due' ? (
                  <div className="p-3 rounded-3 bg-warning bg-opacity-10 border border-warning border-opacity-25 mb-4">
                    <div className="d-flex align-items-center text-warning-emphasis fw-bold small mb-1">
                      ⚠️ FULL AMOUNT DUE
                    </div>
                    <div className="small text-muted">
                      ₹{effectiveTotal.toFixed(2)} will be recorded as pending/due.
                    </div>
                  </div>
                ) : effectiveTotal - paidAmount > 0.01 ? (
                  <div className="p-3 rounded-3 bg-warning bg-opacity-10 border border-warning border-opacity-25 mb-4">
                    <div className="d-flex align-items-center text-warning-emphasis fw-bold small mb-1">
                      ⚠️ SHORT PAYMENT
                    </div>
                    <div className="small text-muted">
                      ₹{(effectiveTotal - paidAmount).toFixed(2)} will be recorded as pending/due.
                    </div>
                  </div>
                ) : paidAmount - effectiveTotal > 0.01 ? (
                  <div className="p-3 rounded-3 bg-success bg-opacity-10 border border-success border-opacity-25 mb-4">
                    <div className="d-flex align-items-center text-success-emphasis fw-bold small mb-1">
                      💰 ADVANCE PAYMENT
                    </div>
                    <div className="small text-muted">
                      ₹{(paidAmount - effectiveTotal).toFixed(2)} will be recorded as advance for this customer.
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="d-flex flex-wrap gap-2 mt-4">
               
                {orderType === 'dine-in' && (selectedTableState || currentOrder?.tableId) && (
                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="keepTableOccupiedAfterPay"
                      checked={keepTableOccupiedAfterPay}
                      onChange={(e) => setKeepTableOccupiedAfterPay(e.target.checked)}
                    />
                    <label className="form-check-label ms-1 small" htmlFor="keepTableOccupiedAfterPay">
                      Keep table occupied after payment
                    </label>
                  </div>
                )}

                <div className="d-flex gap-2 flex-grow-1">
                  <button 
                    className="btn btn-outline-primary fw-bold flex-grow-1" 
                    onClick={() => handleSettleOrder(false)}
                  >
                    SETTLE ONLY
                  </button>
                  <button 
                    className="btn btn-primary fw-bold flex-grow-1 shadow-sm px-4" 
                    onClick={() => handleSettleOrder(true)}
                  >
                    SETTLE & PRINT
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* KOT Modal */}
      <Modal show={showKOTModal} onHide={() => setShowKOTModal(false)} centered size="sm">
        <Modal.Body className="p-0">
          <div className="kot-preview p-4 bg-white text-dark shadow-sm mx-auto" style={{ 
            fontFamily: "'Courier New', Courier, monospace",
            width: "100%",
            maxWidth: "350px",
            border: "1px solid #eee"
          }}>
            <div className="text-center border-bottom border-dark border-2 pb-2 mb-3">
              <h4 className="fw-bold mb-0">KOT (NEW)</h4>
              <div className="small">{new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString()}</div>
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="small">TYPE:</span>
                <span className="fw-bold fs-4 text-uppercase">
                  {orderType === 'dine-in' 
                    ? `DINE-IN (${currentOrder?.tableLabel || selectedTableState?.label || 'N/A'})`
                    : orderType === 'takeaway'
                    ? 'TAKEAWAY'
                    : orderType === 'packing'
                    ? 'PACKING'
                    : (currentOrder?.tableLabel || selectedTableState?.label || 'TAKEAWAY')}
                </span>
              </div>
              <div className="d-flex justify-content-between small">
                <span>ORDER:</span>
                <span className="fw-bold">#{currentOrder?._id.slice(-6).toUpperCase()}</span>
              </div>
            </div>

            <div className="border-top border-bottom border-dark py-2 mb-3">
              <div className="d-flex fw-bold small border-bottom border-dark pb-1 mb-2">
                <span style={{ width: "40px" }}>QTY</span>
                <span className="flex-grow-1">ITEM</span>
              </div>
              
              {Object.values(currentOrder?.items.filter(item => item.status === 'queued').reduce((acc, item) => {
                const name = item.name || item.menuItem?.name;
                if (!acc[name]) {
                  acc[name] = { name, quantity: 0, notes: item.notes };
                }
                acc[name].quantity += item.quantity;
                return acc;
              }, {}) || {}).map((item, idx) => (
                <div key={idx} className="mb-2">
                  <div className="d-flex align-items-start">
                    <span className="fw-bold fs-5" style={{ width: "40px" }}>{item.quantity}</span>
                    <span className="fw-bold fs-5 text-uppercase flex-grow-1">{item.name}</span>
                  </div>
                  {item.notes && (
                    <div className="ms-4 small italic text-muted">* {item.notes}</div>
                  )}
                </div>
              ))}

              {currentOrder?.items.filter(item => item.status === 'queued').length === 0 && (
                <div className="text-center py-3 text-muted">--- NO NEW ITEMS ---</div>
              )}
            </div>

            <div className="text-center small mb-4">
              *** END OF TICKET ***
            </div>

            <div className="d-flex gap-2 no-print">
              <Button variant="outline-dark" className="flex-grow-1" onClick={() => setShowKOTModal(false)}>CLOSE</Button>
              <Button variant="dark" className="flex-grow-1 fw-bold" onClick={handlePrint}>PRINT KOT</Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Cart Popup Modal */}
      <CartPopup
        show={showCartPopup}
        onHide={() => setShowCartPopup(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onUpdateNotes={(itemId, notes) => {
          setCart(cart.map(item => 
            (item.cartId === itemId || item._id === itemId) 
              ? { ...item, notes }
              : item
          ));
        }}
        onCheckout={handleCheckout}
        onShowBillModal={() => setShowBillModal(true)}
        calculateTotal={calculateTotal}
        calculateDiscount={calculateDiscount}
        calculateTax={calculateTax}
        calculateServiceCharge={calculateServiceCharge}
        calculateGrandTotal={calculateGrandTotal}
        discountPercent={discountPercent}
        setDiscountPercent={setDiscountPercent}
        enableTax={enableTax}
        setEnableTax={setEnableTax}
        enableServiceCharge={enableServiceCharge}
        setEnableServiceCharge={setEnableServiceCharge}
        outletInfo={outletInfo}
        customerInfo={customerInfo}
      />

      {/* Table Selection Modal */}
      <TableSelectionModal
        show={showTableModal}
        onHide={() => setShowTableModal(false)}
        onSelectTable={setSelectedTableState}
        selectedTable={selectedTableState}
      />
    </Container>
  );
};

export default POS;
