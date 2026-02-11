import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import StakeholderList from './pages/Stakeholders/StakeholderList';
import StakeholderProfile from './pages/Stakeholders/StakeholderProfile';
import InteractionList from './pages/Interactions/InteractionList';
import InteractionDetail from './pages/Interactions/InteractionDetail';
import DocumentList from './pages/Documents/DocumentList';
import Profile from './pages/Profile/Profile';
import Dashboard from './pages/Dashboard/Dashboard';
import MainLayout from './components/layouts/MainLayout';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/stakeholders" element={
            <PrivateRoute>
              <StakeholderList />
            </PrivateRoute>
          } />
          <Route path="/stakeholders/:id" element={
            <PrivateRoute>
              <StakeholderProfile />
            </PrivateRoute>
          } />
          <Route path="/interactions" element={
            <PrivateRoute>
              <InteractionList />
            </PrivateRoute>
          } />
          <Route path="/interactions/:id" element={
            <PrivateRoute>
              <InteractionDetail />
            </PrivateRoute>
          } />
          <Route path="/documents" element={
            <PrivateRoute>
              <DocumentList />
            </PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
