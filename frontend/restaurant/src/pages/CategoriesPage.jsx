import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Tag,
  MoreVertical,
  Eye,
  EyeOff,
  Grid,
  List
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import { categoryAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function CategoriesPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    status: 1
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryAPI.getAll();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách danh mục",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        status: category.status
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        status: 1
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingCategory) {
        await categoryAPI.update(editingCategory.id, formData);
        toast({
          title: "Thành công",
          description: "Đã cập nhật danh mục"
        });
      } else {
        await categoryAPI.create(formData);
        toast({
          title: "Thành công",
          description: "Đã tạo danh mục mới"
        });
      }

      await loadCategories();
      handleCloseModal();
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể lưu danh mục",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      return;
    }

    try {
      await categoryAPI.delete(id);
      setCategories(categories.filter(cat => cat.id !== id));
      toast({
        title: "Thành công",
        description: "Đã xóa danh mục"
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa danh mục",
        variant: "destructive"
      });
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await categoryAPI.toggleStatus(id);
      setCategories(categories.map(cat =>
        cat.id === id ? { ...cat, status: cat.status === 1 ? 0 : 1 } : cat
      ));
      toast({
        title: "Thành công",
        description: "Đã cập nhật trạng thái"
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

  const stats = {
    total: categories.length,
    active: categories.filter(c => c.status === 1).length,
    inactive: categories.filter(c => c.status === 0).length,
    totalItems: categories.reduce((sum, cat) => sum + (cat.menu_items_count || 0), 0)
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
          <h1 className="text-3xl font-bold">Quản Lý Danh Mục</h1>
          <p className="mt-2 text-gray-600">
            Tạo và quản lý danh mục món ăn cho nhà hàng
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium"
        >
          <Plus className="h-5 w-5" />
          Thêm Danh Mục
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng Danh Mục</p>
                <p className="text-2xl font-bold mt-1">{stats.total}</p>
              </div>
              <Tag className="h-10 w-10 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đang Hoạt Động</p>
                <p className="text-2xl font-bold mt-1 text-green-600">{stats.active}</p>
              </div>
              <Eye className="h-10 w-10 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đã Ẩn</p>
                <p className="text-2xl font-bold mt-1 text-gray-600">{stats.inactive}</p>
              </div>
              <EyeOff className="h-10 w-10 text-gray-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng Món Ăn</p>
                <p className="text-2xl font-bold mt-1">{stats.totalItems}</p>
              </div>
              <Grid className="h-10 w-10 text-purple-500 opacity-80" />
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
              placeholder="Tìm kiếm danh mục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((category) => (
          <Card key={category.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Tag className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{category.name}</h3>
                      <p className="text-sm text-gray-600">
                        {category.menu_items_count} món ăn
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      category.status === 1
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {category.status === 1 ? 'Hoạt động' : 'Đã ẩn'}
                    </span>
                  </div>
                </div>

                {/* Actions Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === category.id ? null : category.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>

                  {activeDropdown === category.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                      <button
                        onClick={() => {
                          handleOpenModal(category);
                          setActiveDropdown(null);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Edit className="h-4 w-4" />
                        Chỉnh sửa
                      </button>
                      <button
                        onClick={() => {
                          handleToggleStatus(category.id);
                          setActiveDropdown(null);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        {category.status === 1 ? (
                          <>
                            <EyeOff className="h-4 w-4" />
                            Ẩn danh mục
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4" />
                            Hiện danh mục
                          </>
                        )}
                      </button>
                      <hr className="my-1" />
                      <button
                        onClick={() => {
                          handleDelete(category.id);
                          setActiveDropdown(null);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        disabled={category.menu_items_count > 0}
                      >
                        <Trash2 className="h-4 w-4" />
                        Xóa danh mục
                      </button>
                      {category.menu_items_count > 0 && (
                        <p className="px-4 py-2 text-xs text-gray-500">
                          Không thể xóa danh mục có món ăn
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredCategories.length === 0 && (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <Tag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'Không tìm thấy danh mục' : 'Chưa có danh mục nào'}
              </h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? 'Thử thay đổi từ khóa tìm kiếm'
                  : 'Tạo danh mục đầu tiên để bắt đầu phân loại món ăn'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => handleOpenModal()}
                  className="mt-4 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                >
                  Thêm Danh Mục
                </button>
              )}
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
        title={editingCategory ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên danh mục <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="VD: Burger, Pizza, Đồ uống..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value={1}>Hoạt động</option>
              <option value={0}>Ẩn</option>
            </select>
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
              {editingCategory ? 'Cập nhật' : 'Thêm danh mục'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
