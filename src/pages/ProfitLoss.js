import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Alert } from 'react-bootstrap';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import config from '../config';
import './ProfitLoss.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ProfitLoss = () => {
  const [pnlData, setPnlData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [chartType, setChartType] = useState('line');
  const [expenseBreakdown, setExpenseBreakdown] = useState([]);

  const fetchPnlData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Validate period parameter
      const validPeriods = ['today', 'week', 'month', 'quarter', 'year'];
      const safePeriod = validPeriods.includes(period) ? period : 'month';
      
      const response = await axios.get(`${config.ENDPOINTS.EXPENSES}/stats/profit-loss?period=${safePeriod}`);
      
      // Validate and sanitize API response
      const sanitizedData = {
        totalRevenue: Number(response.data?.totalRevenue) || 0,
        totalDueAmount: Number(response.data?.totalDueAmount) || 0,  // Added due amount
        totalExpenses: Number(response.data?.totalExpenses) || 0,
        netProfit: Number(response.data?.netProfit) || 0,
        profitMargin: Number(response.data?.profitMargin) || 0,
        orderCount: Number(response.data?.orderCount) || 0,
        expenseCount: Number(response.data?.expenseCount) || 0
      };
      
      // Calculate profit margin if not provided or invalid
      if (sanitizedData.totalRevenue > 0 && !response.data?.profitMargin) {
        sanitizedData.profitMargin = (sanitizedData.netProfit / sanitizedData.totalRevenue) * 100;
      }
      
      setPnlData(sanitizedData);
      
      // Fetch expense breakdown with error handling
      try {
        const expenseResponse = await axios.get(`${config.ENDPOINTS.EXPENSES}/stats/summary?period=${safePeriod}`);
        
        // Validate and sanitize expense breakdown
        const expensesByCategory = Array.isArray(expenseResponse.data?.expensesByCategory) 
          ? expenseResponse.data.expensesByCategory
          : [];
        
        const sanitizedExpenses = expensesByCategory.map(item => ({
          _id: item._id || 'unknown',
          total: Number(item.total) || 0,
          count: Number(item.count) || 0
        })).filter(item => item.total > 0); // Only show categories with actual expenses
        
        setExpenseBreakdown(sanitizedExpenses);
      } catch (expenseError) {
        console.warn('Error fetching expense breakdown:', expenseError);
        setExpenseBreakdown([]);
        toast.error('Could not load expense details');
      }
      
    } catch (error) {
      console.error('Error fetching P&L data:', error);
      
      // Provide specific error messages based on error type
      if (error.response?.status === 404) {
        toast.error('Profit & Loss data not available');
      } else if (error.response?.status >= 500) {
        toast.error('Server error - please try again later');
      } else if (error.code === 'NETWORK_ERROR') {
        toast.error('Network connection failed');
      } else {
        toast.error('Failed to fetch financial data');
      }
      
      // Set default data structure to prevent UI crashes
      setPnlData({
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        profitMargin: 0,
        orderCount: 0,
        expenseCount: 0
      });
      setExpenseBreakdown([]);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchPnlData();
  }, [period, fetchPnlData]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  const getProfitColor = (profit) => {
    return profit >= 0 ? 'success' : 'danger';
  };

  const getProfitIcon = (profit) => {
    return profit >= 0 ? '📈' : '📉';
  };

  const chartData = {
    labels: ['Revenue', 'Expenses', 'Profit'],
    datasets: [
      {
        label: 'Amount (₹)',
        data: pnlData ? [
          Math.max(0, pnlData.totalRevenue || 0),
          Math.max(0, pnlData.totalExpenses || 0),
          pnlData.netProfit || 0
        ] : [0, 0, 0],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          pnlData?.netProfit >= 0 ? 'rgba(75, 192, 192, 0.6)' : 'rgba(255, 99, 132, 0.6)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          pnlData?.netProfit >= 0 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 2
      }
    ]
  };

  const expenseChartData = {
    labels: expenseBreakdown.length > 0 ? expenseBreakdown.map(item => {
      const categories = {
        salary: '💼 Salary',
        inventory: '📦 Inventory',
        rent: '🏠 Rent',
        utilities: '⚡ Utilities',
        maintenance: '🔧 Maintenance',
        marketing: '📢 Marketing',
        other: '📋 Other',
        unknown: '❓ Unknown'
      };
      return categories[item._id] || item._id;
    }) : ['No Expenses'],
    datasets: [
      {
        label: 'Expense Amount (₹)',
        data: expenseBreakdown.length > 0 ? expenseBreakdown.map(item => Math.max(0, item.total || 0)) : [1],
        backgroundColor: expenseBreakdown.length > 0 ? [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(199, 199, 199, 0.6)',
          'rgba(130, 130, 130, 0.6)'
        ].slice(0, expenseBreakdown.length) : ['rgba(240, 240, 240, 0.6)'],
        borderColor: expenseBreakdown.length > 0 ? [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)',
          'rgba(130, 130, 130, 1)'
        ].slice(0, expenseBreakdown.length) : ['rgba(220, 220, 220, 1)'],
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Profit & Loss Overview'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString();
          }
        }
      }
    }
  };

  const expenseChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Expense Breakdown by Category'
      }
    }
  };

  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="">
      {/* Header */}
      <Row className="mb-">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1 fw-bold">💰 Profit & Loss Dashboard</h2>
              <p className="text-muted mb-0">Track your restaurant's financial performance</p>
            </div>
            <div className="d-flex gap-2">
              <Form.Select 
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </Form.Select>
              <Form.Select 
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="line">Line Chart</option>
                <option value="bar">Bar Chart</option>
              </Form.Select>
              <Button 
                variant="outline-primary" 
                onClick={fetchPnlData}
                className="fw-bold"
              >
                🔄 Refresh
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Key Metrics */}
      <Row className="mb-2">
        <Col xl={3} lg={6} md={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="bg-success bg-opacity-10 p-3 rounded-3 text-success d-inline-block mb-3">
                <span className="h4 mb-0">💰</span>
              </div>
              <h6 className="text-muted mb-1">Total Revenue</h6>
              <h4 className="mb-0 fw-bold text-success">
                {formatCurrency(pnlData?.totalRevenue || 0)}
              </h4>
              <small className="text-muted">{pnlData?.orderCount || 0} orders</small>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} lg={6} md={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="bg-warning bg-opacity-10 p-3 rounded-3 text-warning d-inline-block mb-3">
                <span className="h4 mb-0">⏰</span>
              </div>
              <h6 className="text-muted mb-1">Outstanding Dues</h6>
              <h4 className="mb-0 fw-bold text-warning">
                {formatCurrency(pnlData?.totalDueAmount || 0)}
              </h4>
              <small className="text-muted">Pending collection</small>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} lg={6} md={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="bg-danger bg-opacity-10 p-3 rounded-3 text-danger d-inline-block mb-3">
                <span className="h4 mb-0">💸</span>
              </div>
              <h6 className="text-muted mb-1">Total Expenses</h6>
              <h4 className="mb-0 fw-bold text-danger">
                {formatCurrency(pnlData?.totalExpenses || 0)}
              </h4>
              <small className="text-muted">{pnlData?.expenseCount || 0} expenses</small>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} lg={6} md={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className={`bg-${getProfitColor(pnlData?.netProfit || 0)}-opacity-10 p-3 rounded-3 text-${getProfitColor(pnlData?.netProfit || 0)} d-inline-block mb-3`}>
                <span className="h4 mb-0">{getProfitIcon(pnlData?.netProfit || 0)}</span>
              </div>
              <h6 className="text-muted mb-1">Net Profit</h6>
              <h4 className={`mb-0 fw-bold text-${getProfitColor(pnlData?.netProfit || 0)}`}>
                {formatCurrency(pnlData?.netProfit || 0)}
              </h4>
              <small className="text-muted">
                Margin: {formatPercentage(pnlData?.profitMargin || 0)}
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

       {/* Insights */}
      {pnlData && (
        <Row className='mb-2'>
          <Col>
            <Alert variant={getProfitColor(pnlData.netProfit)}>
              <div className="d-flex align-items-center">
                <span className="h4 me-3">{getProfitIcon(pnlData.netProfit)}</span>
                <div>
                  <h6 className="mb-1">
                    {pnlData.netProfit >= 0 ? 'Positive Performance' : 'Attention Needed'}
                  </h6>
                  <p className="mb-0 small">
                    {pnlData.netProfit >= 0 ? (
                      `Your restaurant is profitable with a ${formatPercentage(pnlData.profitMargin)} margin. `
                      + `Keep up the good work!`
                    ) : (
                      `Your restaurant is operating at a loss. Consider reviewing expenses `
                      + `and optimizing operations to improve profitability.`
                    )}
                  </p>
                </div>
              </div>
            </Alert>
          </Col>
        </Row>
      )}
      

      {/* Charts Row */}
      <Row className="mb-2">
        <Col lg={6} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <h6 className="text-muted mb-3">Profit & Loss Overview</h6>
              <div style={{ height: '300px' }}>
                {chartType === 'bar' ? (
                  <Bar data={chartData} options={chartOptions} />
                ) : (
                  <Line data={chartData} options={chartOptions} />
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <h6 className="text-muted mb-3">Expense Breakdown</h6>
              <div style={{ height: '300px' }}>
                <Bar data={expenseChartData} options={expenseChartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>


      {/* Detailed Breakdown */}
      <Row>
        <Col lg={8} className="mb-4">
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h6 className="text-muted mb-3">Financial Summary</h6>
              <Table hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Metric</th>
                    <th className="text-end">Amount</th>
                    <th className="text-end">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="fw-medium text-success">Total Revenue</td>
                    <td className="text-end fw-bold text-success">
                      {formatCurrency(pnlData?.totalRevenue || 0)}
                    </td>
                    <td className="text-end text-muted">100%</td>
                  </tr>
                  <tr>
                    <td className="fw-medium text-danger">Total Expenses</td>
                    <td className="text-end fw-bold text-danger">
                      {formatCurrency(pnlData?.totalExpenses || 0)}
                    </td>
                    <td className="text-end text-muted">
                      {formatPercentage(pnlData?.totalRevenue > 0 ? 
                        Math.min(100, Math.max(0, (pnlData.totalExpenses / pnlData.totalRevenue) * 100)) : 0
                      )}
                    </td>
                  </tr>
                  <tr className="table-active">
                    <td className="fw-medium">Net Profit</td>
                    <td className={`text-end fw-bold text-${getProfitColor(pnlData?.netProfit || 0)}`}>
                      {formatCurrency(pnlData?.netProfit || 0)}
                    </td>
                    <td className={`text-end text-${getProfitColor(pnlData?.netProfit || 0)}`}>
                      {formatPercentage(pnlData?.profitMargin || 0)}
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4} className="mb-4">
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h6 className="text-muted mb-3">Expense Categories</h6>
              <div className="d-flex flex-column gap-2">
                {expenseBreakdown.map((item, index) => (
                  <div key={index} className="d-flex justify-content-between align-items-center">
                    <span className="text-muted small">
                      {{
                        salary: '💼 Salary',
                        inventory: '📦 Inventory',
                        rent: '🏠 Rent',
                        utilities: '⚡ Utilities',
                        maintenance: '🔧 Maintenance',
                        marketing: '📢 Marketing',
                        other: '📋 Other'
                      }[item._id] || item._id}
                    </span>
                    <span className="fw-medium text-danger">
                      {formatCurrency(item.total)}
                    </span>
                  </div>
                ))}
                {expenseBreakdown.length === 0 && (
                  <span className="text-muted small">No expenses recorded</span>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

     
      {/* CSS for custom scrollbar in the table container */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </Container>
  );
};

export default ProfitLoss;