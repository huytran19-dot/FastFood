import { useState } from "react"
import { Store, Clock, MapPin, Phone, Image as ImageIcon, FileText, Upload, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { restaurantAPI } from "@/lib/api"
import LocationPickerWithAddress from "@/components/map/LocationPickerWithAddress"

export default function RestaurantRegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: user?.phone || '',
    description: '',
    image_url: '',
    open_time: '07:00',
    close_time: '22:00',
    lat: null,
    lng: null
  })

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

  const handleImageUpload = async (file) => {
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Lỗi",
        description: "Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WEBP)",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Lỗi",
        description: "Kích thước file không được vượt quá 10MB",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploading(true);

      // Create FormData
      const formDataObj = new FormData();
      formDataObj.append('image', file);
      formDataObj.append('folder', 'restaurants');

      // Get auth token
      const token = localStorage.getItem('token');
      
      // Upload to backend
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataObj
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();

      if (data.success && data.image_url) {
        setFormData({ ...formData, image_url: data.image_url });
        
        toast({
          title: "Thành công",
          description: "Đã tải ảnh lên thành công"
        });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải ảnh lên",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Combine open_time and close_time into operating_hours
      const submitData = {
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        description: formData.description,
        image_url: formData.image_url,
        operating_hours: `${formData.open_time}-${formData.close_time}`,
        lat: formData.lat,
        lng: formData.lng
      }

      const restaurant = await restaurantAPI.register(submitData)
      
      // Lưu thông tin tạm để dùng ở trang pending (không lưu vào restaurant context vì chưa được duyệt)
      const pendingData = {
        ...restaurant,
        phone: formData.phone, // Số điện thoại để login lại
        // Không lưu password vì lý do bảo mật - sẽ yêu cầu đăng nhập lại nếu cần check status
      }
      localStorage.setItem('pendingRestaurant', JSON.stringify(pendingData))

      toast({
        title: "Đăng ký nhà hàng thành công!",
        description: "Nhà hàng của bạn đang chờ quản trị viên duyệt.",
      })

      // Redirect to pending page
      navigate('/pending')
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Đăng ký thất bại",
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto max-w-3xl px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-black">
              <Store className="h-9 w-9 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Đăng Ký Nhà Hàng</h1>
          <p className="mt-2 text-muted-foreground">
            Điền thông tin chi tiết về nhà hàng của bạn
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Thông Tin Nhà Hàng</CardTitle>
            <CardDescription>
              Cung cấp thông tin chính xác về nhà hàng
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

              {/* Location Picker with Address - Đặt lên đầu để dễ kiểm soát */}
              <div>
                <Label className="flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4" />
                  Địa chỉ và vị trí nhà hàng
                </Label>
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
                <Label className="flex items-center gap-2 mb-2">
                  <ImageIcon className="h-4 w-4" />
                  Hình ảnh nhà hàng
                </Label>
                <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  uploading ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-orange-500 cursor-pointer'
                }`}
                onClick={() => {
                  if (!uploading && !formData.image_url) {
                    document.getElementById('restaurant-image-upload')?.click();
                  }
                }}
                >
                  {uploading ? (
                    <div className="space-y-3">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                      <p className="text-sm text-gray-600">Đang tải ảnh lên...</p>
                    </div>
                  ) : formData.image_url ? (
                    <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                      <div className="relative">
                        <img
                          src={formData.image_url}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = 'https://placehold.co/400x300/png?text=Error';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image_url: '' })}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-lg"
                          disabled={uploading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      {/* Display URL */}
                      <div className="text-left">
                        <p className="text-xs text-gray-500 font-medium mb-1">URL hình ảnh:</p>
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                          <input
                            type="text"
                            value={formData.image_url}
                            readOnly
                            className="flex-1 text-xs bg-transparent border-none focus:outline-none text-gray-700"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(formData.image_url);
                              toast({
                                title: "Đã copy",
                                description: "URL đã được copy vào clipboard"
                              });
                            }}
                            className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-12 w-12 mx-auto text-gray-400" />
                      <div className="text-sm text-gray-600">
                        <span className="text-orange-600 hover:text-orange-700 font-medium">
                          Chọn ảnh từ máy tính
                        </span>
                        <input
                          id="restaurant-image-upload"
                          type="file"
                          className="hidden"
                          accept="image/jpeg,image/png,image/gif,image/webp"
                          disabled={uploading}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleImageUpload(file);
                              e.target.value = ''; // Reset input để có thể chọn lại cùng file
                            }
                          }}
                        />
                        <span> hoặc kéo thả ảnh vào đây</span>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF, WEBP tối đa 10MB</p>
                    </div>
                  )}
                </div>
                {/* Manual URL input */}
                {!formData.image_url && (
                  <div className="mt-3">
                    <Input
                      type="url"
                      placeholder="Hoặc nhập URL hình ảnh trực tiếp"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      disabled={uploading}
                    />
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
                  disabled={isLoading}
                >
                  {isLoading ? "Đang đăng ký..." : "Đăng Ký Nhà Hàng"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="mt-6 rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
          <p className="font-medium">Điều gì sẽ xảy ra tiếp theo?</p>
          <ul className="mt-2 ml-4 list-disc space-y-1">
            <li>Nhà hàng của bạn sẽ được đội ngũ của chúng tôi xem xét</li>
            <li>Bạn sẽ nhận được email xác nhận trong vòng 24-48 giờ</li>
            <li>Sau khi được duyệt, bạn có thể bắt đầu thêm món ăn và nhận đơn hàng</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
