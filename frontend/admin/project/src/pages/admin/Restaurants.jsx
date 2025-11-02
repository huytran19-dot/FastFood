import { useEffect, useState } from 'react';
import { Check, X, Store } from 'lucide-react';
import { DataTable } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/FormControls';
import { useToast } from '../../components/ui/Toast';
import { getRestaurants, getUsers, approveRestaurant, rejectRestaurant } from '../../api/admin';

export function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' hoặc 'approved'

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

  const getOwnerName = (ownerId) => {
    const owner = users.find(u => u.user_id === ownerId);
    return owner?.full_name || 'N/A';
  };

  const handleApprove = async (restaurant) => {
    try {
      await approveRestaurant(restaurant.restaurant_id);
      showToast(`Đã duyệt nhà hàng: ${restaurant.name}`, 'success');
      fetchData();
    } catch (error) {
      showToast('Lỗi khi duyệt nhà hàng', 'error');
    }
  };

  const handleReject = async () => {
    try {
      await rejectRestaurant(selectedRestaurant.restaurant_id, rejectReason);
      showToast(`Đã từ chối nhà hàng: ${selectedRestaurant.name}`, 'success');
      setIsRejectModalOpen(false);
      setRejectReason('');
      fetchData();
    } catch (error) {
      showToast('Lỗi khi từ chối nhà hàng', 'error');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'PENDING': { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800' },
      'APPROVED': { label: 'Đã duyệt', color: 'bg-green-100 text-green-800' },
      'REJECTED': { label: 'Từ chối', color: 'bg-red-100 text-red-800' },
      1: { label: 'Hoạt động', color: 'bg-green-100 text-green-800' },
      0: { label: 'Không hoạt động', color: 'bg-gray-100 text-gray-800' }
    };
    const statusInfo = statusMap[status] || statusMap[1];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  // Lọc nhà hàng theo tab
  const pendingRestaurants = restaurants.filter(r => r.review_status === 'PENDING');
  const approvedRestaurants = restaurants.filter(r => r.review_status === 'APPROVED' || r.status === 1);

  const pendingColumns = [
    { key: 'restaurant_id', header: 'ID', sortable: true },
    { key: 'name', header: 'Tên nhà hàng', sortable: true },
    {
      key: 'owner_id',
      header: 'Chủ sở hữu',
      render: (r) => (
        <div>
          <p className="font-medium text-gray-900">{getOwnerName(r.owner_id)}</p>
          <p className="text-xs text-gray-500">{users.find(u => u.user_id === r.owner_id)?.email}</p>
        </div>
      )
    },
    { key: 'phone', header: 'SĐT' },
    { key: 'address', header: 'Địa chỉ' },
    {
      key: 'created_at',
      header: 'Ngày đăng ký',
      render: (r) => r.created_at ? new Date(r.created_at).toLocaleDateString('vi-VN') : '—'
    },
    {
      key: 'actions',
      header: 'Thao tác',
      render: (r) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleApprove(r);
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            title="Duyệt nhà hàng này"
          >
            <Check size={16} />
            Duyệt
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedRestaurant(r);
              setIsRejectModalOpen(true);
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            title="Từ chối nhà hàng này"
          >
            <X size={16} />
            Từ chối
          </button>
        </div>
      )
    }
  ];

  const approvedColumns = [
    { key: 'restaurant_id', header: 'ID', sortable: true },
    { key: 'name', header: 'Tên nhà hàng', sortable: true },
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
      render: (r) => getStatusBadge(r.review_status || r.status)
    },
    {
      key: 'created_at',
      header: 'Ngày duyệt',
      render: (r) => r.updated_at ? new Date(r.updated_at).toLocaleDateString('vi-VN') : '—'
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
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Quản lí Nhà hàng</h1>
        <p className="text-sm text-gray-600 mt-1">
          Duyệt các yêu cầu đăng ký nhà hàng mới và quản lí nhà hàng đã được duyệt
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 px-4 font-medium transition-colors relative ${
            activeTab === 'pending'
              ? 'text-[#FF4D4F] border-b-2 border-[#FF4D4F]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Chờ duyệt
          {pendingRestaurants.length > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">
              {pendingRestaurants.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`pb-3 px-4 font-medium transition-colors relative ${
            activeTab === 'approved'
              ? 'text-[#FF4D4F] border-b-2 border-[#FF4D4F]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Đã duyệt
          {approvedRestaurants.length > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
              {approvedRestaurants.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      {activeTab === 'pending' ? (
        pendingRestaurants.length > 0 ? (
          <DataTable data={pendingRestaurants} columns={pendingColumns} />
        ) : (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Không có yêu cầu chờ duyệt
            </h3>
            <p className="text-gray-600">
              Các nhà hàng mới đăng ký sẽ xuất hiện ở đây để bạn duyệt
            </p>
          </div>
        )
      ) : (
        <DataTable data={approvedRestaurants} columns={approvedColumns} />
      )}

      <Modal 
        isOpen={isRejectModalOpen} 
        onClose={() => {
          setIsRejectModalOpen(false);
          setRejectReason('');
        }} 
        title="Từ chối nhà hàng"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Bạn có chắc muốn từ chối nhà hàng <strong>{selectedRestaurant?.name}</strong>?
          </p>
          <Textarea
            label="Lý do từ chối"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
            placeholder="Nhập lý do từ chối..."
            required
          />
          <div className="flex gap-3">
            <button
              onClick={() => {
                setIsRejectModalOpen(false);
                setRejectReason('');
              }}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleReject}
              disabled={!rejectReason.trim()}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Xác nhận từ chối
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
