import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation } from 'lucide-react';
import { droneAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

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
 * Calculate distance between two coordinates using Haversine formula
 */
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // km
};

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
  const socketRef = useRef(null); // Store Socket.IO connection
  const [dronePosition, setDronePosition] = useState(null);
  const [distance, setDistance] = useState(null);
  const [isTracking, setIsTracking] = useState(autoStart);
  const [droneStatus, setDroneStatus] = useState(null); // Phase from backend
  const hasLoggedWarningRef = useRef(false); // Only log "not available" once
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

      // Add initial drone marker at restaurant (will be updated by Socket.IO)
      if (restaurantLat && restaurantLng && autoStart) {
        console.log(`🚁 [Map] Adding initial drone marker at restaurant (${restaurantLat}, ${restaurantLng})`);
        droneMarkerRef.current = L.marker([restaurantLat, restaurantLng], {
          icon: droneIcon
        })
          .addTo(map)
          .bindPopup('<div class="text-sm"><div class="font-bold text-red-600">🚁 Drone</div><div class="text-xs">Đang chuẩn bị...</div></div>')
          .openPopup();
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
  // Socket.IO realtime tracking - SINGLE PERSISTENT connection
  useEffect(() => {
    if (!isTracking || !droneId) {
      // Cleanup if tracking stopped
      if (socketRef.current) {
        console.log(`🔌 [Map ${orderId}] Disconnecting Socket.IO (tracking stopped)`);
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Reuse existing connection if available
    if (socketRef.current && socketRef.current.connected) {
      console.log(`♻️ [Map ${orderId}] Reusing existing Socket.IO connection`);
      return;
    }

    console.log(`🔌 [Map ${orderId}] Creating new Socket.IO connection for drone ${droneId}`);
    
    try {
      const socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
      });

      socketRef.current = socket;

      // Listen for drone position updates
      const handleDroneUpdate = (data) => {
        console.log(`📡 [Map ${orderId}] Received drone update:`, data);
        
        // Only process updates for THIS drone
        if (data.droneId !== droneId && data.droneId !== String(droneId)) {
          console.log(`⏭️ [Map ${orderId}] Skipping update for different drone (expected: ${droneId}, got: ${data.droneId})`);
          return;
        }
        
        const { lat, lng, phase, progress, distanceRemaining } = data;
        
        if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
          console.log(`✅ [Map ${orderId}] Updating drone position: (${lat.toFixed(6)}, ${lng.toFixed(6)}) - Progress: ${progress?.toFixed(1)}%`);
          setDronePosition({ lat, lng });
          setDroneStatus(phase);
          
          // Update drone marker
          if (droneMarkerRef.current && mapRef.current) {
            console.log(`🚁 [Map ${orderId}] Moving existing drone marker`);
            droneMarkerRef.current.setLatLng([lat, lng]);
            droneMarkerRef.current.setPopupContent(
              `<div class="text-sm">
                <div class="font-bold text-red-600">🚁 Drone</div>
                <div class="text-xs">Tiến độ: ${progress?.toFixed(1) || 0}%</div>
                <div class="text-xs">Còn: ${(distanceRemaining/1000)?.toFixed(2) || 0} km</div>
              </div>`
            );
          } else if (mapRef.current) {
            console.log(`🚁 [Map ${orderId}] Creating new drone marker`);
            // Create drone marker if not exists
            droneMarkerRef.current = L.marker([lat, lng], { icon: droneIcon })
              .addTo(mapRef.current)
              .bindPopup(
                `<div class="text-sm">
                  <div class="font-bold text-red-600">🚁 Drone</div>
                  <div class="text-xs">Tiến độ: ${progress?.toFixed(1) || 0}%</div>
                  <div class="text-xs">Còn: ${(distanceRemaining/1000)?.toFixed(2) || 0} km</div>
                </div>`
              )
              .openPopup();
          } else {
            console.warn(`⚠️ [Map ${orderId}] Cannot update drone marker - map not initialized!`);
          }
          
          // Update distance
          if (destinationLat && destinationLng) {
            const dist = calculateDistance(lat, lng, destinationLat, destinationLng);
            setDistance(dist);
            onDistanceUpdate?.(dist);
          }
          
          // Update route line from current drone position to destination
          if (routeLineRef.current && mapRef.current) {
            mapRef.current.removeLayer(routeLineRef.current);
          }
          if (destinationLat && destinationLng && mapRef.current) {
            routeLineRef.current = L.polyline(
              [[lat, lng], [destinationLat, destinationLng]],
              { color: '#ef4444', weight: 3, dashArray: '5, 10', opacity: 0.8 }
            ).addTo(mapRef.current);
          }
        } else {
          console.warn(`⚠️ [Map ${orderId}] Invalid coordinates in update:`, { lat, lng });
        }
      };

      socket.on('drone:update', handleDroneUpdate);

      socket.on('connect', () => {
        console.log(`✅ [Map ${orderId}] Socket.IO connected - ID: ${socket.id}`);
        // Join drone room to receive position updates
        socket.emit('join:drone', droneId);
        console.log(`🚁 [Map ${orderId}] Joined drone room: drone:${droneId}`);
      });

      socket.on('joined:drone', (data) => {
        console.log(`✅ [Map ${orderId}] Confirmed joined room:`, data);
      });

      socket.on('connect_error', (error) => {
        console.error(`❌ [Map ${orderId}] Socket.IO connection error:`, error.message);
      });

      socket.on('disconnect', (reason) => {
        console.log(`🔌 [Map ${orderId}] Socket.IO disconnected: ${reason}`);
      });

    } catch (error) {
      console.error(`❌ [Map ${orderId}] Socket.IO setup error:`, error);
    }

    return () => {
      // Cleanup on unmount
      if (socketRef.current) {
        console.log(`🔌 [Map ${orderId}] Component unmounting - disconnecting Socket.IO`);
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isTracking, droneId, orderId, destinationLat, destinationLng]);

  // Auto start tracking
  useEffect(() => {
    if (autoStart) {
      setIsTracking(true);
    }
  }, [autoStart]);

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

    </div>
  );
}
