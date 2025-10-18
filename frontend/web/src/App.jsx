import { Routes, Route } from 'react-router-dom'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { BottomNav } from '@/components/bottom-nav'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/contexts/AuthContext'

// Pages
import HomePage from '@/app/page'
import AccountPage from '@/app/account/page'
import AdminPage from '@/app/admin/page'
import AdminRestaurantsPage from '@/app/admin/restaurants/page'
import AdminRestaurantsNewPage from '@/app/admin/restaurants/new/page'
import CartPage from '@/app/cart/page'
import CheckoutPage from '@/app/checkout/page'
import LoginPage from '@/app/login/page'
import RegisterPage from '@/app/register/page'
import OrdersPage from '@/app/orders/page'
import OrderReviewPage from '@/app/orders/[orderId]/review/page'
import OwnerPage from '@/app/owner/page'
import OwnerDronesPage from '@/app/owner/drones/page'
import OwnerMenuPage from '@/app/owner/menu/page'
import OwnerOrdersPage from '@/app/owner/orders/page'
import RestaurantDetailPage from '@/app/restaurant/[id]/page'
import TrackingPage from '@/app/tracking/[orderId]/page'

function App() {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        
        <Header />
        <div className="flex flex-1">
          <main className="flex-1 pb-16 md:pb-0">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/restaurants" element={<AdminRestaurantsPage />} />
              <Route path="/admin/restaurants/new" element={<AdminRestaurantsNewPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/orders/:orderId/review" element={<OrderReviewPage />} />
              <Route path="/owner" element={<OwnerPage />} />
              <Route path="/owner/drones" element={<OwnerDronesPage />} />
              <Route path="/owner/menu" element={<OwnerMenuPage />} />
              <Route path="/owner/orders" element={<OwnerOrdersPage />} />
              <Route path="/restaurant/:id" element={<RestaurantDetailPage />} />
              <Route path="/tracking/:orderId" element={<TrackingPage />} />
            </Routes>
          </main>
        </div>
        <Footer />
        <BottomNav />
        <Toaster />
      </div>
    </AuthProvider>
  )
}

export default App
