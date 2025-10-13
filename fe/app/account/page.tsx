"use client"

import { useState } from "react"
import { User, MapPin, Bell, Lock, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function AccountPage() {
  const [notifications, setNotifications] = useState(true)
  const { toast } = useToast()

  const handleSaveProfile = () => {
    toast({
      title: "Đã lưu thay đổi",
      description: "Thông tin tài khoản đã được cập nhật",
    })
  }

  const handleChangePassword = () => {
    toast({
      title: "Đã đổi mật khẩu",
      description: "Mật khẩu của bạn đã được thay đổi thành công",
    })
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
                  NV
                </AvatarFallback>
              </Avatar>
              <h3 className="mt-4 text-xl font-semibold text-foreground">Nguyễn Văn A</h3>
              <p className="text-sm text-muted-foreground">nguyenvana@example.com</p>
              <Button variant="outline" className="mt-4 w-full bg-transparent">
                Đổi ảnh đại diện
              </Button>
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
                <TabsTrigger value="settings" className="gap-2">
                  <Bell className="h-4 w-4" />
                  Cài đặt
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
                      <div>
                        <Label htmlFor="fullName">Họ và tên</Label>
                        <Input id="fullName" defaultValue="Nguyễn Văn A" />
                      </div>
                      <div>
                        <Label htmlFor="phone">Số điện thoại</Label>
                        <Input id="phone" defaultValue="0909 123 456" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue="nguyenvana@example.com" />
                    </div>
                    <Button onClick={handleSaveProfile}>Lưu thay đổi</Button>
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
                        <Button variant="ghost" size="sm">
                          Sửa
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">12 Nguyễn Huệ, Quận 1, TP.HCM</p>
                      <p className="text-sm text-muted-foreground">SĐT: 0909 123 456</p>
                    </div>
                    <Button variant="outline" className="w-full bg-transparent">
                      Thêm địa chỉ mới
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Cài đặt thông báo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">Thông báo đơn hàng</p>
                        <p className="text-sm text-muted-foreground">Nhận thông báo về trạng thái đơn hàng</p>
                      </div>
                      <Switch checked={notifications} onCheckedChange={setNotifications} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">Khuyến mãi</p>
                        <p className="text-sm text-muted-foreground">Nhận thông báo về ưu đãi và khuyến mãi</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">Email marketing</p>
                        <p className="text-sm text-muted-foreground">Nhận email về món ăn mới và sự kiện</p>
                      </div>
                      <Switch />
                    </div>
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
                    <div>
                      <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                      <Input id="currentPassword" type="password" />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">Mật khẩu mới</Label>
                      <Input id="newPassword" type="password" />
                    </div>
                    <div>
                      <Label htmlFor="confirmNewPassword">Xác nhận mật khẩu mới</Label>
                      <Input id="confirmNewPassword" type="password" />
                    </div>
                    <Button onClick={handleChangePassword}>Đổi mật khẩu</Button>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-destructive">Vùng nguy hiểm</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button variant="destructive" className="gap-2">
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
