import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TaskLabSelection from './pages/TaskLabSelection';
import { useAuthStore } from './store/authStore';

import SharedLab from './pages/SharedLab';
import TeacherDashboard from './pages/TeacherDashboard';

import Register from './pages/Register';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore(state => state.token);
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/task-lab" element={
          <ProtectedRoute>
            <TaskLabSelection />
          </ProtectedRoute>
        } />

        <Route path="/teacher" element={
          <ProtectedRoute>
            <TeacherDashboard />
          </ProtectedRoute>
        } />

        <Route path="/lab/shared/:id" element={
          <ProtectedRoute>
            <SharedLab />
          </ProtectedRoute>
        } />

        <Route path="/lab/task/:id" element={
          <ProtectedRoute>
            <div className="p-8 text-white font-mono">TASK LAB EXPERIMENT - MODULE 2 (Pending)</div>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
