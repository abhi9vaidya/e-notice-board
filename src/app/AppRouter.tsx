import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Login from './routes/Login';
import Dashboard from './routes/Dashboard';
import Display from './routes/Display';
import { useAuthStore } from '@/store/authStore';
import { useLocation } from 'react-router-dom';

export const AppRouter: React.FC = () => {
  const { isAdminDevice, checkSecretKey } = useAuthStore();
  const location = useLocation();

  // Handle secret key in URL
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.has('admin_key')) {
      checkSecretKey(params);
    }
  }, [location.search, checkSecretKey]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          isAdminDevice ? <Login /> : <Navigate to="/display" replace />
        }
      />
      <Route path="/display" element={<Display />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Default Redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/display" replace />} />
    </Routes>
  );
};
