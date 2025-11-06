import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  DollarSign,
  Package,
  Tag,
  Image as ImageIcon,
  Upload
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import { menuAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function MenuPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: ''
  });

  // Load menu items from API
  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      const data = await menuAPI.getAll();
      
      // Transform API data to match component format
      const transformedData = data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        category: 'Món ăn', // Default category since DB doesn't have category field
        price: parseFloat(item.price),
        image: item.image_url || 'https://placehold.co/400x300/png?text=No+Image',
        status: item.is_available ? 'available' : 'unavailable',
        stock: 50, // Default stock since DB doesn't have stock field
        sold: 0    // Default sold since DB doesn't have sold field
      }));
      
      setMenuItems(transformedData);
    } catch (error) {
      console.error('Failed to load menu items:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách món ăn",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const toggleStatus = async (id) => {
    try {
      await menuAPI.toggleAvailability(id);
      
      // Update local state
      setMenuItems(menuItems.map(item => 
        item.id === id 
          ? { ...item, status: item.status === 'available' ? 'unavailable' : 'available' }
          : item
      ));
      
      toast({
        title: "Thành công",
        description: "Đã cập nhật trạng thái món ăn"
      });
    } catch (error) {
      console.error('Toggle status error:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật trạng thái",
        variant: "destructive"
      });
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price.toString(),
        image_url: item.image
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        image_url: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setUploading(false);
  };

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
      formDataObj.append('folder', 'menu-items');

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
    e.preventDefault();
    
    try {
      const menuData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        image_url: formData.image_url,
        is_available: true
      };

      if (editingItem) {
        // Update existing item
        await menuAPI.update(editingItem.id, menuData);
        
        toast({
          title: "Thành công",
          description: "Đã cập nhật món ăn"
        });
      } else {
        // Add new item
        await menuAPI.create(menuData);
        
        toast({
          title: "Thành công",
          description: "Đã thêm món ăn mới"
        });
      }
      
      // Reload menu items
      await loadMenuItems();
      handleCloseModal();
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể lưu món ăn",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa món này?')) {
      return;
    }

    try {
      await menuAPI.delete(id);
      
      // Update local state
      setMenuItems(menuItems.filter(item => item.id !== id));
      
      toast({
        title: "Thành công",
        description: "Đã xóa món ăn"
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa món ăn",
        variant: "destructive"
      });
    }
  };

  const stats = {
    total: menuItems.length,
    available: menuItems.filter(i => i.status === 'available').length,
    unavailable: menuItems.filter(i => i.status === 'unavailable').length
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Quản Lý Thực Đơn</h1>
          <p className="mt-2 text-gray-600">
            Thêm và chỉnh sửa món ăn
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium"
        >
          <Plus className="h-5 w-5" />
          Thêm Món Mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng Món</p>
                <p className="text-2xl font-bold mt-1">{stats.total}</p>
              </div>
              <Package className="h-10 w-10 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đang Bán</p>
                <p className="text-2xl font-bold mt-1 text-green-600">{stats.available}</p>
              </div>
              <Eye className="h-10 w-10 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hết Hàng</p>
                <p className="text-2xl font-bold mt-1 text-red-600">{stats.unavailable}</p>
              </div>
              <EyeOff className="h-10 w-10 text-red-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm món ăn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </CardContent>
      </Card>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map(item => (
          <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            {/* Image */}
            <div className="relative h-48 bg-gray-100">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                }}
              />
              {/* Status Badge */}
              <div className="absolute top-3 left-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  item.status === 'available'
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                }`}>
                  {item.status === 'available' ? 'Còn hàng' : 'Hết hàng'}
                </span>
              </div>
              
              {/* Actions Dropdown */}
              <div className="absolute top-3 right-3">
                <div className="relative">
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === item.id ? null : item.id)}
                    className="p-2 bg-white rounded-lg hover:bg-gray-50 shadow-md"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>
                  
                  {activeDropdown === item.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                      <button 
                        onClick={() => {
                          handleOpenModal(item);
                          setActiveDropdown(null);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Edit className="h-4 w-4" />
                        Chỉnh sửa
                      </button>
                      <button 
                        onClick={() => {
                          toggleStatus(item.id);
                          setActiveDropdown(null);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        {item.status === 'available' ? (
                          <>
                            <EyeOff className="h-4 w-4" />
                            Ẩn món
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4" />
                            Hiện món
                          </>
                        )}
                      </button>
                      <hr className="my-1" />
                      <button 
                        onClick={() => {
                          handleDelete(item.id);
                          setActiveDropdown(null);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Xóa món
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <CardContent className="pt-4">
              <div className="space-y-3">
                {/* Name */}
                <h3 className="font-bold text-lg line-clamp-1">{item.name}</h3>

                {/* Description */}
                <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px]">
                  {item.description || 'Chưa có mô tả'}
                </p>

                {/* Price */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-1 text-orange-600">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-bold text-lg">{formatPrice(item.price)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Không tìm thấy món ăn
              </h3>
              <p className="text-gray-600">
                Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Click outside to close dropdown */}
      {activeDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setActiveDropdown(null)}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingItem ? 'Chỉnh Sửa Món Ăn' : 'Thêm Món Mới'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hình ảnh
            </label>
            <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              uploading ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-orange-500 cursor-pointer'
            }`}
            onClick={() => {
              if (!uploading && !formData.image_url) {
                document.getElementById('image-upload')?.click();
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
                      id="image-upload"
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
                <input
                  type="url"
                  placeholder="Hoặc nhập URL hình ảnh trực tiếp"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  disabled={uploading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên món <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="VD: Burger Phô Mai Đặc Biệt"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mô tả chi tiết về món ăn..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giá (VNĐ) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min="0"
              step="1000"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="50000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              disabled={uploading}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Đang tải ảnh...' : editingItem ? 'Cập nhật' : 'Thêm món'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
