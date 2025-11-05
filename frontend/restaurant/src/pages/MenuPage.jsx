import { useState } from 'react';
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

// Mock data
const mockMenuItems = [
  {
    id: 1,
    name: 'Burger Phô Mai Đặc Biệt',
    description: 'Burger bò Úc 200g với phô mai cheddar, rau tươi và sốt đặc biệt',
    category: 'Burger',
    price: 89000,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    status: 'available',
    stock: 50,
    sold: 234
  },
  {
    id: 2,
    name: 'Pizza Hải Sản',
    description: 'Pizza size M với tôm, mực, sò điệp và phô mai mozzarella',
    category: 'Pizza',
    price: 159000,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
    status: 'available',
    stock: 30,
    sold: 178
  },
  {
    id: 3,
    name: 'Gà Rán Giòn',
    description: '6 miếng gà rán giòn với sốt tương ớt và khoai tây chiên',
    category: 'Gà',
    price: 129000,
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400',
    status: 'available',
    stock: 40,
    sold: 312
  },
  {
    id: 4,
    name: 'Mì Ý Sốt Bò Bằm',
    description: 'Mì Ý truyền thống với sốt cà chua và thịt bò bằm',
    category: 'Mì Ý',
    price: 79000,
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400',
    status: 'available',
    stock: 25,
    sold: 156
  },
  {
    id: 5,
    name: 'Salad Caesar',
    description: 'Rau xà lách tươi với gà nướng, phô mai parmesan và sốt Caesar',
    category: 'Salad',
    price: 69000,
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
    status: 'available',
    stock: 35,
    sold: 89
  },
  {
    id: 6,
    name: 'Sushi Set',
    description: 'Set 12 miếng sushi hỗn hợp với wasabi và gừng ngâm',
    category: 'Sushi',
    price: 189000,
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400',
    status: 'unavailable',
    stock: 0,
    sold: 267
  },
  {
    id: 7,
    name: 'Trà Sữa Trân Châu',
    description: 'Trà sữa Đài Loan với trân châu đen và topping tùy chọn',
    category: 'Đồ Uống',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=400',
    status: 'available',
    stock: 100,
    sold: 445
  },
  {
    id: 8,
    name: 'Bánh Mì Pate',
    description: 'Bánh mì truyền thống với pate, chả lụa và rau thơm',
    category: 'Bánh Mì',
    price: 35000,
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400',
    status: 'available',
    stock: 60,
    sold: 523
  }
];

const categories = ['Tất cả', 'Burger', 'Pizza', 'Gà', 'Mì Ý', 'Salad', 'Sushi', 'Đồ Uống', 'Bánh Mì'];

export default function MenuPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [menuItems, setMenuItems] = useState(mockMenuItems);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Burger',
    price: '',
    stock: '',
    image: ''
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Tất cả' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleStatus = (id) => {
    setMenuItems(menuItems.map(item => 
      item.id === id 
        ? { ...item, status: item.status === 'available' ? 'unavailable' : 'available' }
        : item
    ));
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description,
        category: item.category,
        price: item.price.toString(),
        stock: item.stock.toString(),
        image: item.image
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        category: 'Burger',
        price: '',
        stock: '',
        image: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingItem) {
      // Update existing item
      setMenuItems(menuItems.map(item =>
        item.id === editingItem.id
          ? {
              ...item,
              ...formData,
              price: parseInt(formData.price),
              stock: parseInt(formData.stock)
            }
          : item
      ));
    } else {
      // Add new item
      const newItem = {
        id: menuItems.length + 1,
        ...formData,
        price: parseInt(formData.price),
        stock: parseInt(formData.stock),
        status: 'available',
        sold: 0
      };
      setMenuItems([...menuItems, newItem]);
    }
    
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa món này?')) {
      setMenuItems(menuItems.filter(item => item.id !== id));
    }
  };

  const stats = {
    total: menuItems.length,
    available: menuItems.filter(i => i.status === 'available').length,
    unavailable: menuItems.filter(i => i.status === 'unavailable').length,
    lowStock: menuItems.filter(i => i.stock < 20).length
  };

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sắp Hết</p>
                <p className="text-2xl font-bold mt-1 text-orange-600">{stats.lowStock}</p>
              </div>
              <Tag className="h-10 w-10 text-orange-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search */}
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

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
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
                {/* Category Tag */}
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                    {item.category}
                  </span>
                  <span className="text-xs text-gray-500">
                    Đã bán: {item.sold}
                  </span>
                </div>

                {/* Name */}
                <h3 className="font-bold text-lg line-clamp-1">{item.name}</h3>

                {/* Description */}
                <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px]">
                  {item.description}
                </p>

                {/* Price & Stock */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-1 text-orange-600">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-bold text-lg">{formatPrice(item.price)}</span>
                  </div>
                  <div className={`text-sm font-medium ${
                    item.stock < 20 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    Kho: {item.stock}
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
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors cursor-pointer">
              {formData.image ? (
                <div className="relative">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image: '' })}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-12 w-12 mx-auto text-gray-400" />
                  <div className="text-sm text-gray-600">
                    <label className="cursor-pointer text-orange-600 hover:text-orange-700 font-medium">
                      Tải ảnh lên
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          // In real app, upload to server and get URL
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFormData({ ...formData, image: reader.result });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    {' '}hoặc kéo thả ảnh vào đây
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF tối đa 10MB</p>
                </div>
              )}
            </div>
            <input
              type="url"
              placeholder="Hoặc nhập URL hình ảnh"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
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

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Danh mục <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {categories.filter(c => c !== 'Tất cả').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá (VNĐ) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="50000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số lượng <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="50"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium"
            >
              {editingItem ? 'Cập nhật' : 'Thêm món'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
