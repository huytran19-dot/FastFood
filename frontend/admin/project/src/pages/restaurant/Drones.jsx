import { useEffect, useState } from 'react';
import { DataTable } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { MapPlaceholder } from '../../components/map/MapPlaceholder';
import { useAuth } from '../../auth/AuthContext';
import { getMyRestaurant, getDronesByRestaurant } from '../../api/restaurant';
export function RestaurantDrones() {
  const { user_id } = useAuth();
  const [drones, setDrones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [simulatingDrone, setSimulatingDrone] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const fetchData = async () => {
    if (!user_id) return;

    setIsLoading(true);
    try {
      const restaurant = await getMyRestaurant(user_id);
      const dronesData = await getDronesByRestaurant(restaurant.restaurant_id);
      setDrones(dronesData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user_id]);

  const handleSimulateFlight = (drone) => {
    setSimulatingDrone(drone);
    setIsSimulating(true);
  };

  const columns = [
    { key: 'drone_id', header: 'ID', sortable: true },
    { key: 'model', header: 'Model' },
    {
      key: 'battery',
      header: 'Pin',
      render: (d) => {
        const batteryClass = d.battery && d.battery < 20 ? 'text-red-600 font-semibold' : '';
        return <span className={batteryClass}>{d.battery}%</span>;
      },
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
      key: 'actions',
      header: 'Thao tác',
      render: (d) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSimulateFlight(d);
          }}
          className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
        >
          Mô phỏng bay
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
      <h1 className="text-2xl font-semibold text-gray-900">Drone</h1>

      <DataTable data={drones} columns={columns} />

      <Modal
        isOpen={!!simulatingDrone}
        onClose={() => {
          setSimulatingDrone(null);
          setIsSimulating(false);
        }}
        title={`Mô phỏng Drone #${simulatingDrone?.drone_id}`}
        size="lg"
      >
        {simulatingDrone && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Model</p>
                <p className="font-medium text-gray-900">{simulatingDrone.model}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pin</p>
                <p className="font-medium text-gray-900">{simulatingDrone.battery}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Sức chứa</p>
                <p className="font-medium text-gray-900">{simulatingDrone.capacity} kg</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Trạng thái</p>
                <Badge status={simulatingDrone.status} type="drone" />
              </div>
            </div>

            <MapPlaceholder
              startLocation="123 Trần Hưng Đạo, Q1"
              endLocation="88 Lê Lợi, Q1"
              isAnimating={isSimulating}
            />

            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                isSimulating
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-[#00B8A9] hover:bg-[#009688] text-white'
              }`}
            >
              {isSimulating ? 'Dừng mô phỏng' : 'Bắt đầu mô phỏng'}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
