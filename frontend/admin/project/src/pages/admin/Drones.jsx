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
    { key: 'model', header: 'Model' },
    {
      key: 'battery',
      header: 'Pin',
      render: (d) => (
        <span className={d.battery && d.battery < 20 ? 'text-red-600 font-semibold' : ''}>
          {d.battery}%
        </span>
      ),
      sortable: true
    },
    {
      key: 'capacity',
      header: 'Sức chứa',
      render: (d) => `${d.capacity} kg`
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (d) => <Badge status={d.status} type="drone" />
    },
    {
      key: 'restaurant_id',
      header: 'Nhà hàng',
      render: (d) => getRestaurantName(d.restaurant_id)
    },
    {
      key: 'actions',
      header: 'Thao tác',
      render: (d) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSetIdle(d.drone_id);
          }}
          className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
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
        <h1 className="text-2xl font-semibold text-gray-900">Drone</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#FF4D4F] text-white rounded-lg hover:bg-[#ff3739] transition-colors"
        >
          <Plus size={20} />
          Thêm drone
        </button>
      </div>

      <DataTable data={drones} columns={columns} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Thêm drone">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Nhà hàng"
            value={formData.restaurant_id}
            onChange={(e) => setFormData({ ...formData, restaurant_id: Number(e.target.value) })}
            options={restaurants.map(r => ({ value: r.restaurant_id, label: r.name }))}
          />
          <Input
            label="Model"
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            required
          />
          <Input
            label="Sức chứa (kg)"
            type="number"
            step="0.1"
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
            required
          />
          <Input
            label="Pin (%)"
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
