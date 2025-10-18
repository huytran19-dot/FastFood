import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { DataTable } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/FormControls';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import { getUsers, createUser, toggleUserStatus, updateUserRole } from '../../api/admin';
export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    userId: null
  });

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'customer',
    phone: '',
    address: ''
  });

  const { showToast } = useToast();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createUser(formData);
      showToast('Thêm người dùng thành công', 'success');
      setIsModalOpen(false);
      fetchUsers();
      setFormData({
        full_name: '',
        email: '',
        password: '',
        role: 'customer',
        phone: '',
        address: ''
      });
    } catch (error) {
      showToast('Lỗi khi thêm người dùng', 'error');
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await toggleUserStatus(userId);
      showToast('Cập nhật trạng thái thành công', 'success');
      fetchUsers();
    } catch (error) {
      showToast('Lỗi khi cập nhật trạng thái', 'error');
    }
  };

  const columns = [
    { key: 'user_id', header: 'ID', sortable: true },
    { key: 'full_name', header: 'Họ tên', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'phone', header: 'Số điện thoại' },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (user) => <Badge status={user.status === 1 ? 'active' : 'inactive'} type="user" />
    },
    {
      key: 'actions',
      header: 'Thao tác',
      render: (user) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleStatus(user.user_id);
            }}
            className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
          >
            {user.status === 1 ? 'Khóa' : 'Mở'}
          </button>
        </div>
      )
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Người dùng</h1>
        <div className="bg-white rounded-2xl shadow-md h-64 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Người dùng</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#FF4D4F] text-white rounded-lg hover:bg-[#ff3739] transition-colors"
        >
          <Plus size={20} />
          Thêm người dùng
        </button>
      </div>

      <DataTable data={users} columns={columns} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Thêm người dùng">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Họ tên"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label="Mật khẩu"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <Select
            label="Vai trò"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            options={[
              { value: 'admin', label: 'Admin' },
              { value: 'restaurant_owner', label: 'Chủ nhà hàng' },
              { value: 'customer', label: 'Khách hàng' }
            ]}
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
          />
          <button
            type="submit"
            className="w-full px-4 py-2 bg-[#FF4D4F] text-white rounded-lg hover:bg-[#ff3739] transition-colors"
          >
            Thêm người dùng
          </button>
        </form>
      </Modal>
    </div>
  );
}
