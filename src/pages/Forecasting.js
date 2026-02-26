import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import { Container, Row, Col, Card, Form, Spinner, Alert, Table, Badge } from 'react-bootstrap';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import './Forecasting.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Forecasting = () => {
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchForecast();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const fetchForecast = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${config.API_URL}/ai/forecast?days=${days}`);
      setForecastData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching forecast:', err);
      setError('Failed to load sales forecast. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: forecastData?.forecast.map(f => new Date(f.date).toLocaleDateString('en-GB')) || [],
    datasets: [
      {
        fill: true,
        label: 'Predicted Revenue (₹)',
        data: forecastData?.forecast.map(f => f.predictedTotal) || [],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        pointBackgroundColor: '#6366f1',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#6366f1',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
        }
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString();
          }
        }
      },
      x: {
        grid: {
          display: false,
        }
      }
    }
  };

  if (loading && !forecastData) {
    return (
      <Container className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner animation="border" variant="primary" />
        <span className="mt-3 text-muted">Analyzing historical data and generating predictions...</span>
      </Container>
    );
  }

  return (
    <div className="forecasting-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1 fw-bold">AI Sales Forecasting</h2>
          <p className="text-muted mb-0">Predictive insights powered by historical data</p>
        </div>
        <div className="d-flex align-items-center gap-3 bg-white p-2 rounded-3 shadow-sm border">
          <Form.Label className="mb-0 text-nowrap small fw-bold text-muted px-2">Forecast Period:</Form.Label>
          <Form.Select 
            value={days} 
            onChange={(e) => setDays(Number(e.target.value))}
            className="border-0 shadow-none bg-light"
            style={{ width: '160px', cursor: 'pointer' }}
          >
            <option value={3}>Next 3 Days</option>
            <option value={7}>Next 7 Days</option>
            <option value={14}>Next 14 Days</option>
            <option value={30}>Next 30 Days</option>
          </Form.Select>
        </div>
      </div>

      {error && <Alert variant="danger" className="shadow-sm border-0">{error}</Alert>}

      {forecastData && (
        <>
          <Row className="g-4 mb-4">
            <Col xs={12} md={4}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="p-4">
                  <h6 className="text-muted mb-3 text-uppercase small fw-bold letter-spacing-1">Prediction Method</h6>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <h4 className="mb-0 fw-bold">{forecastData.method === 'ai' ? 'AI-Powered' : 'Statistical'}</h4>
                    <Badge bg={forecastData.method === 'ai' ? 'info' : 'secondary'} className="rounded-pill">
                      {forecastData.method === 'ai' ? '🤖' : '📊'}
                    </Badge>
                  </div>
                  <p className="text-muted small mb-0">
                    {forecastData.method === 'ai' ? 'Using advanced trend analysis' : 'Using 7-day moving average fallback'}
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} md={4}>
              <Card className="border-0 shadow-sm h-100 border-start border-primary border-4">
                <Card.Body className="p-4">
                  <h6 className="text-muted mb-3 text-uppercase small fw-bold letter-spacing-1">Total Predicted Revenue</h6>
                  <h3 className="mb-2 fw-bold text-primary">
                    ₹{forecastData.forecast.reduce((sum, f) => sum + f.predictedTotal, 0).toLocaleString()}
                  </h3>
                  <p className="text-muted small mb-0">For the next {days} days period</p>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} md={4}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="p-4">
                  <h6 className="text-muted mb-3 text-uppercase small fw-bold letter-spacing-1">Average Daily Revenue</h6>
                  <h3 className="mb-2 fw-bold text-success">
                    ₹{Math.round(forecastData.forecast.reduce((sum, f) => sum + f.predictedTotal, 0) / days).toLocaleString()}
                  </h3>
                  <p className="text-muted small mb-0">Projected daily average</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0 pt-4 px-4">
              <h5 className="mb-0 fw-bold">Revenue Trend Projection</h5>
            </Card.Header>
            <Card.Body className="p-4">
              <div style={{ height: '400px' }}>
                <Line data={chartData} options={chartOptions} />
              </div>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm overflow-hidden">
            <Card.Header className="bg-white border-0 pt-4 px-4">
              <h5 className="mb-0 fw-bold">Detailed Daily Projections</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="px-4 py-3 border-0">Date</th>
                    <th className="py-3 border-0">Day</th>
                    <th className="px-4 py-3 border-0 text-end">Predicted Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {forecastData.forecast.map((f, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 border-bottom-0">{new Date(f.date).toLocaleDateString('en-GB')}</td>
                      <td className="py-3 border-bottom-0">
                        <Badge bg="light" text="dark" className="border">
                          {new Date(f.date).toLocaleDateString('en-US', { weekday: 'long' })}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 border-bottom-0 text-end fw-bold text-primary">
                        ₹{f.predictedTotal.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
};

export default Forecasting;
