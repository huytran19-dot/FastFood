import { useState, useEffect } from "react"
import { Store, Clock, MapPin, Phone, Image as ImageIcon, FileText, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { restaurantAPI } from "@/lib/api"
import LocationPickerWithAddress from "@/components/map/LocationPickerWithAddress"
import RestaurantMap from "@/components/map/RestaurantMap"

export default function ProfilePage() {
  const { restaurant, refreshRestaurant } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    phone: '',
    description: '',
    image_url: '',
    open_time: '07:00',
    close_time: '22:00',
    lat: null,
    lng: null
  })

  useEffect(() => {
    if (restaurant) {
      // Parse operating_hours back to open_time and close_time
      const hours = restaurant.operating_hours || '07:00-22:00'
      const [open_time, close_time] = hours.split('-').map(t => t.trim())

      setFormData({
        name: restaurant.name || '',
        address: restaurant.address || '',
        city: restaurant.city || '',
        phone: restaurant.phone || '',
        description: restaurant.description || '',
        image_url: restaurant.image_url || '',
        open_time: open_time || '07:00',
        close_time: close_time || '22:00',
        lat: restaurant.lat || null,
        lng: restaurant.lng || null
      })
    }
  }, [restaurant])

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }))
  }

  const handleLocationChange = (address, lat, lng) => {
    setFormData(prev => ({
      ...prev,
      address: address,
      lat: lat,
      lng: lng
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const submitData = {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        phone: formData.phone,
        description: formData.description,
        image_url: formData.image_url,
        operating_hours: `${formData.open_time}-${formData.close_time}`,
        lat: formData.lat,
        lng: formData.lng
      }

      await restaurantAPI.update(submitData)
      await refreshRestaurant()
      
      toast({
        title: "Cập nhật thành công!",
        description: "Thông tin nhà hàng đã được cập nhật.",
      })

      setIsEditing(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Cập nhật thất bại",
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!restaurant) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải thông tin nhà hàng...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hồ Sơ Nhà Hàng</h1>
          <p className="mt-2 text-muted-foreground">
            Quản lý thông tin và cài đặt nhà hàng của bạn
          </p>
        </div>
        <Button 
          variant={isEditing ? "outline" : "default"}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "Hủy" : "Chỉnh sửa"}
        </Button>
      </div>

      {/* Restaurant Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Trạng thái nhà hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              restaurant.review_status === 'APPROVED' 
                ? 'bg-green-100 text-green-800' 
                : restaurant.review_status === 'PENDING'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {restaurant.review_status === 'APPROVED' ? '✅ Đã duyệt' : 
               restaurant.review_status === 'PENDING' ? '⏳ Chờ duyệt' : '❌ Từ chối'}
            </div>
            <span className="text-sm text-muted-foreground">
              {restaurant.review_status === 'APPROVED' 
                ? 'Nhà hàng đang hoạt động bình thường'
                : restaurant.review_status === 'PENDING'
                ? 'Đang chờ quản trị viên duyệt'
                : 'Nhà hàng bị từ chối. Vui lòng liên hệ admin.'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Restaurant Info Form */}
      <Card>
        <CardHeader>
          <CardTitle>Thông Tin Nhà Hàng</CardTitle>
          <CardDescription>
            {isEditing ? 'Cập nhật thông tin chi tiết' : 'Xem thông tin nhà hàng'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Restaurant Name */}
            <div>
              <Label htmlFor="name" className="flex items-center gap-2">
                <Store className="h-4 w-4" />
                Tên nhà hàng
              </Label>
              <Input 
                id="name" 
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                required 
                className="mt-2"
              />
            </div>

            {/* Location - Đặt lên đầu để dễ kiểm soát */}
            <div>
              <Label className="flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4" />
                {isEditing ? 'Địa chỉ và vị trí nhà hàng' : 'Vị trí nhà hàng trên bản đồ'}
              </Label>
              
              {isEditing ? (
                <>
                  <LocationPickerWithAddress
                    onLocationChange={handleLocationChange}
                    initialAddress={formData.address}
                    initialLat={formData.lat || 21.0285}
                    initialLng={formData.lng || 105.8542}
                    height="450px"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    💡 Nhập địa chỉ hoặc nhấp vào bản đồ để chọn vị trí. Địa chỉ sẽ tự động cập nhật khi kéo marker.
                  </p>
                </>
              ) : (
                <>
                  <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Địa chỉ:</span> {formData.address || 'Chưa cập nhật'}
                    </p>
                  </div>
                  <RestaurantMap
                    lat={formData.lat}
                    lng={formData.lng}
                    name={formData.name}
                    height="400px"
                  />
                </>
              )}
            </div>

            {/* City */}
            <div>
              <Label htmlFor="city">Thành phố</Label>
              <Input 
                id="city" 
                value={formData.city}
                onChange={handleChange}
                disabled={!isEditing}
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
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                required 
                className="mt-2"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Mô tả
              </Label>
              <Textarea 
                id="description" 
                value={formData.description}
                onChange={handleChange}
                disabled={!isEditing}
                rows={4}
                className="mt-2"
              />
            </div>

            {/* Image URL */}
            <div>
              <Label htmlFor="image_url" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Link ảnh nhà hàng
              </Label>
              <Input 
                id="image_url" 
                type="url"
                value={formData.image_url}
                onChange={handleChange}
                disabled={!isEditing}
                className="mt-2"
              />
            </div>

            {/* Operating Hours */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="open_time" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Giờ mở cửa
                </Label>
                <Input 
                  id="open_time" 
                  type="time"
                  value={formData.open_time}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required 
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="close_time" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Giờ đóng cửa
                </Label>
                <Input 
                  id="close_time" 
                  type="time"
                  value={formData.close_time}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required 
                  className="mt-2"
                />
              </div>
            </div>

            {/* Submit Button */}
            {isEditing && (
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg" 
                  disabled={isLoading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Đang lưu..." : "Lưu Thay Đổi"}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
