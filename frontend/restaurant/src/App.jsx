import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'

// Pages
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import RestaurantRegisterPage from '@/pages/RestaurantRegisterPage'
import RestaurantPendingPage from '@/pages/RestaurantPendingPage'
import DashboardPage from '@/pages/DashboardPage'
import MenuPage from '@/pages/MenuPage'
import OrdersPage from '@/pages/OrdersPage'
import DeliveriesPage from '@/pages/DeliveriesPage'
import ProfilePage from '@/pages/ProfilePage'

// Protected Route Component with Guards
function ProtectedRoute({ children }) {
  const { user, restaurant, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (loading) return

    // If not logged in, redirect to login
    if (!user) {
      navigate('/login', { replace: true, state: { from: location } })
      return
    }

    // If user has no restaurant, redirect to registration
    if (!restaurant) {
      if (location.pathname !== '/restaurant/register') {
        navigate('/restaurant/register', { replace: true })
      }
      return
    }

    // If restaurant is PENDING, redirect to pending page
    if (restaurant.review_status === 'PENDING') {
      if (location.pathname !== '/restaurant/pending') {
        navigate('/restaurant/pending', { replace: true })
      }
      return
    }

    // If restaurant is REJECTED, redirect to pending page with rejection info
    if (restaurant.review_status === 'REJECTED') {
      if (location.pathname !== '/restaurant/pending') {
        navigate('/restaurant/pending', { replace: true })
      }
      return
    }

    // If restaurant is APPROVED, allow access to dashboard routes
  }, [user, restaurant, loading, navigate, location.pathname])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    )
  }

  return children
}

// Public Route Component (only accessible when not logged in)
function PublicRoute({ children }) {
  const { user, restaurant, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return

    if (user) {
      if (!restaurant) {
        navigate('/restaurant/register', { replace: true })
      } else if (restaurant.review_status === 'PENDING' || restaurant.review_status === 'REJECTED') {
        navigate('/restaurant/pending', { replace: true })
      } else if (restaurant.review_status === 'APPROVED') {
        navigate('/restaurant/dashboard', { replace: true })
      }
    }
  }, [user, restaurant?.review_status, loading, navigate])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    )
  }

  return children
}

function AppContent() {
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        {/* Protected Routes */}
        <Route path="/restaurant/register" element={<ProtectedRoute><RestaurantRegisterPage /></ProtectedRoute>} />
        <Route path="/restaurant/pending" element={<ProtectedRoute><RestaurantPendingPage /></ProtectedRoute>} />
        <Route path="/restaurant/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/restaurant/menu" element={<ProtectedRoute><MenuPage /></ProtectedRoute>} />
        <Route path="/restaurant/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
        <Route path="/restaurant/deliveries" element={<ProtectedRoute><DeliveriesPage /></ProtectedRoute>} />
        <Route path="/restaurant/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

        {/* Default Route */}
        <Route path="/" element={<Navigate to="/restaurant/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/restaurant/dashboard" replace />} />
      </Routes>
      <Toaster />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
