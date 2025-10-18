import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Input, Textarea, Toggle } from '../../components/ui/FormControls';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../auth/AuthContext';
import {
  getMyRestaurant,
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} from '../../api/restaurant';
export function RestaurantMenu() {
  const { user_id } = useAuth();
  const [restaurantId, setRestaurantId] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    itemId: null
  });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    image_url: '',
    is_available: true
  });

  const { showToast } = useToast();

  const fetchData = async () => {
    if (!user_id) return;

    setIsLoading(true);
    try {
      const restaurant = await getMyRestaurant(user_id);
      setRestaurantId(restaurant.restaurant_id);
      const items = await getMenuItems(restaurant.restaurant_id);
      setMenuItems(items);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user_id]);

  const handleOpenModal = (item) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description || '',
        price: item.price,
        image_url: item.image_url || '',
        is_available: item.is_available
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        image_url: '',
        is_available: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!restaurantId) return;

    if (formData.price <= 0) {
      showToast('Giá phải lớn hơn 0', 'error');
      return;
    }

    try {
      if (editingItem) {
        await updateMenuItem(editingItem.item_id, formData);
        showToast('Cập nhật món ăn thành công', 'success');
      } else {
        await createMenuItem({
          ...formData,
          restaurant_id: restaurantId
        });
        showToast('Thêm món ăn thành công', 'success');
      }

      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      showToast(editingItem ? 'Lỗi khi cập nhật món ăn' : 'Lỗi khi thêm món ăn', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.itemId) return;

    try {
      await deleteMenuItem(deleteDialog.itemId);
      showToast('Xóa món ăn thành công', 'success');
      fetchData();
    } catch (error) {
      showToast('Lỗi khi xóa món ăn', 'error');
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      await updateMenuItem(item.item_id, { is_available: !item.is_available });
      showToast('Cập nhật trạng thái thành công', 'success');
      fetchData();
    } catch (error) {
      showToast('Lỗi khi cập nhật trạng thái', 'error');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const columns = [
    {
      key: 'image_url',
      header: 'Hình ảnh',
      render: (item) => (
        <img
          src={item.image_url || 'https://via.placeholder.com/50'}
          alt={item.name}
          className="w-12 h-12 object-cover rounded-lg"
        />
      )
    },
    { key: 'name', header: 'Tên món', sortable: true },
    {
      key: 'price',
      header: 'Giá',
      render: (item) => formatCurrency(item.price),
      sortable: true
    },
    {
      key: 'is_available',
      header: 'Trạng thái',
      render: (item) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          item.is_available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {item.is_available ? 'Hiển thị' : 'Ẩn'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Thao tác',
      render: (item) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleAvailability(item);
            }}
            className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
          >
            {item.is_available ? 'Ẩn' : 'Hiện'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenModal(item);
            }}
            className="p-1 text-gray-600 hover:text-blue-600"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteDialog({ isOpen: true, itemId: item.item_id });
            }}
            className="p-1 text-gray-600 hover:text-red-600"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Thực đơn</h1>
        <div className="bg-white rounded-2xl shadow-md h-64 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Thực đơn</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-[#FF4D4F] text-white rounded-lg hover:bg-[#ff3739] transition-colors"
        >
          <Plus size={20} />
          Thêm món
        </button>
      </div>

      <DataTable data={menuItems} columns={columns} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Chỉnh sửa món ăn' : 'Thêm món ăn'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Tên món"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Textarea
            label="Mô tả"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
          <Input
            label="Giá (VND)"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            required
            min="1"
          />
          <Input
            label="URL hình ảnh"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            placeholder="https://..."
          />
          <Toggle
            label="Hiển thị món này"
            checked={formData.is_available}
            onChange={(checked) => setFormData({ ...formData, is_available: checked })}
          />
          <button
            type="submit"
            className="w-full px-4 py-2 bg-[#FF4D4F] text-white rounded-lg hover:bg-[#ff3739] transition-colors"
          >
            {editingItem ? 'Cập nhật' : 'Thêm món'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, itemId: null })}
        onConfirm={handleDelete}
        title="Xóa món ăn"
        message="Bạn có chắc chắn muốn xóa món ăn này?"
        confirmText="Xóa"
        variant="danger"
      />
    </div>
  );
}
