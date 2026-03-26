import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { PublicLayout } from './components/layout/PublicLayout';
import { AdminLayout } from './components/layout/AdminLayout';

// Public Pages
import Landing from './pages/public/Landing';
import Courses from './pages/public/Courses';
import Enroll from './pages/public/Enroll';
import Success from './pages/public/Success';

// Admin Pages
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Students from './pages/admin/Students';
import StudentProfile from './pages/admin/StudentProfile';
import Enrollments from './pages/admin/Enrollments';
import Batches from './pages/admin/Batches';
import Payments from './pages/admin/Payments';
import Placement from './pages/admin/Placement';
import Reports from './pages/admin/Reports';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" richColors />
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/enroll" element={<Enroll />} />
            <Route path="/enroll/success" element={<Success />} />
          </Route>

          {/* Admin Auth Route */}
          <Route path="/admin/login" element={<Login />} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="students" element={<Students />} />
            <Route path="students/:id" element={<StudentProfile />} />
            <Route path="enrollments" element={<Enrollments />} />
            <Route path="batches" element={<Batches />} />
            <Route path="payments" element={<Payments />} />
            <Route path="placement" element={<Placement />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
