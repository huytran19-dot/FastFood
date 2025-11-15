import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, KeyRound, ArrowLeftCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { droneAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom drone icon
const droneIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const restaurantIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const destinationIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

/**
 * DroneTrackingMap - Real-time drone tracking with OTP verification
 */
export default function DroneTrackingMap({ 
  droneId, 
  orderId,
  onDistanceUpdate,
  restaurantLat,
  restaurantLng,
  destinationLat,
  destinationLng,
  autoStart = false
}) {
  const mapRef = useRef(null);
  const restaurantMarkerRef = useRef(null);
  const droneMarkerRef = useRef(null);
  const routeLineRef = useRef(null);
  const destinationMarkerRef = useRef(null);
  const [dronePosition, setDronePosition] = useState(null);
  const [distance, setDistance] = useState(null);
  const [isTracking, setIsTracking] = useState(autoStart);
  const [droneStatus, setDroneStatus] = useState(null); // Phase from backend
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [deliveryCompleted, setDeliveryCompleted] = useState(false);
  const pollingIntervalRef = useRef(null);
  const { toast } = useToast();

  // Initialize map
  useEffect(() => {
    console.log(`🗺️ [Map Init] Order ${orderId}:`, {
      restaurantLat, restaurantLng,
      destinationLat, destinationLng
    });

    if (!mapRef.current) {
      const map = L.map(`drone-tracking-map-${orderId}`, {
        zoomControl: true
      }).setView([10.8231, 106.6297], 13);
      mapRef.current = map;

      // Set z-index for map container
      const mapContainer = map.getContainer();
      if (mapContainer) {
        mapContainer.style.zIndex = '1';
      }

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      // Add restaurant marker (start point - blue)
      if (restaurantLat && restaurantLng) {
        console.log(`🏪 [Map] Adding restaurant marker at (${restaurantLat}, ${restaurantLng})`);
        restaurantMarkerRef.current = L.marker([restaurantLat, restaurantLng], {
          icon: restaurantIcon
        })
          .addTo(map)
          .bindPopup('🏪 Nhà hàng (Điểm bắt đầu)');
      } else {
        console.warn('⚠️ [Map] No restaurant coordinates!');
      }

      // Add destination marker (end point - green)
      if (destinationLat && destinationLng) {
        console.log(`📍 [Map] Adding destination marker at (${destinationLat}, ${destinationLng})`);
        destinationMarkerRef.current = L.marker([destinationLat, destinationLng], {
          icon: destinationIcon
        })
          .addTo(map)
          .bindPopup('📍 Địa chỉ giao hàng');
      } else {
        console.warn('⚠️ [Map] No destination coordinates!');
      }

      // Draw route line between restaurant and destination
      if (restaurantLat && restaurantLng && destinationLat && destinationLng) {
        routeLineRef.current = L.polyline(
          [[restaurantLat, restaurantLng], [destinationLat, destinationLng]],
          { color: '#3b82f6', weight: 3, dashArray: '10, 10', opacity: 0.6 }
        ).addTo(map);

        // Calculate and display distance
        const R = 6371; // Earth radius in km
        const dLat = (destinationLat - restaurantLat) * Math.PI / 180;
        const dLng = (destinationLng - restaurantLng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(restaurantLat * Math.PI / 180) * Math.cos(destinationLat * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const totalDistance = R * c;
        
        console.log(`📏 [Map] Total distance: ${totalDistance.toFixed(2)} km`);
        setDistance(totalDistance);
        onDistanceUpdate?.(totalDistance);
      }

      // Fit bounds to show all markers
      const bounds = [];
      if (restaurantLat && restaurantLng) bounds.push([restaurantLat, restaurantLng]);
      if (destinationLat && destinationLng) bounds.push([destinationLat, destinationLng]);
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [orderId, restaurantLat, restaurantLng, destinationLat, destinationLng]);

  // Fetch drone position and status
  const fetchPosition = async () => {
    try {
      const response = await droneAPI.getDronePosition(droneId);
      
      if (response.success && response.data?.position) {
        const pos = response.data.position;
        setDronePosition({ lat: pos.lat, lng: pos.lng });
        setDroneStatus(response.data.status || response.data.phase);

        // Update drone marker
        if (mapRef.current) {
          if (droneMarkerRef.current) {
            droneMarkerRef.current.setLatLng([pos.lat, pos.lng]);
          } else {
            droneMarkerRef.current = L.marker([pos.lat, pos.lng], { icon: droneIcon })
              .addTo(mapRef.current)
              .bindPopup('🚁 Drone');
          }

          // Update route line to show drone path to destination
          if (destinationMarkerRef.current && pos.lat && pos.lng) {
            const destLatLng = destinationMarkerRef.current.getLatLng();
            
            // Remove old route line
            if (routeLineRef.current) {
              routeLineRef.current.remove();
            }
            
            // Draw new route: restaurant -> drone (completed, solid blue)
            //                 drone -> destination (remaining, dashed red)
            if (restaurantMarkerRef.current) {
              const restLatLng = restaurantMarkerRef.current.getLatLng();
              
              // Completed path (restaurant to drone) - solid blue
              L.polyline(
                [[restLatLng.lat, restLatLng.lng], [pos.lat, pos.lng]],
                { color: '#10b981', weight: 3, opacity: 0.8 }
              ).addTo(mapRef.current);
            }
            
            // Remaining path (drone to destination) - dashed red
            routeLineRef.current = L.polyline(
              [[pos.lat, pos.lng], [destLatLng.lat, destLatLng.lng]],
              { color: '#ef4444', weight: 3, dashArray: '10, 10', opacity: 0.9 }
            ).addTo(mapRef.current);
            
            // Calculate remaining distance
            const R = 6371;
            const dLat = (destLatLng.lat - pos.lat) * Math.PI / 180;
            const dLng = (destLatLng.lng - pos.lng) * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                      Math.cos(pos.lat * Math.PI / 180) * Math.cos(destLatLng.lat * Math.PI / 180) *
                      Math.sin(dLng/2) * Math.sin(dLng/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            const remainingDist = R * c;
            
            setDistance(remainingDist);
            onDistanceUpdate?.(remainingDist);
          }

          // Fit bounds to show all markers
          if (droneMarkerRef.current && destinationMarkerRef.current) {
            const group = new L.featureGroup([droneMarkerRef.current, destinationMarkerRef.current]);
            mapRef.current.fitBounds(group.getBounds().pad(0.1));
          }
        }
      }
    } catch (error) {
      console.warn(`⚠️ [Order ${orderId}] Drone position not available`);
    }
  };

  // Start/stop tracking
  useEffect(() => {
    if (isTracking && droneId) {
      fetchPosition(); // Fetch immediately
      pollingIntervalRef.current = setInterval(fetchPosition, 2000); // Poll every 2s
    } else {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [isTracking, droneId, orderId]);

  // Auto start tracking
  useEffect(() => {
    if (autoStart) {
      setIsTracking(true);
    }
  }, [autoStart]);

  // Handle OTP verification
  const handleVerifyOTP = async () => {
    if (!otp || otp.trim().length === 0) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Vui lòng nhập mã OTP',
      });
      return;
    }

    setIsVerifying(true);
    try {
      const response = await droneAPI.verifyOTP(orderId, otp.trim());
      if (response.success) {
        toast({
          variant: 'default',
          title: 'Thành công',
          description: 'Xác nhận OTP thành công! Đơn hàng đã được giao.',
        });
        setDeliveryCompleted(true);
        setOtp('');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.message || 'Mã OTP không đúng',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle drone return
  const handleReturnDrone = async () => {
    setIsReturning(true);
    try {
      const response = await droneAPI.returnDrone(droneId, orderId);
      if (response.success) {
        toast({
          variant: 'default',
          title: 'Thành công',
          description: 'Drone đang quay về nhà hàng',
        });
        // Continue tracking to see drone return
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.message || 'Không thể gọi drone quay về',
      });
    } finally {
      setIsReturning(false);
    }
  };

  // Get status color and label
  const getStatusDisplay = () => {
    if (droneStatus === 'DELIVERING' || droneStatus === 'TO_CUSTOMER' || droneStatus === 'delivering') {
      return { color: 'blue', label: 'Đang bay tới khách' };
    }
    if (droneStatus === 'WAITING_OTP' || droneStatus === 'waiting_otp') {
      return { color: 'orange', label: 'Chờ xác nhận OTP' };
    }
    if (droneStatus === 'RETURNING' || droneStatus === 'returning') {
      return { color: 'purple', label: 'Đang quay về nhà hàng' };
    }
    if (droneStatus === 'idle' || droneStatus === 'AT_RESTAURANT') {
      return { color: 'green', label: 'Đã về nhà hàng - Rảnh' };
    }
    if (droneStatus === 'ready_to_return' || droneStatus === 'COMPLETED_WAITING_RETURN') {
      return { color: 'green', label: 'Đã giao hàng - Chờ quay về' };
    }
    return { color: 'gray', label: 'Không rõ trạng thái' };
  };

  const statusDisplay = getStatusDisplay();
  const showOTPForm = droneStatus === 'WAITING_OTP' || droneStatus === 'waiting_otp';
  const showReturnButton = (deliveryCompleted || droneStatus === 'ready_to_return' || droneStatus === 'COMPLETED_WAITING_RETURN') && !isReturning;

  return (
    <div className="space-y-3" style={{ position: 'relative', zIndex: 1 }}>
      {/* Status indicator */}
      {isTracking && droneStatus && (
        <div className={`mb-2 px-3 py-2 bg-${statusDisplay.color}-50 border border-${statusDisplay.color}-200 rounded-lg flex items-center gap-2`}>
          <div className={`w-2 h-2 bg-${statusDisplay.color}-600 rounded-full animate-pulse`}></div>
          <span className={`text-sm font-medium text-${statusDisplay.color}-800`}>
            🚁 {statusDisplay.label}
          </span>
        </div>
      )}
      
      {/* Map */}
      <div 
        id={`drone-tracking-map-${orderId}`} 
        className="w-full h-64 rounded-lg border border-gray-300"
        style={{ minHeight: '256px', position: 'relative', zIndex: 1 }}
      />
      
      {/* Position info */}
      {dronePosition && (
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded text-sm text-gray-700">
          <Navigation className="h-4 w-4 text-red-600" />
          <span className="font-medium">Vị trí:</span>
          <span className="font-mono text-xs">
            {dronePosition.lat.toFixed(6)}, {dronePosition.lng.toFixed(6)}
          </span>
        </div>
      )}

      {/* Distance info */}
      {distance !== null && (
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded text-sm text-blue-700">
          <MapPin className="h-4 w-4 text-blue-600" />
          <span className="font-medium">Khoảng cách:</span>
          <span className="font-bold">
            {distance < 1 
              ? `${(distance * 1000).toFixed(0)} m` 
              : `${distance.toFixed(2)} km`
            }
          </span>
          {dronePosition && (
            <span className="text-xs text-blue-600">(còn lại)</span>
          )}
        </div>
      )}

      {/* Distance info */}
      {distance !== null && (
        <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 rounded">
          <MapPin className="h-4 w-4 text-orange-600" />
          <span className="text-sm font-semibold text-orange-800">
            Khoảng cách: {distance.toFixed(2)} km
          </span>
        </div>
      )}

      {/* OTP Form - Show when drone arrived and waiting for OTP */}
      {showOTPForm && !deliveryCompleted && (
        <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg space-y-3">
          <div className="flex items-center gap-2 text-yellow-800 font-medium">
            <KeyRound className="h-5 w-5" />
            <span>Drone đã đến nơi! Vui lòng nhập OTP để xác nhận giao hàng</span>
          </div>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Nhập mã OTP (6 số)"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="flex-1"
              disabled={isVerifying}
            />
            <Button
              onClick={handleVerifyOTP}
              disabled={isVerifying || !otp}
              className="bg-green-600 hover:bg-green-700"
            >
              {isVerifying ? 'Đang xác nhận...' : 'Xác nhận OTP'}
            </Button>
          </div>
        </div>
      )}

      {/* Return Button - Show after OTP verified */}
      {showReturnButton && (
        <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg">
          <Button
            onClick={handleReturnDrone}
            disabled={isReturning}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            <ArrowLeftCircle className="h-4 w-4 mr-2" />
            {isReturning ? 'Đang gọi drone quay về...' : 'Gọi Drone Quay Về Nhà Hàng'}
          </Button>
        </div>
      )}
    </div>
  );
}
