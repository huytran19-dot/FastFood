import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { DataTable } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import { getUsers, toggleUserStatus, deleteUser } from '../../api/admin';

export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    userId: null,
    action: null
  });

  const { showToast } = useToast();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getUsers();
      // Hiển thị tất cả users (admin, restaurant owners, và users thường)
      setUsers(data);
    } catch (error) {
      showToast('Lỗi khi tải danh sách người dùng', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await toggleUserStatus(userId, newStatus);
      showToast('Cập nhật trạng thái thành công', 'success');
      fetchUsers();
    } catch (error) {
      showToast('Lỗi khi cập nhật trạng thái', 'error');
    }
  };

  const handleDeleteUser = async () => {
    try {
      await deleteUser(confirmDialog.userId);
      showToast('Xóa người dùng thành công', 'success');
      setConfirmDialog({ isOpen: false, userId: null, action: null });
      fetchUsers();
    } catch (error) {
      showToast('Lỗi khi xóa người dùng', 'error');
    }
  };

  const columns = [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'full_name', header: 'Họ tên', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'phone', header: 'SĐT' },
    {
      key: 'role',
      header: 'Vai trò',
      render: (user) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {user.role?.name || 'N/A'}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (user) => (
        <Badge 
          status={user.status === 'active' ? 'active' : 'inactive'} 
          type="user" 
        />
      )
    },
    {
      key: 'actions',
      header: 'Thao tác',
      render: (user) => (
        <div className="flex gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleStatus(user.id, user.status);
            }}
            className={`text-xs px-2.5 py-1.5 rounded-lg transition-colors font-medium ${
              user.status === 'active'
                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {user.status === 'active' ? 'Khóa' : 'Mở'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setConfirmDialog({ isOpen: true, userId: user.id, action: 'delete' });
            }}
            className="text-xs px-2.5 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-1 font-medium"
          >
            <Trash2 size={12} />
            Xóa
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
        <h1 className="text-2xl font-semibold text-gray-900">Quản lý người dùng</h1>
      </div>

      <DataTable data={users} columns={columns} />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, userId: null, action: null })}
        onConfirm={handleDeleteUser}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác."
      />
    </div>
  );
}
