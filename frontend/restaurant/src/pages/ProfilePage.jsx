import { useState, useEffect } from "react"
import { Store, MapPin, Phone, Clock, Image as ImageIcon, FileText, Upload, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { restaurantAPI } from "@/lib/api"

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    phone: '',
    description: '',
    image_url: '',
    open_time: '07:00',
    close_time: '22:00'
  })

  useEffect(() => {
    loadRestaurantData()
  }, [])

  const loadRestaurantData = async () => {
    try {
      setIsLoading(true)
      const restaurant = await restaurantAPI.getMine()
      
      if (restaurant) {
        // Parse operating_hours back to open_time and close_time
        const [open_time, close_time] = restaurant.operating_hours 
          ? restaurant.operating_hours.split('-').map(t => t.trim())
          : ['07:00', '22:00']

        setFormData({
          name: restaurant.name || '',
          address: restaurant.address || '',
          city: restaurant.city || '',
          phone: restaurant.phone || '',
          description: restaurant.description || '',
          image_url: restaurant.image_url || '',
          open_time,
          close_time
        })

        if (restaurant.image_url) {
          setImagePreview(restaurant.image_url)
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi tải dữ liệu",
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }))
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "File không hợp lệ",
        description: "Vui lòng chọn file ảnh (PNG, JPG, JPEG)",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File quá lớn",
        description: "Vui lòng chọn ảnh nhỏ hơn 5MB",
      })
      return
    }

    setIsUploading(true)

    try {
      const formDataUpload = new FormData()
      formDataUpload.append('image', file)
      formDataUpload.append('folder', 'restaurants')

      const token = localStorage.getItem('authToken')
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formDataUpload,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Upload thất bại')
      }

      setFormData(prev => ({
        ...prev,
        image_url: data.image_url
      }))
      setImagePreview(data.image_url)

      toast({
        title: "Upload thành công!",
        description: "Ảnh nhà hàng đã được tải lên.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload thất bại",
        description: error.message,
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      image_url: ''
    }))
    setImagePreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Combine open_time and close_time into operating_hours
      const submitData = {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        phone: formData.phone,
        description: formData.description,
        image_url: formData.image_url,
        operating_hours: `${formData.open_time}-${formData.close_time}`
      }

      await restaurantAPI.update('mine', submitData)
      
      toast({
        title: "Cập nhật thành công!",
        description: "Thông tin nhà hàng đã được cập nhật.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Cập nhật thất bại",
        description: error.message,
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Hồ Sơ Nhà Hàng</h1>
        <p className="mt-2 text-muted-foreground">
          Quản lý thông tin nhà hàng của bạn
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông Tin Nhà Hàng</CardTitle>
          <CardDescription>
            Cập nhật thông tin chi tiết về nhà hàng
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
                placeholder="Cơm Tấm Út Hồng" 
                value={formData.name}
                onChange={handleChange}
                required 
                className="mt-2"
              />
            </div>

            {/* Address */}
            <div>
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Địa chỉ
              </Label>
              <Input 
                id="address" 
                placeholder="123 Lý Thường Kiệt" 
                value={formData.address}
                onChange={handleChange}
                required 
                className="mt-2"
              />
            </div>

            {/* City */}
            <div>
              <Label htmlFor="city">Thành phố</Label>
              <Input 
                id="city" 
                placeholder="TP. Hồ Chí Minh" 
                value={formData.city}
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

            {/* Description */}
            <div>
              <Label htmlFor="description" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Mô tả
              </Label>
              <Textarea 
                id="description" 
                placeholder="Món ăn Việt Nam chính gốc với nguyên liệu tươi ngon..." 
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="mt-2"
              />
            </div>

            {/* Image Upload */}
            <div>
              <Label htmlFor="image_url" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Hình ảnh nhà hàng
              </Label>
              
              {imagePreview ? (
                <div className="mt-2 relative">
                  <img 
                    src={imagePreview} 
                    alt="Restaurant preview" 
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="mt-2">
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Click để tải ảnh lên</span> hoặc kéo thả
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG hoặc JPEG (Tối đa 5MB)
                      </p>
                    </div>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                  </label>
                  {isUploading && (
                    <p className="mt-2 text-sm text-center text-muted-foreground">
                      Đang tải ảnh lên...
                    </p>
                  )}
                </div>
              )}
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
                  required 
                  className="mt-2"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full" 
                size="lg" 
                disabled={isSaving || isUploading}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  "Cập Nhật Thông Tin"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

