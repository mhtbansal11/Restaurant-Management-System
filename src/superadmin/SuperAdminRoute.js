import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSuperAdmin } from './SuperAdminContext';

export default function SuperAdminRoute({ children }) {
  const { admin, loading } = useSuperAdmin();
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: '#f8fafc' }}>Loading...</div>;
  if (!admin) return <Navigate to="/superadmin/login" replace />;
  return children;
}
