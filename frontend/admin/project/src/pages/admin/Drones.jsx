import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { DataTable } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/FormControls';
import { useToast } from '../../components/ui/Toast';
import { getDrones, createDrone, updateDrone, getRestaurants } from '../../api/admin';
export function AdminDrones() {
  const [drones, setDrones] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    restaurant_id: 1,
    model: '',
    capacity: 2,
    battery: 100,
    status: 'IDLE'
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
        restaurant_id: 1,
        model: '',
        capacity: 2,
        battery: 100,
        status: 'IDLE'
      });
    } catch (error) {
      showToast('Lỗi khi thêm drone', 'error');
    }
  };

  const handleSetIdle = async (droneId) => {
    try {
      await updateDrone(droneId, { status: 'IDLE' });
      showToast('Đã đặt drone về IDLE', 'success');
      fetchData();
    } catch (error) {
      showToast('Lỗi khi cập nhật drone', 'error');
    }
  };

  const getRestaurantName = (restaurantId) => {
    return restaurants.find(r => r.restaurant_id === restaurantId)?.name || 'N/A';
  };

  const columns = [
    { key: 'drone_id', header: 'ID', sortable: true },
    { key: 'model', header: 'Model', sortable: true },
    {
      key: 'restaurant_id',
      header: 'Nhà hàng được gán',
      render: (d) => (
        <span className="font-medium text-gray-900">
          {getRestaurantName(d.restaurant_id)}
        </span>
      )
    },
    {
      key: 'capacity',
      header: 'Sức chứa',
      render: (d) => `${d.capacity} kg`
    },
    {
      key: 'battery',
      header: 'Pin',
      render: (d) => (
        <div className="flex items-center gap-2">
          <div className="w-20 bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                d.battery >= 80 ? 'bg-green-600' :
                d.battery >= 50 ? 'bg-yellow-600' :
                d.battery >= 20 ? 'bg-orange-600' : 'bg-red-600'
              }`}
              style={{ width: `${d.battery}%` }}
            />
          </div>
          <span className={`text-sm font-medium ${d.battery < 20 ? 'text-red-600' : 'text-gray-700'}`}>
            {d.battery}%
          </span>
        </div>
      ),
      sortable: true
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (d) => <Badge status={d.status} type="drone" />
    },
    {
      key: 'actions',
      header: 'Can thiệp',
      render: (d) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSetIdle(d.drone_id);
          }}
          disabled={d.status === 'IDLE'}
          className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Buộc drone về trạng thái nghỉ"
        >
          Đặt IDLE
        </button>
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
            Thêm drone mới và gán cho nhà hàng. Giám sát & can thiệp khi cần.
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
              💡 <strong>Lưu ý:</strong> Drone sẽ được gán cho nhà hàng bạn chọn. Nhà hàng đó sẽ sử dụng drone này để giao hàng.
            </p>
          </div>
          
          <Select
            label="Gán cho nhà hàng"
            value={formData.restaurant_id}
            onChange={(e) => setFormData({ ...formData, restaurant_id: Number(e.target.value) })}
            options={restaurants.map(r => ({ value: r.restaurant_id, label: r.name }))}
            required
          />
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
          <Input
            label="Mức pin hiện tại (%)"
            type="number"
            min="0"
            max="100"
            value={formData.battery}
            onChange={(e) => setFormData({ ...formData, battery: Number(e.target.value) })}
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
    </div>
  );
}
