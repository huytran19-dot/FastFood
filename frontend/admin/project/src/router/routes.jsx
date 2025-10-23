import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import { ProtectedRoute } from '../auth/ProtectedRoute';
import { AppShell } from '../components/layout/AppShell';
import { ToastProvider } from '../components/ui/Toast';

import { Login } from '../pages/auth/Login';
import { AdminDashboard } from '../pages/admin/Dashboard';
import { AdminUsers } from '../pages/admin/Users';
import { AdminRestaurants } from '../pages/admin/Restaurants';
import { AdminOrders } from '../pages/admin/Orders';
import { AdminPayments } from '../pages/admin/Payments';
import { AdminDrones } from '../pages/admin/Drones';
import { AdminDeliveries } from '../pages/admin/Deliveries';
import { AdminAnalytics } from '../pages/admin/Analytics';

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

            <Route
              path="/admin/*"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AppShell>
                    <Routes>
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="users" element={<AdminUsers />} />
                      <Route path="restaurants" element={<AdminRestaurants />} />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="payments" element={<AdminPayments />} />
                      <Route path="drones" element={<AdminDrones />} />
                      <Route path="deliveries" element={<AdminDeliveries />} />
                      <Route path="analytics" element={<AdminAnalytics />} />
                    </Routes>
                  </AppShell>
                </ProtectedRoute>
              }
            />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
