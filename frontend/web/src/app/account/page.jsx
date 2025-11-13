import { useState, useEffect } from "react"
import { User, MapPin, Lock, LogOut, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { userAPI, authAPI } from "@/lib/api"
import { useNavigate } from "react-router-dom"

export default function AccountPage() {
  const { toast } = useToast()
  const navigate = useNavigate()
  
  // Profile state
  const [profile, setProfile] = useState({
    full_name: '',
    phone: '',
    email: ''
  })
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  
  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Load user profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userData = await userAPI.getCurrentUser()
        setProfile({
          full_name: userData.full_name || '',
          phone: userData.phone || '',
          email: userData.email || ''
        })
      } catch (error) {
        console.error('Error loading profile:', error)
      }
    }
    loadProfile()
  }, [])

  const handleSaveProfile = async () => {
    if (!profile.full_name.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập họ tên",
        variant: "destructive"
      })
      return
    }

    if (!profile.phone.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập số điện thoại",
        variant: "destructive"
      })
      return
    }

    setIsLoadingProfile(true)
    try {
      await userAPI.updateProfile({
        full_name: profile.full_name,
        phone: profile.phone
      })
      
      toast({
        title: "Thành công",
        description: "Đã cập nhật thông tin cá nhân",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật thông tin",
        variant: "destructive"
      })
    } finally {
      setIsLoadingProfile(false)
    }
  }

  const handleChangePassword = async () => {
    // Validation
    if (!passwordData.currentPassword) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập mật khẩu hiện tại",
        variant: "destructive"
      })
      return
    }

    if (!passwordData.newPassword) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập mật khẩu mới",
        variant: "destructive"
      })
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu mới phải có ít nhất 6 ký tự",
        variant: "destructive"
      })
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu mới và xác nhận mật khẩu không khớp",
        variant: "destructive"
      })
      return
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu mới không được trùng với mật khẩu hiện tại",
        variant: "destructive"
      })
      return
    }

    setIsChangingPassword(true)
    try {
      await userAPI.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      )
      
      toast({
        title: "Thành công",
        description: "Đã đổi mật khẩu thành công",
      })

      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể đổi mật khẩu",
        variant: "destructive"
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleLogout = async () => {
    try {
      await authAPI.logout()
      toast({
        title: "Đã đăng xuất",
        description: "Hẹn gặp lại bạn!",
      })
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    const parts = name.trim().split(' ')
    if (parts.length === 1) return parts[0][0].toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold text-foreground md:text-3xl">Tài khoản của tôi</h1>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardContent className="flex flex-col items-center p-6">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-2xl text-primary-foreground">
                  {getInitials(profile.full_name)}
                </AvatarFallback>
              </Avatar>
              <h3 className="mt-4 text-xl font-semibold text-foreground">{profile.full_name || 'User'}</h3>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            </CardContent>
          </Card>

          {/* Settings Tabs */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="profile" className="gap-2">
                  <User className="h-4 w-4" />
                  Hồ sơ
                </TabsTrigger>
                <TabsTrigger value="addresses" className="gap-2">
                  <MapPin className="h-4 w-4" />
                  Địa chỉ
                </TabsTrigger>
                <TabsTrigger value="security" className="gap-2">
                  <Lock className="h-4 w-4" />
                  Bảo mật
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Thông tin cá nhân</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Họ và tên</Label>
                        <Input 
                          id="fullName" 
                          value={profile.full_name}
                          onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                          placeholder="Nhập họ tên"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Số điện thoại</Label>
                        <Input 
                          id="phone" 
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          placeholder="Nhập số điện thoại"
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          value={profile.email}
                          disabled
                          className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">Email không thể thay đổi</p>
                      </div>
                    </div>
                    <Button 
                      onClick={handleSaveProfile} 
                      disabled={isLoadingProfile}
                    >
                      {isLoadingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Addresses Tab */}
              <TabsContent value="addresses" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Địa chỉ giao hàng</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg border border-border p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="font-medium text-foreground">Địa chỉ mặc định</h4>
                        <Button variant="ghost" size="sm">Sửa</Button>
                      </div>
                      <p className="text-sm text-muted-foreground">12 Nguyễn Huệ, Quận 1, TP.HCM</p>
                      <p className="text-sm text-muted-foreground">SĐT: 0909 123 456</p>
                    </div>
                    <Button variant="outline" className="w-full bg-transparent">Thêm địa chỉ mới</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Đổi mật khẩu</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                      <div className="relative">
                        <Input 
                          id="currentPassword" 
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          placeholder="Nhập mật khẩu hiện tại"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                        >
                          {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Mật khẩu mới</Label>
                      <div className="relative">
                        <Input 
                          id="newPassword" 
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        >
                          {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmNewPassword">Xác nhận mật khẩu mới</Label>
                      <div className="relative">
                        <Input 
                          id="confirmNewPassword" 
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          placeholder="Nhập lại mật khẩu mới"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        >
                          {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <Button 
                      onClick={handleChangePassword}
                      disabled={isChangingPassword}
                    >
                      {isChangingPassword ? 'Đang đổi...' : 'Đổi mật khẩu'}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-destructive">Vùng nguy hiểm</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="destructive" 
                      className="gap-2"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      Đăng xuất
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
