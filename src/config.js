const browserOrigin =
  typeof window !== 'undefined' && window.location ? window.location.origin : null;

const defaultApiUrl = browserOrigin ? `${browserOrigin}/api` : 'http://127.0.0.1:5000/api';
const defaultFileUrl = browserOrigin || 'http://localhost:5000';

const API_URL = process.env.REACT_APP_API_URL || defaultApiUrl;
const FILE_URL = process.env.REACT_APP_FILE_URL || defaultFileUrl;


const config = {
  API_URL,
  FILE_URL,
  ENDPOINTS: {
    LOGIN: `${API_URL}/auth/login`,
    REGISTER: `${API_URL}/auth/register`,
    DASHBOARD_STATS: `${API_URL}/orders/stats`,
    MENU: `${API_URL}/menu`,
    ORDERS: `${API_URL}/orders`,
    INVENTORY: `${API_URL}/inventory`,
    STAFF: `${API_URL}/users/staff`,
    TABLES: `${API_URL}/seating/tables`,
    SEATING_LAYOUT: `${API_URL}/seating/layout`,
    OUTLET: `${API_URL}/outlets`,
    PAYMENTS: `${API_URL}/payments`,
    CUSTOMERS: `${API_URL}/customers`,
    EXPENSES: `${API_URL}/expenses`,
    EXPENSE_REMINDERS: `${API_URL}/expense-reminders`,
    AI_CHAT: `${API_URL}/ai/chat`,
    AI_FORECAST: `${API_URL}/ai/forecast`
  }
};

export default config;
