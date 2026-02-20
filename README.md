# Restaurant Management System

A comprehensive, full-stack restaurant management solution built with React.js and Node.js. This system handles all aspects of restaurant operations including point of sale, inventory management, staff management, floor planning, and financial reporting.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [User Roles](#user-roles)
- [API Endpoints](#api-endpoints)
- [Screenshots](#screenshots)
- [License](#license)

---

## ✨ Features

### 🖥️ Dashboard
- Real-time statistics (today's revenue, active orders, occupied tables)
- Floor management with visual table layout
- Operational intelligence with AI-powered insights
- Recent orders and top menu items tracking
- Quick actions for common tasks
- Low stock alerts

### 🍽️ Menu Management
- Create, edit, and delete menu items
- Categorize items (appetizers, mains, beverages, desserts)
- Price management
- Availability toggle

### 🏢 Floor & Table Management
- Visual floor plan editor (drag & drop)
- Multi-floor support
- Table status tracking (available, occupied, reserved, cleaning, maintenance)
- Real-time table occupancy view
- Add/remove tables dynamically

### 📊 Orders Management
- Multiple order types: Dine-in, Takeaway, Packing
- Order status tracking (pending, preparing, ready, completed, cancelled)
- Order history with filtering
- Real-time order updates

### 💳 Point of Sale (POS)
- User-friendly interface for order creation
- Cart management with item modifications
- Multiple payment methods (cash, online)
- Split billing support
- Order completion and receipt generation
- Table-based ordering

### 📦 Inventory Management
- Track inventory items with quantities
- Low stock alerts with threshold settings
- Category-based organization
- Stock level monitoring

### 👥 Staff Management
- Staff registration and profiles
- Role-based access control (RBAC)
- Role assignment (Management, Kitchen, Front Desk, POS, Finance)
- Staff attendance tracking

### 🍳 Kitchen Display System (KDS)
- Real-time order queue for kitchen staff
- Order status updates
- Color-coded priority indicators
- Timer-based order tracking

### 📈 Forecasting & Analytics
- AI-powered demand forecasting
- Peak hour analysis
- Popular items identification
- Operational insights

### 💰 Financial Management
- Payment tracking (cash, online)
- Due amount management
- Expense tracking
- Profit & Loss reports
- Revenue analytics

### 👤 Customer Management
- Customer database
- Order history per customer
- Customer insights

### ⚙️ Settings
- Outlet configuration
- Tax settings
- Payment method configuration

---

## 🛠 Tech Stack

### Frontend
- **React.js** (v18.2.0) - UI framework
- **React Router DOM** (v6.20.1) - Routing
- **React Bootstrap** (v2.10.10) - UI components
- **Bootstrap** (v5.3.8) - CSS framework
- **Axios** - HTTP client
- **Chart.js / React-Chartjs-2** - Data visualization
- **Recharts** - Charting library
- **React Hot Toast** - Notifications
- **React Draggable** - Drag and drop functionality
- **React Resizable** - Resizable components

### Backend (Node.js/Express)
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing

---

## 📌 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or Atlas)
- Git

---

## 🚀 Installation

### 1. Clone the Repository

```
bash
git clone <repository-url>
cd restaurant-management-system
```

### 2. Install Frontend Dependencies

```
bash
npm install
```

### 3. Configure Backend

Create a `.env` file in the server directory:

```
env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/restaurant
JWT_SECRET=your-secret-key
```

### 4. Install Backend Dependencies

```
bash
cd server
npm install
```

### 5. Run the Application

#### Frontend (Development)
```
bash
npm start
```

#### Backend (Development)
```
bash
cd server
npm run dev
```

The frontend will run on `http://localhost:3000` and the backend on `http://localhost:5000`.

---

## 📂 Project Structure

```
restaurant-management-system/
├── public/
│   └── index.html
├── src/
│   ├── components/           # Reusable components
│   │   ├── CartPopup.js
│   │   ├── Chatbot.js
│   │   ├── ConfirmModal.js
│   │   ├── ExpenseReminders.js
│   │   ├── Layout.js
│   │   ├── PrivateRoute.js
│   │   ├── SeatingPreview.js
│   │   ├── Sidebar.js
│   │   ├── TableActionModal.js
│   │   └── TableSelectionModal.js
│   ├── constants/
│   │   └── roles.js
│   ├── context/
│   │   ├── AuthContext.js
│   │   └── NotificationContext.js
│   ├── hooks/
│   │   └── useExpenseNotifications.js
│   ├── pages/                # Page components
│   │   ├── Dashboard.js
│   │   ├── Menu.js
│   │   ├── Seating.js
│   │   ├── SeatingLayout.js
│   │   ├── Orders.js
│   │   ├── POS.js
│   │   ├── CartBilling.js
│   │   ├── Inventory.js
│   │   ├── Staff.js
│   │   ├── StaffProfile.js
│   │   ├── KDS.js
│   │   ├── Forecasting.js
│   │   ├── Payments.js
│   │   ├── Customers.js
│   │   ├── Expenses.js
│   │   ├── ProfitLoss.js
│   │   ├── Login.js
│   │   ├── Register.js
│   │   └── OutletSettings.js
│   ├── utils/
│   │   └── timeAgo.js
│   ├── App.js
│   ├── App.css
│   ├── config.js
│   ├── index.js
│   └── index.css
├── package.json
├── README.md
└── .gitignore
```

---

## 👥 User Roles

| Role | Description | Access |
|------|-------------|--------|
| **Management** | Full access to all features | All pages |
| **Kitchen** | Kitchen operations | Inventory, KDS, Orders |
| **Front Desk** | Table & seating management | Seating, Orders |
| **POS** | Point of Sale operations | POS, Cart, Orders, Customers |
| **Finance** | Financial tracking | Payments, Reports |

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user

### Menu
- `GET /api/menu` - Get all menu items
- `POST /api/menu` - Create menu item
- `PUT /api/menu/:id` - Update menu item
- `DELETE /api/menu/:id` - Delete menu item

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order
- `PUT /api/orders/:id/status` - Update order status

### Seating
- `GET /api/seating/layout` - Get floor layout
- `POST /api/seating/layout` - Save floor layout
- `GET /api/seating/tables` - Get table statuses
- `PUT /api/seating/tables/:id` - Update table status

### Inventory
- `GET /api/inventory` - Get all inventory items
- `POST /api/inventory` - Add inventory item
- `PUT /api/inventory/:id` - Update inventory item
- `DELETE /api/inventory/:id` - Delete inventory item

### Staff
- `GET /api/staff` - Get all staff
- `POST /api/staff` - Add new staff
- `PUT /api/staff/:id` - Update staff
- `DELETE /api/staff/:id` - Remove staff

### Finance
- `GET /api/finance/dashboard-stats` - Get financial stats
- `GET /api/expenses` - Get expenses
- `POST /api/expenses` - Add expense
- `GET /api/profit-loss` - Get P&L report

### AI Insights
- `GET /api/ai/operational-insights` - Get AI-generated insights

---

## 📸 Screenshots

The Dashboard provides a comprehensive view of:
- Today's revenue and order statistics
- Floor-wise table occupancy
- Recent orders
- Top selling menu items
- AI-powered operational insights
- Quick action buttons for common tasks

---

## 📄 License

This project is licensed under the MIT License.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📞 Support

For support, please contact the development team.
