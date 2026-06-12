import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../modules/auth/AuthContext';
import Login from '../modules/auth/Login';
import Register from '../modules/auth/Register';
import Resume from '../modules/resume/Resume';
import AccountsPage from '../modules/accounts/AccountsPage';
import CardsPage from '../modules/cards/CardsPage';
import TransactionsPage from '../modules/transactions/TransactionsPage';
import CategoriesPage from '../modules/categories/CategoriesPage';
import Layout from '../components/Layout';
import MaintenancePage from '../components/MaintenancePage';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      
      {/* Protected Layout Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Resume />} />
        <Route path="contas" element={<AccountsPage />} />
        <Route path="transacoes" element={<TransactionsPage />} />
        <Route path="cartoes" element={<CardsPage />} />
        <Route path="investimentos" element={<MaintenancePage />} />
        <Route path="relatorios" element={<MaintenancePage />} />
        <Route path="categorias" element={<CategoriesPage />} />
        <Route path="orcamentos" element={<MaintenancePage />} />
        <Route path="objetivos" element={<MaintenancePage />} />
        <Route path="mia" element={<MaintenancePage />} />
        <Route path="ferramentas" element={<MaintenancePage />} />
        <Route path="configuracoes" element={<MaintenancePage />} />
        <Route path="planos" element={<MaintenancePage />} />
        <Route path="ajuda" element={<MaintenancePage />} />
        <Route path="sobre" element={<MaintenancePage />} />
        <Route path="graficos" element={<MaintenancePage />} />
        <Route path="tags" element={<MaintenancePage />} />
        <Route path="calendario" element={<MaintenancePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
