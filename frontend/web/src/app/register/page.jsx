import { useState } from "react"
import { Plane } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const navigate = useNavigate()
  const { register } = useAuth()
  const { toast } = useToast()

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
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'user'
      })
      
      // Chuyển đến trang thông báo verify email
      navigate("/verify-email", { 
        state: { email: formData.email } 
      })
    } catch (error) {
      console.error('Registration error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary">
              <Plane className="h-7 w-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">FastFood Drone</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Đăng Ký</CardTitle>
            <CardDescription>Tạo tài khoản mới để bắt đầu đặt món</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Họ và tên</Label>
                <Input 
                  id="name" 
                  placeholder="Nguyễn Văn A" 
                  value={formData.name}
                  onChange={handleChange}
                  required 
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="example@email.com" 
                  value={formData.email}
                  onChange={handleChange}
                  required 
                />
              </div>

              <div>
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  placeholder="0901234567" 
                  value={formData.phone}
                  onChange={handleChange}
                  required 
                />
              </div>

              <div>
                <Label htmlFor="password">Mật khẩu</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={formData.password}
                  onChange={handleChange}
                  required 
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  placeholder="••••••••" 
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required 
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? "Đang tạo tài khoản..." : "Đăng ký"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Đã có tài khoản?{" "}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Đăng nhập
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
