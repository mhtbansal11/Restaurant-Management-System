import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import { Card, Button, Form, InputGroup, Spinner } from 'react-bootstrap';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([
    { role: 'assistant', content: 'Hi! I am your AI restaurant assistant. How can I help you today?' }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickActions = [
    { label: '📊 Today\'s Stats', query: 'Show me today\'s sales statistics' },
    { label: '🥘 Popular Items', query: 'What are the most popular items today?' },
    { label: '👥 Staff Status', query: 'Who is currently on shift?' },
    { label: '🆘 Help', query: 'How do I use this dashboard?' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  const handleSend = async (e, directMessage) => {
    e?.preventDefault();
    const messageToSend = directMessage || message;
    if (!messageToSend.trim()) return;

    const userMessage = { role: 'user', content: messageToSend };
    setChat(prev => [...prev, userMessage]);
    setMessage('');
    setLoading(true);

    try {
      const history = chat.slice(-4).map(m => ({ role: m.role, content: m.content }));
      const response = await axios.post(`${config.API_URL}/ai/chat`, { message: messageToSend, history });
      
      setChat(prev => [...prev, { role: 'assistant', content: response.data.reply }]);
    } catch (error) {
      setChat(prev => [...prev, { role: 'assistant', content: 'Sorry, I am having trouble connecting right now.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`chatbot-wrapper-bs ${isOpen ? 'open' : ''}`}>
      {isOpen && (
        <Card className="chatbot-window-bs border-0 shadow-lg overflow-hidden">
          <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center py-3 border-0">
            <div className="d-flex align-items-center">
              <div className="status-indicator-bs me-2 bg-success rounded-circle" style={{ width: '8px', height: '8px' }}></div>
              <h3 className="h6 mb-0 fw-bold">AI Assistant</h3>
            </div>
            <Button 
              variant="link" 
              className="text-white p-0 text-decoration-none fs-4 lh-1" 
              onClick={() => setIsOpen(false)}
            >
              &times;
            </Button>
          </Card.Header>

          <Card.Body className="chatbot-messages-bs p-3 overflow-auto bg-light">
            {chat.map((msg, i) => (
              <div key={i} className={`d-flex mb-3 ${msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="bot-avatar-bs me-2 fs-5">🤖</div>
                )}
                <div className={`message-bubble-bs p-2 px-3 rounded-3 shadow-sm ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-white text-dark'}`} style={{ maxWidth: '85%', fontSize: '0.9rem' }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="d-flex mb-3 justify-content-start">
                <div className="bot-avatar-bs me-2 fs-5">🤖</div>
                <div className="message-bubble-bs p-2 px-3 rounded-3 shadow-sm bg-white text-dark">
                  <Spinner animation="grow" size="sm" variant="primary" className="me-1" />
                  <Spinner animation="grow" size="sm" variant="primary" className="me-1" />
                  <Spinner animation="grow" size="sm" variant="primary" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </Card.Body>

          <div className="quick-actions-container-bs p-2 border-top bg-white d-flex flex-wrap gap-2">
            {quickActions.map((action, idx) => (
              <Button 
                key={idx} 
                variant="outline-primary" 
                size="sm" 
                className="rounded-pill py-1 px-3 small"
                onClick={() => handleSend(null, action.query)}
                style={{ fontSize: '0.75rem' }}
              >
                {action.label}
              </Button>
            ))}
          </div>

          <Card.Footer className="bg-white border-top p-3">
            <Form onSubmit={handleSend}>
              <InputGroup>
                <Form.Control 
                  type="text" 
                  placeholder="Ask me anything..." 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={loading}
                  className="bg-light border-0 shadow-none py-2 px-3"
                />
                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={loading || !message.trim()}
                  className="px-3"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </Button>
              </InputGroup>
            </Form>
          </Card.Footer>
        </Card>
      )}

      <Button 
        variant="primary"
        className={`chatbot-toggle-bs rounded-circle shadow-lg d-flex align-items-center justify-content-center ${isOpen ? 'active' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
        style={{ width: '60px', height: '60px', position: 'fixed', bottom: '30px', right: '30px', zIndex: '1060' }}
      >
        <span className="fs-3">{isOpen ? '✕' : '🤖'}</span>
      </Button>
    </div>
  );
};

export default Chatbot;
