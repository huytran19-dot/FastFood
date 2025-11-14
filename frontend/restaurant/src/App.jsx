import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'

// Pages
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import RestaurantRegisterPage from '@/pages/RestaurantRegisterPage'
import WaitingApprovalPage from '@/pages/WaitingApprovalPage'
import ResubmitPage from '@/pages/ResubmitPage'
import DashboardPage from '@/pages/DashboardPage'
import MenuPage from '@/pages/MenuPage'
import CategoriesPage from '@/pages/CategoriesPage'
import OrdersPage from '@/pages/OrdersPage'
import DroneControlPage from '@/pages/DroneControlPage'
import ProfilePage from '@/pages/ProfilePage'
import RestaurantLayout from '@/components/layout/RestaurantLayout'

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

    // Check if user has pending/rejected restaurant in localStorage
    const pendingRestaurantStr = localStorage.getItem('pendingRestaurant')
    if (pendingRestaurantStr && !restaurant) {
      try {
        const pendingRestaurant = JSON.parse(pendingRestaurantStr)
        const { review_status } = pendingRestaurant
        
        if (review_status === 'PENDING') {
          navigate('/pending', { replace: true })
          return
        }
        
        if (review_status === 'REJECTED') {
          navigate('/rejected', { replace: true })
          return
        }
      } catch (error) {
        console.error('Failed to parse pendingRestaurant:', error)
        localStorage.removeItem('pendingRestaurant')
      }
    }

    // If user has no restaurant at all, redirect to registration
    if (!restaurant && !pendingRestaurantStr) {
      if (location.pathname !== '/restaurant/register') {
        navigate('/restaurant/register', { replace: true })
      }
      return
    }

    // If restaurant is in context, check its status (should always be APPROVED at this point)
    if (restaurant) {
      const { review_status } = restaurant
      
      if (review_status === 'PENDING') {
        navigate('/pending', { replace: true })
        return
      }

      if (review_status === 'REJECTED') {
        navigate('/rejected', { replace: true })
        return
      }
    }

  }, [user, restaurant, loading, location.pathname, navigate])

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

    if (user && restaurant) {
      // Only redirect if user has restaurant in context (means they are authenticated and approved)
      const { review_status } = restaurant
      
      if (review_status === 'APPROVED') {
        navigate('/restaurant/dashboard', { replace: true })
      }
      // Don't redirect for PENDING/REJECTED - they are not in context anyway
    }
  }, [user, restaurant, loading, navigate])

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
        
        {/* Status Pages - NOT protected because user is not authenticated yet */}
        <Route path="/pending" element={<WaitingApprovalPage />} />
        <Route path="/rejected" element={<ResubmitPage />} />
        
        {/* Dashboard Routes (only accessible when APPROVED) - Wrapped with Layout */}
        <Route path="/restaurant/dashboard" element={<ProtectedRoute><RestaurantLayout><DashboardPage /></RestaurantLayout></ProtectedRoute>} />
        <Route path="/restaurant/menu" element={<ProtectedRoute><RestaurantLayout><MenuPage /></RestaurantLayout></ProtectedRoute>} />
        <Route path="/restaurant/categories" element={<ProtectedRoute><RestaurantLayout><CategoriesPage /></RestaurantLayout></ProtectedRoute>} />
        <Route path="/restaurant/orders" element={<ProtectedRoute><RestaurantLayout><OrdersPage /></RestaurantLayout></ProtectedRoute>} />
        <Route path="/restaurant/drones" element={<ProtectedRoute><RestaurantLayout><DroneControlPage /></RestaurantLayout></ProtectedRoute>} />
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
