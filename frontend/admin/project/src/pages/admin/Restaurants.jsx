import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { DataTable } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input, Select, Textarea } from '../../components/ui/FormControls';
import { useToast } from '../../components/ui/Toast';
import { getRestaurants, createRestaurant, getUsers } from '../../api/admin';
export function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    owner_id: 2,
    name: '',
    description: '',
    phone: '',
    address: '',
    status: 1
  });

  const { showToast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [restaurantsData, usersData] = await Promise.all([
        getRestaurants(),
        getUsers()
      ]);
      setRestaurants(restaurantsData);
      setUsers(usersData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createRestaurant(formData);
      showToast('Thêm nhà hàng thành công', 'success');
      setIsModalOpen(false);
      fetchData();
      setFormData({
        owner_id: 2,
        name: '',
        description: '',
        phone: '',
        address: '',
        status: 1
      });
    } catch (error) {
      showToast('Lỗi khi thêm nhà hàng', 'error');
    }
  };

  const getOwnerName = (ownerId) => {
    const owner = users.find(u => u.user_id === ownerId);
    return owner?.full_name || 'N/A';
  };

  const columns = [
    { key: 'restaurant_id', header: 'ID', sortable: true },
    { key: 'name', header: 'Tên', sortable: true },
    {
      key: 'owner_id',
      header: 'Chủ sở hữu',
      render: (r) => getOwnerName(r.owner_id)
    },
    { key: 'phone', header: 'SĐT' },
    { key: 'address', header: 'Địa chỉ' },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (r) => <Badge status={r.status === 1 ? 'active' : 'inactive'} type="user" />
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Nhà hàng</h1>
        <div className="bg-white rounded-2xl shadow-md h-64 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Nhà hàng</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#FF4D4F] text-white rounded-lg hover:bg-[#ff3739] transition-colors"
        >
          <Plus size={20} />
          Thêm nhà hàng
        </button>
      </div>

      <DataTable data={restaurants} columns={columns} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Thêm nhà hàng">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Chủ sở hữu"
            value={formData.owner_id}
            onChange={(e) => setFormData({ ...formData, owner_id: Number(e.target.value) })}
            options={users.map(u => ({ value: u.user_id, label: u.full_name }))}
          />
          <Input
            label="Tên nhà hàng"
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
            label="Số điện thoại"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Input
            label="Địa chỉ"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
          />
          <button
            type="submit"
            className="w-full px-4 py-2 bg-[#FF4D4F] text-white rounded-lg hover:bg-[#ff3739] transition-colors"
          >
            Thêm nhà hàng
          </button>
        </form>
      </Modal>
    </div>
  );
}
