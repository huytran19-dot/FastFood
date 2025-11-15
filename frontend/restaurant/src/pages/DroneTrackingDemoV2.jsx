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
  ArrowLeft,
  Key,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

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

export default function DroneTrackingDemoV2() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
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
  
  // OTP states
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [demoOtp, setDemoOtp] = useState(''); // For demo display
  
  // Return states
  const [showReturnButton, setShowReturnButton] = useState(false);
  const [isReturning, setIsReturning] = useState(false);

  const droneId = 1; // Default drone ID for demo

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map('drone-demo-map-v2').setView([10.8231, 106.6297], 13);
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

    socket.on('drone:update', (payload) => {
      console.log('📡 Drone update:', payload);
      handleDroneUpdate(payload);
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
    if (payload.phase === 'TO_CUSTOMER' || payload.phase === 'RETURNING') {
      setPath(prev => [...prev, { lat: payload.lat, lng: payload.lng }]);
    }

    // Update drone marker on map
    if (mapRef.current) {
      if (droneMarkerRef.current) {
        droneMarkerRef.current.setLatLng([payload.lat, payload.lng]);
      } else {
        droneMarkerRef.current = L.marker([payload.lat, payload.lng], { icon: droneIcon })
          .addTo(mapRef.current)
          .bindPopup('🚁 Drone');
      }

      // Update path line
      if (path.length > 1) {
        const pathCoords = path.map(p => [p.lat, p.lng]);
        
        if (pathLineRef.current) {
          pathLineRef.current.setLatLngs(pathCoords);
        } else {
          pathLineRef.current = L.polyline(pathCoords, {
            color: payload.phase === 'RETURNING' ? 'blue' : 'red',
            weight: 3,
            opacity: 0.7
          }).addTo(mapRef.current);
        }
      }
    }

    // Handle different phases
    if (payload.phase === 'TO_CUSTOMER') {
      if (payload.progress < 30) {
        updateTimeline('🚁 Drone đang cất cánh...', true);
      } else if (payload.progress < 70) {
        updateTimeline('✈️ Drone đang bay đến khách hàng...', true);
      } else if (payload.progress < 95) {
        updateTimeline('🛬 Drone đang hạ cánh...', true);
      }
    } else if (payload.phase === 'WAITING_OTP') {
      updateTimeline('📍 Drone đã đến - Chờ khách nhập mã OTP', true);
      setShowOtpModal(true);
      setIsSimulationRunning(false);
    } else if (payload.phase === 'RETURNING') {
      updateTimeline('🔙 Drone đang quay về nhà hàng...', true);
      setIsReturning(true);
      if (pathLineRef.current) {
        pathLineRef.current.setStyle({ color: 'blue' }); // Change color for return
      }
    } else if (payload.phase === 'AT_RESTAURANT') {
      updateTimeline('✅ Drone đã về đến nhà hàng - Rảnh', true);
      setIsReturning(false);
      toast({
        title: "Hoàn thành!",
        description: "Drone đã quay về nhà hàng thành công",
      });
    }
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
      setPath([]); // Reset path
      
      const response = await fetch('http://localhost:5000/api/drone/demo-start-v2', {
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

      console.log('🚀 Simulation V2 started:', data);
      
      setRouteInfo(data.data.route);
      setIsSimulationRunning(true);
      setDemoOtp(data.data.otp); // Save OTP for demo display
      setShowReturnButton(false);
      setShowOtpModal(false);
      
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

        // Fit bounds
        const bounds = L.latLngBounds([
          [start.lat, start.lng],
          [end.lat, end.lng]
        ]);
        mapRef.current.fitBounds(bounds.pad(0.2));
      }

      // Update timeline
      setTimeline([
        { time: new Date(), text: '✓ Đơn hàng đã được xác nhận', completed: true },
        { time: new Date(), text: '🔑 Mã OTP đã được tạo', completed: true },
        { time: new Date(), text: 'Drone đang cất cánh...', completed: false }
      ]);

      toast({
        title: "Bắt đầu giao hàng!",
        description: `Mã OTP: ${data.data.otp} (Lưu lại để nhập sau)`,
        duration: 10000,
      });

    } catch (error) {
      console.error('Error starting simulation:', error);
      setError(error.message);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.message,
      });
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    try {
      setOtpError('');
      setIsVerifying(true);

      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ otp: otpInput })
      });

      const data = await response.json();

      if (!data.success) {
        setOtpError(data.message);
        setIsVerifying(false);
        return;
      }

      console.log('✅ OTP verified:', data);
      
      setShowOtpModal(false);
      setShowReturnButton(true);
      updateTimeline('✅ Xác nhận OTP thành công - Đã giao hàng!', true);
      
      toast({
        title: "Thành công!",
        description: "Đơn hàng đã được giao thành công",
      });

    } catch (error) {
      console.error('Error verifying OTP:', error);
      setOtpError(error.message);
    } finally {
      setIsVerifying(false);
    }
  };

  // Return to restaurant
  const handleReturnToRestaurant = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/drone/${droneId}/return-to-restaurant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderId })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      console.log('🔙 Return started:', data);
      
      setShowReturnButton(false);
      setPath([]); // Reset path for return journey
      
      toast({
        title: "Quay về nhà hàng",
        description: "Drone đang bay về nhà hàng",
      });

    } catch (error) {
      console.error('Error starting return:', error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.message,
      });
    }
  };

  // Format helpers
  const formatETA = (etaMs) => {
    if (!etaMs) return '0s';
    const seconds = Math.ceil(etaMs / 1000);
    return `${seconds}s`;
  };

  const formatDistance = (meters) => {
    if (!meters) return '0m';
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)}km`;
    }
    return `${Math.round(meters)}m`;
  };

  const getPhaseLabel = (phase) => {
    const labels = {
      'TO_CUSTOMER': '🚁 Đang bay đến khách hàng',
      'WAITING_OTP': '⏸️ Chờ nhập OTP',
      'RETURNING': '🔙 Đang quay về nhà hàng',
      'AT_RESTAURANT': '✅ Đã về nhà hàng',
      'COMPLETED_WAITING_RETURN': '✅ Đã giao - Chờ quay về'
    };
    return labels[phase] || phase;
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
                  🚁 Demo Drone với OTP
                </h1>
                <p className="text-sm text-gray-600">Đơn hàng #{orderId}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isSimulationRunning && !showReturnButton && !isReturning ? (
                <Button
                  onClick={handleStartSimulation}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Bắt đầu Giao Hàng
                </Button>
              ) : showReturnButton ? (
                <Button
                  onClick={handleReturnToRestaurant}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Quay về Nhà Hàng
                </Button>
              ) : (
                <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium">
                  {isReturning ? '🔙 Đang quay về...' : '🚁 Đang bay...'}
                </div>
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
                  {droneState && (
                    <span className="ml-auto text-sm font-normal text-gray-600">
                      {getPhaseLabel(droneState.phase)}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  id="drone-demo-map-v2" 
                  className="w-full rounded-lg border border-gray-300"
                  style={{ height: '500px' }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Status Panel - Right side (1/3 width) */}
          <div className="space-y-4">
            
            {/* Demo OTP Display */}
            {demoOtp && !showReturnButton && (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="text-lg text-orange-800">
                    <Key className="inline h-5 w-5 mr-2" />
                    Mã OTP (DEMO)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 tracking-wider">
                      {demoOtp}
                    </div>
                    <p className="text-sm text-orange-700 mt-2">
                      Nhập mã này khi drone đến nơi
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Status Cards */}
            {droneState && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Trạng thái</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Phase:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        droneState.phase === 'WAITING_OTP' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : droneState.phase === 'RETURNING'
                          ? 'bg-blue-100 text-blue-800'
                          : droneState.phase === 'AT_RESTAURANT'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {getPhaseLabel(droneState.phase)}
                      </span>
                    </div>
                    
                    {droneState.progress !== undefined && (
                      <>
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
                            className={`h-2 rounded-full transition-all duration-300 ${
                              droneState.phase === 'RETURNING' ? 'bg-blue-600' : 'bg-green-600'
                            }`}
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
                      </>
                    )}

                    <div className="pt-2 border-t">
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>Vị trí: {droneState.lat?.toFixed(6)}, {droneState.lng?.toFixed(6)}</div>
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

            {/* Instructions */}
            {!isSimulationRunning && !droneState && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Hướng dẫn</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2 text-sm text-gray-600">
                    <li>1. Nhấn <strong>"Bắt đầu Giao Hàng"</strong></li>
                    <li>2. Lưu lại <strong>mã OTP</strong> hiển thị</li>
                    <li>3. Drone bay đến khách (30s)</li>
                    <li>4. Nhập OTP để xác nhận nhận hàng</li>
                    <li>5. Nhấn "Quay về Nhà Hàng"</li>
                    <li>6. Drone quay về (20s)</li>
                    <li>7. Hoàn thành! Drone rảnh</li>
                  </ol>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-6 w-6 text-orange-600" />
                Nhập Mã OTP để Nhận Hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-4">
                <p className="text-gray-600 mb-4">
                  Drone đã đến nơi! Vui lòng nhập mã OTP để xác nhận nhận hàng.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-yellow-800">
                    💡 Mã OTP DEMO: <strong className="text-lg">{demoOtp}</strong>
                  </p>
                </div>
              </div>
              
              <div>
                <Label htmlFor="otp">Mã OTP (6 chữ số)</Label>
                <Input
                  id="otp"
                  type="text"
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => {
                    setOtpInput(e.target.value);
                    setOtpError('');
                  }}
                  placeholder="123456"
                  className="text-center text-2xl tracking-widest font-bold"
                />
                {otpError && (
                  <p className="text-sm text-red-600 mt-2">❌ {otpError}</p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowOtpModal(false)}
                  className="flex-1"
                  disabled={isVerifying}
                >
                  Đóng
                </Button>
                <Button
                  onClick={handleVerifyOtp}
                  disabled={!otpInput || isVerifying}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {isVerifying ? 'Đang xác nhận...' : 'Xác nhận'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
