import { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon issue
if (typeof window !== 'undefined') {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

// Custom drone icon
const droneIcon = L.divIcon({
  className: 'custom-drone-marker',
  html: `
    <div style="
      width: 40px; 
      height: 40px; 
      background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
      border: 3px solid white;
    ">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
        <path d="M20.56 3.91C21.15 4.5 21.15 5.45 20.56 6.03L16.67 9.92L18.79 19.11L17.38 20.53L13.5 13.1L9.6 17L9.96 19.47L8.89 20.53L7.13 17.35L3.94 15.58L5 14.5L7.5 14.87L11.37 11L3.94 7.09L5.36 5.68L14.55 7.8L18.44 3.91C19.02 3.33 19.98 3.33 20.56 3.91Z"/>
      </svg>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

/**
 * DroneTrackingMap - Real-time drone position tracking for customers
 */
export function DroneTrackingMap({ 
  orderId,
  droneId,
  restaurantLat,
  restaurantLng,
  customerLat,
  customerLng,
  status,
  realtimePosition // Socket.IO real-time position updates
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const droneMarkerRef = useRef(null);
  const [dronePosition, setDronePosition] = useState(null);
  const [distance, setDistance] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Small delay to ensure DOM is fully ready
    const timer = setTimeout(() => {
      try {
        // Create map centered between restaurant and customer
        const centerLat = (parseFloat(restaurantLat) + parseFloat(customerLat)) / 2;
        const centerLng = (parseFloat(restaurantLng) + parseFloat(customerLng)) / 2;

        const map = L.map(mapRef.current, {
          zoomControl: true,
          scrollWheelZoom: true,
        }).setView([centerLat, centerLng], 14);

        mapInstanceRef.current = map;
        setMapReady(true);
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [restaurantLat, restaurantLng, customerLat, customerLng]);

  // Add map layers after map is ready
  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return;

    const map = mapInstanceRef.current;

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add restaurant marker
    L.marker([restaurantLat, restaurantLng], {
      icon: L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: 36px;
            height: 36px;
            background: #10b981;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
            border: 2px solid white;
          ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
            </svg>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      })
    }).addTo(map).bindPopup('Nhà hàng');

    // Add customer marker
    L.marker([customerLat, customerLng], {
      icon: L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: 36px;
            height: 36px;
            background: #3b82f6;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
            border: 2px solid white;
          ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      })
    }).addTo(map).bindPopup('Địa chỉ giao hàng');

    // Draw route line
    L.polyline(
      [[restaurantLat, restaurantLng], [customerLat, customerLng]],
      {
        color: '#f97316',
        weight: 3,
        opacity: 0.6,
        dashArray: '10, 10',
      }
    ).addTo(map);

    // Fit bounds to show both markers
    map.fitBounds([
      [restaurantLat, restaurantLng],
      [customerLat, customerLng]
    ], { padding: [50, 50] });

    // Force map to invalidate size after a short delay (fixes rendering issues)
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

  }, [mapReady, restaurantLat, restaurantLng, customerLat, customerLng]);

  // Update drone position from realtimePosition prop
  useEffect(() => {
    if (!realtimePosition) return;
    
    setDronePosition(realtimePosition);
    
    if (realtimePosition.distanceRemaining !== undefined) {
      setDistance(realtimePosition.distanceRemaining);
    }
  }, [realtimePosition]);

  // Poll drone position (fallback if no realtimePosition)
  useEffect(() => {
    // If we have realtime position from Socket.IO, skip polling
    if (realtimePosition) return;
    
    if (!droneId || !orderId) return;
    if (status !== 'DELIVERING' && status !== 'WAITING_OTP') return;

    const fetchDronePosition = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/drone/${droneId}/position?orderId=${orderId}`);
        const data = await response.json();
        
        if (data.success && data.data) {
          setDronePosition(data.data);
          
          if (data.data.distanceRemaining !== undefined) {
            setDistance(data.data.distanceRemaining);
          }
        }
      } catch (error) {
        console.error('Error fetching drone position:', error);
      }
    };

    fetchDronePosition();
    const interval = setInterval(fetchDronePosition, 2000); // Poll every 2s

    return () => clearInterval(interval);
  }, [droneId, orderId, status, realtimePosition]);

  // Update drone marker on map
  useEffect(() => {
    if (!dronePosition || !mapInstanceRef.current) return;

    const { lat, lng } = dronePosition;
    
    // Validate coordinates
    if (!lat || !lng || isNaN(parseFloat(lat)) || isNaN(parseFloat(lng))) {
      return;
    }

    try {
      if (droneMarkerRef.current) {
        droneMarkerRef.current.setLatLng([parseFloat(lat), parseFloat(lng)]);
      } else {
        droneMarkerRef.current = L.marker([parseFloat(lat), parseFloat(lng)], { icon: droneIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup('Drone đang giao hàng');
      }
    } catch (error) {
      console.error('Error updating drone marker:', error);
    }
  }, [dronePosition]);

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        className="h-64 w-full rounded-lg border border-border"
        style={{ minHeight: '256px', zIndex: 0 }}
      />
      
      {/* Status overlay */}
      {status === 'DELIVERING' && distance !== null && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-background/90 px-4 py-2 text-sm font-medium text-foreground shadow-lg backdrop-blur-sm z-10">
          Còn {distance >= 1000 ? `${(distance / 1000).toFixed(1)}km` : `${Math.round(distance)}m`} - Drone đang bay đến...
        </div>
      )}
      
      {status === 'WAITING_OTP' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-orange-500/90 px-4 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-sm z-10">
          ✅ Drone đã đến - Vui lòng nhận hàng và xác nhận OTP
        </div>
      )}
    </div>
  );
}
