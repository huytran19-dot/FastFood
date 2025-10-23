import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login(formData)
      // Navigation is handled by guards in App.jsx
    } catch (error) {
      // Error toast is shown by AuthContext
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl mb-4">
            <Store className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Quản Lý Nhà Hàng</h1>
          <p className="mt-2 text-gray-600">
            Đăng nhập để quản lý nhà hàng của bạn
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Đăng Nhập</CardTitle>
            <CardDescription>
              Nhập thông tin tài khoản chủ nhà hàng
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="owner@restaurant.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-2"
                />
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Mật khẩu
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="mt-2"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
              </Button>

              {/* Register Link */}
              <p className="text-center text-sm text-muted-foreground">
                Chưa có tài khoản?{' '}
                <Link to="/register" className="text-primary hover:underline font-medium">
                  Đăng ký ngay
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Dành cho chủ nhà hàng</p>
          <p className="mt-1">FastFood Drone Delivery System</p>
        </div>
      </div>
    </div>
  )
}
