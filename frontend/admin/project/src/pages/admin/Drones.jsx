import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { DataTable } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/FormControls';
import { useToast } from '../../components/ui/Toast';
import { getDrones, createDrone, updateDrone, deleteDrone, getRestaurants } from '../../api/admin';
export function AdminDrones() {
  const [drones, setDrones] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDrone, setEditingDrone] = useState(null);

  const [formData, setFormData] = useState({
    model: '',
    capacity: 2
  });

  const [editFormData, setEditFormData] = useState({
    model: '',
    capacity: 2
  });

  const { showToast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [dronesData, restaurantsData] = await Promise.all([
        getDrones(),
        getRestaurants()
      ]);
      setDrones(dronesData);
      setRestaurants(restaurantsData);
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
      await createDrone(formData);
      showToast('Thêm drone thành công', 'success');
      setIsModalOpen(false);
      fetchData();
      setFormData({
        model: '',
        capacity: 2
      });
    } catch (error) {
      showToast('Lỗi khi thêm drone', 'error');
    }
  };

  const handleEdit = (drone) => {
    setEditingDrone(drone);
    setEditFormData({
      model: drone.model,
      capacity: drone.capacity
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateDrone(editingDrone.drone_id, editFormData);
      showToast('Cập nhật drone thành công', 'success');
      setIsEditModalOpen(false);
      setEditingDrone(null);
      fetchData();
    } catch (error) {
      showToast('Lỗi khi cập nhật drone', 'error');
    }
  };

  const handleDelete = async (droneId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa drone này?')) {
      return;
    }

    try {
      await deleteDrone(droneId);
      showToast('Xóa drone thành công', 'success');
      fetchData();
    } catch (error) {
      showToast('Lỗi khi xóa drone', 'error');
    }
  };


  const columns = [
    { key: 'drone_id', header: 'ID', sortable: true },
    { key: 'model', header: 'Model', sortable: true },
    {
      key: 'is_available',
      header: 'Khả dụng',
      render: (d) => (
        <span className={`font-medium ${d.is_available ? 'text-green-600' : 'text-red-600'}`}>
          {d.is_available ? '✓ Có thể sử dụng' : '✗ Đang bận'}
        </span>
      )
    },
    {
      key: 'capacity',
      header: 'Sức chứa',
      render: (d) => `${d.capacity} kg`
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (d) => (
        <Badge 
          status={d.status} 
          type="drone" 
        />
      )
    },
    {
      key: 'actions',
      header: 'Thao tác',
      render: (d) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(d);
            }}
            className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-1"
            title="Sửa drone"
          >
            <Edit size={14} />
            Sửa
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(d.drone_id);
            }}
            disabled={!d.is_available}
            className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            title={d.is_available ? "Xóa drone" : "Không thể xóa drone đang bận"}
          >
            <Trash2 size={14} />
            Xóa
          </button>
        </div>
      )
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Drone</h1>
        <div className="bg-white rounded-2xl shadow-md h-64 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Quản lí Drone</h1>
          <p className="text-sm text-gray-600 mt-1">
            Thêm drone mới để tất cả nhà hàng có thể sử dụng. Giám sát trạng thái rảnh/bận & can thiệp khi cần.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#FF4D4F] text-white rounded-lg hover:bg-[#ff3739] transition-colors"
        >
          <Plus size={20} />
          Thêm drone
        </button>
      </div>

      <DataTable data={drones} columns={columns} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Thêm drone mới">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Lưu ý:</strong> Drone sẽ được thêm vào hệ thống và tất cả nhà hàng đều có thể sử dụng khi drone đang rảnh (IDLE). Trạng thái sẽ tự động cập nhật khi drone đang giao hàng (BUSY).
            </p>
          </div>
          <Input
            label="Model drone"
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            placeholder="VD: DJI Phantom 4, MQ-9 Reaper..."
            required
          />
          <Input
            label="Sức chứa tối đa (kg)"
            type="number"
            step="0.1"
            min="0.1"
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
            required
          />
          <button
            type="submit"
            className="w-full px-4 py-2 bg-[#FF4D4F] text-white rounded-lg hover:bg-[#ff3739] transition-colors"
          >
            Thêm drone
          </button>
        </form>
      </Modal>

      {/* Edit Drone Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingDrone(null);
        }} 
        title={`Sửa drone #${editingDrone?.drone_id}`}
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            label="Model drone"
            value={editFormData.model}
            onChange={(e) => setEditFormData({ ...editFormData, model: e.target.value })}
            placeholder="VD: DJI Phantom 4, MQ-9 Reaper..."
            required
          />
          <Input
            label="Sức chứa tối đa (kg)"
            type="number"
            step="0.1"
            min="0.1"
            value={editFormData.capacity}
            onChange={(e) => setEditFormData({ ...editFormData, capacity: Number(e.target.value) })}
            required
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Cập nhật
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingDrone(null);
              }}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Hủy
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
