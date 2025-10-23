import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, Mail, Lock, Phone, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Mật khẩu xác nhận không khớp',
      })
      return
    }

    setIsLoading(true)

    try {
      const { confirmPassword, ...registerData } = formData
      await register(registerData)
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
          <h1 className="text-3xl font-bold text-gray-900">Đăng Ký Chủ Nhà Hàng</h1>
          <p className="mt-2 text-gray-600">
            Tạo tài khoản để quản lý nhà hàng của bạn
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Thông Tin Tài Khoản</CardTitle>
            <CardDescription>
              Nhập thông tin để tạo tài khoản mới
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Họ và tên
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-2"
                />
              </div>

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

              {/* Phone */}
              <div>
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Số điện thoại
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0901234567"
                  value={formData.phone}
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
                  minLength={6}
                  className="mt-2"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Xác nhận mật khẩu
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
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
                {isLoading ? 'Đang đăng ký...' : 'Đăng Ký'}
              </Button>

              {/* Login Link */}
              <p className="text-center text-sm text-muted-foreground">
                Đã có tài khoản?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Đăng nhập ngay
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Sau khi đăng ký, bạn sẽ cần đăng ký thông tin nhà hàng</p>
          <p className="mt-1">FastFood Drone Delivery System</p>
        </div>
      </div>
    </div>
  )
}
