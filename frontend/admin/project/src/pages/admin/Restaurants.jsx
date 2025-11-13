import { useEffect, useState } from 'react';
import { Check, X, Store } from 'lucide-react';
import { DataTable } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/FormControls';
import { useToast } from '../../components/ui/Toast';
import { getRestaurants, getUsers, approveRestaurant, rejectRestaurant } from '../../api/admin';
import RestaurantMap from '../../components/map/RestaurantMap';

export function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending', 'approved', 'rejected'

  const { showToast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Pre-check for token
      const token = localStorage.getItem('token') || sessionStorage.getItem('auth');
      if (!token) {
        console.error('⚠️ No token found - redirecting to login');
        showToast('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại', 'error');
        window.location.href = '/login';
        return;
      }

      const [restaurantsData, usersData] = await Promise.all([
        getRestaurants(),
        getUsers()
      ]);
      
      console.log('📊 Fetched restaurants:', restaurantsData);
      console.log('👥 Fetched users:', usersData);
      
      setRestaurants(restaurantsData || []);
      setUsers(usersData || []);
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        showToast('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại', 'error');
        window.location.href = '/login';
      } else {
        showToast('Lỗi khi tải dữ liệu: ' + error.message, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getOwnerInfo = (restaurant) => {
    // Backend already includes owner object in restaurant
    if (restaurant.owner) {
      return {
        name: restaurant.owner.full_name || 'N/A',
        email: restaurant.owner.email || 'N/A',
        phone: restaurant.owner.phone || 'N/A'
      };
    }
    
    // Fallback: find in users array
    const owner = users.find(u => u.user_id === restaurant.owner_id);
    return {
      name: owner?.full_name || 'N/A',
      email: owner?.email || 'N/A',
      phone: owner?.phone || 'N/A'
    };
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
  const rejectedRestaurants = restaurants.filter(r => r.review_status === 'REJECTED');

  const pendingColumns = [
    { key: 'restaurant_id', header: 'ID', sortable: true },
    { key: 'name', header: 'Tên nhà hàng', sortable: true },
    {
      key: 'owner',
      header: 'Chủ sở hữu',
      render: (r) => {
        const ownerInfo = getOwnerInfo(r);
        return (
          <div>
            <p className="font-medium text-gray-900">{ownerInfo.name}</p>
            <p className="text-xs text-gray-500">{ownerInfo.email}</p>
          </div>
        );
      }
    },
    { 
      key: 'phone', 
      header: 'SĐT nhà hàng',
      render: (r) => r.phone || 'N/A'
    },
    { 
      key: 'address', 
      header: 'Địa chỉ',
      render: (r) => r.address || '—'
    },
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
              setSelectedRestaurant(r);
              setIsDetailModalOpen(true);
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            title="Xem chi tiết nhà hàng"
          >
            Chi tiết
          </button>
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
      key: 'owner',
      header: 'Chủ sở hữu',
      render: (r) => {
        const ownerInfo = getOwnerInfo(r);
        return (
          <div>
            <p className="font-medium text-gray-900">{ownerInfo.name}</p>
            <p className="text-xs text-gray-500">{ownerInfo.email}</p>
          </div>
        );
      }
    },
    { 
      key: 'phone', 
      header: 'SĐT nhà hàng',
      render: (r) => r.phone || 'N/A'
    },
    { 
      key: 'address', 
      header: 'Địa chỉ',
      render: (r) => r.address || '—'
    },
    {
      key: 'rating',
      header: 'Đánh giá',
      render: (r) => (
        <div className="flex items-center gap-1">
          <span className="text-yellow-500">★</span>
          <span className="font-medium">{r.rating ? r.rating.toFixed(1) : 'N/A'}</span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (r) => getStatusBadge(r.status)
    },
    {
      key: 'approved_at',
      header: 'Ngày duyệt',
      render: (r) => r.approved_at ? new Date(r.approved_at).toLocaleDateString('vi-VN') : '—'
    }
  ];

  const rejectedColumns = [
    { key: 'restaurant_id', header: 'ID', sortable: true },
    { key: 'name', header: 'Tên nhà hàng', sortable: true },
    {
      key: 'owner',
      header: 'Chủ sở hữu',
      render: (r) => {
        const ownerInfo = getOwnerInfo(r);
        return (
          <div>
            <p className="font-medium text-gray-900">{ownerInfo.name}</p>
            <p className="text-xs text-gray-500">{ownerInfo.email}</p>
          </div>
        );
      }
    },
    { 
      key: 'phone', 
      header: 'SĐT nhà hàng',
      render: (r) => r.phone || 'N/A'
    },
    { 
      key: 'address', 
      header: 'Địa chỉ',
      render: (r) => r.address || '—'
    },
    {
      key: 'reject_reason',
      header: 'Lý do từ chối',
      render: (r) => (
        <span className="text-red-600 font-medium">
          {r.reject_reason || r.rejection_reason || 'Không có lý do'}
        </span>
      )
    },
    {
      key: 'approved_at',
      header: 'Ngày từ chối',
      render: (r) => r.approved_at ? new Date(r.approved_at).toLocaleDateString('vi-VN') : '—'
    }
  ];

  // Columns for "All Restaurants" tab
  const allRestaurantsColumns = [
    { key: 'restaurant_id', header: 'ID', sortable: true },
    { key: 'name', header: 'Tên nhà hàng', sortable: true },
    {
      key: 'owner',
      header: 'Chủ sở hữu',
      render: (r) => {
        const ownerInfo = getOwnerInfo(r);
        return (
          <div>
            <p className="font-medium text-gray-900">{ownerInfo.name}</p>
            <p className="text-xs text-gray-500">{ownerInfo.email}</p>
          </div>
        );
      }
    },
    { 
      key: 'phone', 
      header: 'SĐT',
      render: (r) => r.phone || 'N/A'
    },
    { 
      key: 'address', 
      header: 'Địa chỉ',
      render: (r) => r.address || '—'
    },
    {
      key: 'rating',
      header: 'Đánh giá',
      render: (r) => (
        <div className="flex items-center gap-1">
          <span className="text-yellow-500">★</span>
          <span className="font-medium">{r.rating ? r.rating.toFixed(1) : 'N/A'}</span>
        </div>
      )
    },
    {
      key: 'review_status',
      header: 'Trạng thái duyệt',
      render: (r) => getStatusBadge(r.review_status)
    },
    {
      key: 'status',
      header: 'Hoạt động',
      render: (r) => getStatusBadge(r.status)
    },
    {
      key: 'actions',
      header: 'Thao tác',
      render: (r) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedRestaurant(r);
            setIsDetailModalOpen(true);
          }}
          className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
        >
          Xem chi tiết
        </button>
      )
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
          onClick={() => setActiveTab('all')}
          className={`pb-3 px-4 font-medium transition-colors relative ${
            activeTab === 'all'
              ? 'text-[#FF4D4F] border-b-2 border-[#FF4D4F]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Tất cả nhà hàng
          {restaurants.length > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
              {restaurants.length}
            </span>
          )}
        </button>
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
        <button
          onClick={() => setActiveTab('rejected')}
          className={`pb-3 px-4 font-medium transition-colors relative ${
            activeTab === 'rejected'
              ? 'text-[#FF4D4F] border-b-2 border-[#FF4D4F]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Đã từ chối
          {rejectedRestaurants.length > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">
              {rejectedRestaurants.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      {activeTab === 'all' ? (
        restaurants.length > 0 ? (
          <DataTable data={restaurants} columns={allRestaurantsColumns} />
        ) : (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Chưa có nhà hàng nào
            </h3>
            <p className="text-gray-600">
              Các nhà hàng sẽ xuất hiện ở đây sau khi được đăng ký
            </p>
          </div>
        )
      ) : activeTab === 'pending' ? (
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
      ) : activeTab === 'approved' ? (
        <DataTable data={approvedRestaurants} columns={approvedColumns} />
      ) : (
        rejectedRestaurants.length > 0 ? (
          <DataTable data={rejectedRestaurants} columns={rejectedColumns} />
        ) : (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="text-red-400" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Không có nhà hàng bị từ chối
            </h3>
            <p className="text-gray-600">
              Các nhà hàng bị từ chối sẽ xuất hiện ở đây
            </p>
          </div>
        )
      )}

      {/* Detail Modal */}
      <Modal 
        isOpen={isDetailModalOpen} 
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedRestaurant(null);
        }} 
        title="Chi tiết nhà hàng"
      >
        {selectedRestaurant && (
          <div className="space-y-6">
            {/* Restaurant Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Tên nhà hàng</label>
                <p className="text-lg font-semibold text-gray-900 mt-1">{selectedRestaurant.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">ID</label>
                <p className="text-lg font-semibold text-gray-900 mt-1">#{selectedRestaurant.restaurant_id}</p>
              </div>
            </div>

            {/* Owner Info */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Thông tin chủ sở hữu</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Họ tên</label>
                  <p className="text-gray-900 mt-1">{getOwnerInfo(selectedRestaurant).name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900 mt-1">{getOwnerInfo(selectedRestaurant).email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Số điện thoại</label>
                  <p className="text-gray-900 mt-1">{getOwnerInfo(selectedRestaurant).phone}</p>
                </div>
              </div>
            </div>

            {/* Restaurant Contact */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Thông tin liên hệ</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">SĐT nhà hàng</label>
                  <p className="text-gray-900 mt-1">{selectedRestaurant.phone || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">Địa chỉ</label>
                  <p className="text-gray-900 mt-1">{selectedRestaurant.address}</p>
                </div>
              </div>
            </div>

            {/* Operating Hours */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Giờ hoạt động</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Giờ mở cửa</label>
                  <p className="text-gray-900 mt-1">{selectedRestaurant.open_time || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Giờ đóng cửa</label>
                  <p className="text-gray-900 mt-1">{selectedRestaurant.close_time || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {selectedRestaurant.description && (
              <div className="border-t pt-4">
                <label className="text-sm font-medium text-gray-500">Mô tả</label>
                <p className="text-gray-900 mt-2">{selectedRestaurant.description}</p>
              </div>
            )}

            {/* Map Location */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Vị trí trên bản đồ</h3>
              <RestaurantMap
                lat={selectedRestaurant.lat}
                lng={selectedRestaurant.lng}
                name={selectedRestaurant.name}
                address={selectedRestaurant.address}
                height="350px"
                mapId={`restaurant-map-${selectedRestaurant.restaurant_id}`}
              />
            </div>

            {/* Stats */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Thống kê</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Đánh giá</label>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-yellow-500">★</span>
                    <span className="font-medium text-gray-900">
                      {selectedRestaurant.rating ? selectedRestaurant.rating.toFixed(1) : 'N/A'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Trạng thái duyệt</label>
                  <div className="mt-1">{getStatusBadge(selectedRestaurant.review_status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Hoạt động</label>
                  <div className="mt-1">{getStatusBadge(selectedRestaurant.status)}</div>
                </div>
              </div>
            </div>

            {/* Reject Reason if rejected */}
            {selectedRestaurant.review_status === 'REJECTED' && selectedRestaurant.reject_reason && (
              <div className="border-t pt-4">
                <label className="text-sm font-medium text-gray-500">Lý do từ chối</label>
                <p className="text-red-600 font-medium mt-2">{selectedRestaurant.reject_reason}</p>
              </div>
            )}

            {/* Dates */}
            <div className="border-t pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Ngày đăng ký: </span>
                  <span className="text-gray-900">
                    {selectedRestaurant.created_at ? new Date(selectedRestaurant.created_at).toLocaleString('vi-VN') : 'N/A'}
                  </span>
                </div>
                {selectedRestaurant.approved_at && (
                  <div>
                    <span className="text-gray-500">Ngày duyệt/từ chối: </span>
                    <span className="text-gray-900">
                      {new Date(selectedRestaurant.approved_at).toLocaleString('vi-VN')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
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
