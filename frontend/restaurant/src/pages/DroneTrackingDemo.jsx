import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { io } from 'socket.io-client';
import { 
  Play, 
  Square, 
  MapPin, 
  Navigation, 
  Clock, 
  TrendingUp,
  Package,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom icons
const restaurantIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const customerIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const droneIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function DroneTrackingDemo() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  const mapRef = useRef(null);
  const restaurantMarkerRef = useRef(null);
  const customerMarkerRef = useRef(null);
  const droneMarkerRef = useRef(null);
  const pathLineRef = useRef(null);
  const socketRef = useRef(null);
  
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [droneState, setDroneState] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [path, setPath] = useState([]);
  const [error, setError] = useState(null);
  const [timeline, setTimeline] = useState([
    { time: null, text: 'Chuẩn bị khởi tạo...', completed: false }
  ]);

  const droneId = 1; // Default drone ID for demo

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map('drone-demo-map').setView([10.8231, 106.6297], 13);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Initialize Socket.IO
  useEffect(() => {
    const socket = io('http://localhost:5000', {
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Socket.IO connected:', socket.id);
      socket.emit('join:drone', droneId);
    });

    socket.on('joined:drone', (data) => {
      console.log('🚁 Joined drone room:', data);
    });

    socket.on('drone:update', (payload) => {
      console.log('📡 Drone update:', payload);
      handleDroneUpdate(payload);
    });

    socket.on('drone:completed', (payload) => {
      console.log('✅ Drone completed:', payload);
      handleDroneCompleted(payload);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket.IO disconnected');
    });

    return () => {
      socket.emit('leave:drone', droneId);
      socket.disconnect();
    };
  }, [droneId]);

  // Handle drone update from Socket.IO
  const handleDroneUpdate = (payload) => {
    setDroneState(payload);
    
    // Update path
    setPath(prev => [...prev, { lat: payload.lat, lng: payload.lng }]);

    // Update drone marker on map
    if (mapRef.current) {
      if (droneMarkerRef.current) {
        droneMarkerRef.current.setLatLng([payload.lat, payload.lng]);
      } else {
        droneMarkerRef.current = L.marker([payload.lat, payload.lng], { icon: droneIcon })
          .addTo(mapRef.current)
          .bindPopup('🚁 Drone đang bay');
      }

      // Update path line
      if (path.length > 0 || payload.path) {
        const pathCoords = payload.path ? payload.path.map(p => [p.lat, p.lng]) : path.map(p => [p.lat, p.lng]);
        
        if (pathLineRef.current) {
          pathLineRef.current.setLatLngs(pathCoords);
        } else {
          pathLineRef.current = L.polyline(pathCoords, {
            color: 'red',
            weight: 3,
            opacity: 0.7
          }).addTo(mapRef.current);
        }
      }
    }

    // Update timeline based on progress
    if (payload.progress < 30) {
      updateTimeline('Drone đang cất cánh...', true);
    } else if (payload.progress < 70) {
      updateTimeline('Drone đang bay đến điểm giao hàng...', true);
    } else if (payload.progress < 95) {
      updateTimeline('Drone đang hạ cánh...', true);
    }
  };

  // Handle drone completion
  const handleDroneCompleted = (payload) => {
    setDroneState(payload);
    setIsSimulationRunning(false);
    updateTimeline(`✅ Đã giao hàng thành công lúc ${new Date().toLocaleTimeString('vi-VN')}`, true);
  };

  // Update timeline
  const updateTimeline = (text, completed) => {
    setTimeline(prev => {
      const exists = prev.find(item => item.text === text);
      if (exists) {
        return prev.map(item => 
          item.text === text ? { ...item, completed, time: new Date() } : item
        );
      } else {
        return [...prev, { time: new Date(), text, completed }];
      }
    });
  };

  // Start simulation
  const handleStartSimulation = async () => {
    try {
      setError(null);
      const response = await fetch('http://localhost:5000/api/drone/demo-start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderId, droneId })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      console.log('🚀 Simulation started:', data);
      
      setRouteInfo(data.data.route);
      setIsSimulationRunning(true);
      setPath([]);
      
      // Clear previous markers and lines
      if (droneMarkerRef.current) {
        droneMarkerRef.current.remove();
        droneMarkerRef.current = null;
      }
      if (pathLineRef.current) {
        pathLineRef.current.remove();
        pathLineRef.current = null;
      }

      // Add restaurant and customer markers
      if (mapRef.current && data.data.route) {
        const { start, end } = data.data.route;

        if (restaurantMarkerRef.current) {
          restaurantMarkerRef.current.remove();
        }
        restaurantMarkerRef.current = L.marker([start.lat, start.lng], { icon: restaurantIcon })
          .addTo(mapRef.current)
          .bindPopup(`🏪 ${start.name}`);

        if (customerMarkerRef.current) {
          customerMarkerRef.current.remove();
        }
        customerMarkerRef.current = L.marker([end.lat, end.lng], { icon: customerIcon })
          .addTo(mapRef.current)
          .bindPopup(`📍 ${end.address}`);

        // Fit bounds to show both markers
        const bounds = L.latLngBounds([
          [start.lat, start.lng],
          [end.lat, end.lng]
        ]);
        mapRef.current.fitBounds(bounds.pad(0.2));
      }

      // Update timeline
      setTimeline([
        { time: new Date(), text: '✓ Đơn hàng đã được xác nhận', completed: true },
        { time: new Date(), text: 'Drone đang cất cánh...', completed: false }
      ]);

    } catch (error) {
      console.error('Error starting simulation:', error);
      setError(error.message);
    }
  };

  // Stop simulation
  const handleStopSimulation = async () => {
    try {
      await fetch(`http://localhost:5000/api/drone/${droneId}/stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderId })
      });

      setIsSimulationRunning(false);
      updateTimeline('Đã dừng simulation', true);
    } catch (error) {
      console.error('Error stopping simulation:', error);
    }
  };

  // Format time
  const formatETA = (etaMs) => {
    if (!etaMs) return '0s';
    const seconds = Math.ceil(etaMs / 1000);
    return `${seconds}s`;
  };

  // Format distance
  const formatDistance = (meters) => {
    if (!meters) return '0m';
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)}km`;
    }
    return `${Math.round(meters)}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  🚁 Demo Drone Tracking
                </h1>
                <p className="text-sm text-gray-600">Đơn hàng #{orderId}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isSimulationRunning ? (
                <Button
                  onClick={handleStartSimulation}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Bắt đầu Simulation
                </Button>
              ) : (
                <Button
                  onClick={handleStopSimulation}
                  variant="destructive"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Dừng Simulation
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            ❌ {error}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Map - Left side (2/3 width) */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Bản đồ Theo dõi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  id="drone-demo-map" 
                  className="w-full rounded-lg border border-gray-300"
                  style={{ height: '500px' }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Status Panel - Right side (1/3 width) */}
          <div className="space-y-4">
            
            {/* Status Cards */}
            {droneState && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Trạng thái</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        droneState.status === 'DELIVERED' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {droneState.status === 'DELIVERED' ? '✅ Đã giao' : '🚁 Đang bay'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        <TrendingUp className="inline h-4 w-4 mr-1" />
                        Tiến độ:
                      </span>
                      <span className="font-semibold text-blue-600">
                        {droneState.progress.toFixed(1)}%
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${droneState.progress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        <Navigation className="inline h-4 w-4 mr-1" />
                        Khoảng cách:
                      </span>
                      <span className="font-semibold">
                        {formatDistance(droneState.distanceRemaining)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        <Clock className="inline h-4 w-4 mr-1" />
                        ETA:
                      </span>
                      <span className="font-semibold text-orange-600">
                        {formatETA(droneState.etaMs)}
                      </span>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>Vị trí: {droneState.lat.toFixed(6)}, {droneState.lng.toFixed(6)}</div>
                        <div>Đã bay: {formatDistance(droneState.distanceTraveled)}</div>
                        <div>Tổng quãng đường: {formatDistance(droneState.totalDistance)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      <Package className="inline h-5 w-5 mr-2" />
                      Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {timeline.map((event, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className={`mt-1 rounded-full p-1 ${
                            event.completed ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                            {event.completed ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <Clock className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm ${
                              event.completed ? 'text-gray-900 font-medium' : 'text-gray-500'
                            }`}>
                              {event.text}
                            </p>
                            {event.time && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                {event.time.toLocaleTimeString('vi-VN')}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Instructions (shown when not running) */}
            {!isSimulationRunning && !droneState && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Hướng dẫn</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2 text-sm text-gray-600">
                    <li>1. Nhấn nút <strong>"Bắt đầu Simulation"</strong></li>
                    <li>2. Drone sẽ bay từ nhà hàng đến khách trong 30 giây</li>
                    <li>3. Quan sát vị trí real-time trên bản đồ</li>
                    <li>4. Xem tiến độ, khoảng cách và ETA</li>
                    <li>5. Khi đến nơi, trạng thái sẽ chuyển sang "Đã giao"</li>
                  </ol>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

