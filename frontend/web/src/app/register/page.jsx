import { useState } from "react"
import { Plane } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [role, setRole] = useState("user")
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const navigate = useNavigate()
  const { register } = useAuth()

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      // This would show an error toast via useAuth
      return
    }
    
    setIsLoading(true)

    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role
      })
      navigate("/")
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
            <CardTitle>Register</CardTitle>
            <CardDescription>Create a new account to start ordering</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  placeholder="John Doe" 
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
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  placeholder="+1234567890" 
                  value={formData.phone}
                  onChange={handleChange}
                  required 
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
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
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  placeholder="••••••••" 
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required 
                />
              </div>

              {/* Role Selection */}
              <div>
                <Label>Account Type</Label>
                <RadioGroup value={role} onValueChange={setRole} className="mt-2">
                  <div className="flex items-center space-x-2 rounded-lg border border-border p-3">
                    <RadioGroupItem value="user" id="user" />
                    <Label htmlFor="user" className="flex-1 cursor-pointer">
                      <div className="font-medium">Customer</div>
                      <div className="text-sm text-muted-foreground">Order food and track deliveries</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-lg border border-border p-3">
                    <RadioGroupItem value="restaurant_owner" id="restaurant_owner" />
                    <Label htmlFor="restaurant_owner" className="flex-1 cursor-pointer">
                      <div className="font-medium">Restaurant Owner</div>
                      <div className="text-sm text-muted-foreground">Manage restaurant and orders</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Register"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
