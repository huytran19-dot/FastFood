import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'

// Pages
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import RestaurantRegisterPage from '@/pages/RestaurantRegisterPage'
import RestaurantPendingPage from '@/pages/RestaurantPendingPage'
import WaitingApprovalPage from '@/pages/WaitingApprovalPage'
import ResubmitPage from '@/pages/ResubmitPage'
import DashboardPage from '@/pages/DashboardPage'
import MenuPage from '@/pages/MenuPage'
import OrdersPage from '@/pages/OrdersPage'
// import DeliveriesPage from '@/pages/DeliveriesPage' // Temporarily disabled - feature under development
import ProfilePage from '@/pages/ProfilePage'
import RestaurantLayout from '@/components/layout/RestaurantLayout'

// Protected Route Component with Guards
function ProtectedRoute({ children }) {
  const { user, restaurant, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (loading) return

    console.log('[ProtectedRoute] User:', user, 'Restaurant:', restaurant)

    // If not logged in, redirect to login
    if (!user) {
      navigate('/login', { replace: true, state: { from: location } })
      return
    }

    // If user has no restaurant, redirect to registration (only if not already there)
    if (!restaurant) {
      console.log('[ProtectedRoute] No restaurant found')
      if (location.pathname !== '/restaurant/register') {
        console.log('[ProtectedRoute] Redirecting to /restaurant/register')
        navigate('/restaurant/register', { replace: true })
      }
      return
    }

    // Handle routing based on accessStatus from backend
    const { accessStatus, allowedRoutes } = restaurant

    // ACCOUNT_DISABLED - Không cho phép truy cập
    if (accessStatus === 'ACCOUNT_DISABLED') {
      navigate('/login', { replace: true })
      return
    }

    // PENDING_APPROVAL - Chỉ cho phép truy cập trang waiting-approval
    if (accessStatus === 'PENDING_APPROVAL') {
      const allowedPaths = ['/waiting-approval', '/profile']
      if (!allowedPaths.includes(location.pathname)) {
        navigate('/waiting-approval', { replace: true })
      }
      return
    }

    // REJECTED - Chỉ cho phép truy cập trang resubmit
    if (accessStatus === 'REJECTED') {
      const allowedPaths = ['/resubmit', '/profile']
      if (!allowedPaths.includes(location.pathname)) {
        navigate('/resubmit', { replace: true })
      }
      return
    }

    // RESTAURANT_INACTIVE - Vào được dashboard nhưng hiển thị warning
    // FULL_ACCESS - Truy cập bình thường
    // Không cần redirect, cho phép truy cập tất cả routes

  }, [user, restaurant, loading, location.pathname])

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
        // Chỉ redirect nếu chưa ở trang register
        if (location.pathname !== '/restaurant/register') {
          navigate('/restaurant/register', { replace: true })
        }
      } else {
        // Redirect based on accessStatus
        const { accessStatus } = restaurant
        
        if (accessStatus === 'PENDING_APPROVAL') {
          navigate('/waiting-approval', { replace: true })
        } else if (accessStatus === 'REJECTED') {
          navigate('/resubmit', { replace: true })
        } else if (accessStatus === 'FULL_ACCESS' || accessStatus === 'RESTAURANT_INACTIVE') {
          navigate('/restaurant/dashboard', { replace: true })
        }
      }
    }
  }, [user, restaurant, loading, location.pathname])

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
        
        {/* New Status Pages */}
        <Route path="/waiting-approval" element={<ProtectedRoute><WaitingApprovalPage /></ProtectedRoute>} />
        <Route path="/resubmit" element={<ProtectedRoute><ResubmitPage /></ProtectedRoute>} />
        
        {/* Dashboard Routes (only accessible when APPROVED) - Wrapped with Layout */}
        <Route path="/restaurant/dashboard" element={<ProtectedRoute><RestaurantLayout><DashboardPage /></RestaurantLayout></ProtectedRoute>} />
        <Route path="/restaurant/menu" element={<ProtectedRoute><RestaurantLayout><MenuPage /></RestaurantLayout></ProtectedRoute>} />
        <Route path="/restaurant/orders" element={<ProtectedRoute><RestaurantLayout><OrdersPage /></RestaurantLayout></ProtectedRoute>} />
        {/* Deliveries route temporarily disabled - feature under development */}
        {/* <Route path="/restaurant/deliveries" element={<ProtectedRoute><RestaurantLayout><DeliveriesPage /></RestaurantLayout></ProtectedRoute>} /> */}
        <Route path="/restaurant/profile" element={<ProtectedRoute><RestaurantLayout><ProfilePage /></RestaurantLayout></ProtectedRoute>} />

        {/* Default Route */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
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
