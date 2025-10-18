import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../auth/AuthContext';
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
import { RestaurantDashboard } from '../pages/restaurant/Dashboard';
import { RestaurantMenu } from '../pages/restaurant/Menu';
import { RestaurantOrders } from '../pages/restaurant/Orders';
import { RestaurantDrones } from '../pages/restaurant/Drones';
import { RestaurantDeliveries } from '../pages/restaurant/Deliveries';
import { RestaurantProfile } from '../pages/restaurant/Profile';

function RootRedirect() {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (role === 'restaurant_owner') {
    return <Navigate to="/restaurant/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<RootRedirect />} />

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

            <Route
              path="/restaurant/*"
              element={
                <ProtectedRoute roles={['restaurant_owner']}>
                  <AppShell>
                    <Routes>
                      <Route path="dashboard" element={<RestaurantDashboard />} />
                      <Route path="menu" element={<RestaurantMenu />} />
                      <Route path="orders" element={<RestaurantOrders />} />
                      <Route path="drones" element={<RestaurantDrones />} />
                      <Route path="deliveries" element={<RestaurantDeliveries />} />
                      <Route path="profile" element={<RestaurantProfile />} />
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
