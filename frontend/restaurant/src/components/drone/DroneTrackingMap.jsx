import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation } from 'lucide-react';

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

/**
 * DroneTrackingMap - Real-time drone tracking map
 * @param {Object} props
 * @param {number} props.droneId - Drone ID
 * @param {number} props.orderId - Order ID
 * @param {Function} props.onDistanceUpdate - Callback (distance) => void
 * @param {number} props.destinationLat - Destination latitude
 * @param {number} props.destinationLng - Destination longitude
 * @param {boolean} props.autoStart - Auto start tracking when component mounts
 */
export default function DroneTrackingMap({ 
  droneId, 
  orderId,
  onDistanceUpdate,
  destinationLat,
  destinationLng,
  autoStart = false
}) {
  const mapRef = useRef(null);
  const droneMarkerRef = useRef(null);
  const routeLineRef = useRef(null);
  const destinationMarkerRef = useRef(null);
  const [dronePosition, setDronePosition] = useState(null);
  const [distance, setDistance] = useState(null);
  const [isTracking, setIsTracking] = useState(autoStart);
  const pollingIntervalRef = useRef(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map(`drone-tracking-map-${orderId}`, {
        zoomControl: true
      }).setView([10.8231, 106.6297], 13);
      mapRef.current = map;

      // Set z-index for map container and all Leaflet elements to be lower than modal
      const mapContainer = map.getContainer();
      if (mapContainer) {
        mapContainer.style.zIndex = '1';
      }
      
      // Set z-index for all Leaflet panes
      if (map.getPane('mapPane')) {
        map.getPane('mapPane').style.zIndex = '1';
      }
      if (map.getPane('tilePane')) {
        map.getPane('tilePane').style.zIndex = '1';
      }
      if (map.getPane('markerPane')) {
        map.getPane('markerPane').style.zIndex = '2';
      }
      if (map.getPane('overlayPane')) {
        map.getPane('overlayPane').style.zIndex = '2';
      }
      if (map.getPane('popupPane')) {
        map.getPane('popupPane').style.zIndex = '3';
      }
      if (map.getPane('tooltipPane')) {
        map.getPane('tooltipPane').style.zIndex = '3';
      }

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Add destination marker if provided
      if (destinationLat && destinationLng) {
        destinationMarkerRef.current = L.marker([destinationLat, destinationLng], {
          icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          })
        })
          .addTo(map)
          .bindPopup('📍 Điểm đến')
          .openPopup();
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [orderId, destinationLat, destinationLng]);

  // Start/stop tracking
  useEffect(() => {
    if (isTracking && droneId) {
      // Start polling for drone position
      const fetchPosition = async () => {
        try {
          const { droneAPI } = await import('@/lib/api');
          const response = await droneAPI.getDronePosition(droneId);
          
          console.log(`[DroneTrackingMap] Polling position for drone ${droneId}:`, response);
          
          if (response.success && response.data.position) {
            const pos = response.data.position;
            setDronePosition({ lat: pos.lat, lng: pos.lng });
            console.log(`[DroneTrackingMap] Updated position:`, { lat: pos.lat, lng: pos.lng });

            // Update drone marker
            if (mapRef.current) {
              if (droneMarkerRef.current) {
                droneMarkerRef.current.setLatLng([pos.lat, pos.lng]);
              } else {
                droneMarkerRef.current = L.marker([pos.lat, pos.lng], { icon: droneIcon })
                  .addTo(mapRef.current)
                  .bindPopup('🚁 Drone đang bay')
                  .openPopup();
              }

              // Update route line
              if (destinationMarkerRef.current && destinationLat && destinationLng) {
                const destLatLng = destinationMarkerRef.current.getLatLng();
                if (routeLineRef.current) {
                  routeLineRef.current.setLatLngs([[pos.lat, pos.lng], [destLatLng.lat, destLatLng.lng]]);
                } else {
                  routeLineRef.current = L.polyline(
                    [[pos.lat, pos.lng], [destLatLng.lat, destLatLng.lng]],
                    { color: 'red', weight: 3, dashArray: '10, 10' }
                  ).addTo(mapRef.current);
                }
              }

              // Fit map to show both markers
              if (droneMarkerRef.current && destinationMarkerRef.current) {
                const group = new L.featureGroup([droneMarkerRef.current, destinationMarkerRef.current]);
                mapRef.current.fitBounds(group.getBounds().pad(0.1));
              }
            }

            // Fetch distance
            try {
              const { droneAPI } = await import('@/lib/api');
              const distanceResponse = await droneAPI.getOrderDistance(orderId);
              if (distanceResponse.success) {
                const dist = distanceResponse.data.distance_km;
                setDistance(dist);
                onDistanceUpdate?.(dist);
              }
            } catch (error) {
              console.error('[DroneTrackingMap] Error fetching distance:', error);
            }
          } else {
            console.warn(`[DroneTrackingMap] No position data in response for drone ${droneId}:`, response);
          }
        } catch (error) {
          console.error(`[DroneTrackingMap] Error fetching drone position for drone ${droneId}:`, error);
        }
      };

      // Fetch immediately
      fetchPosition();

      // Poll every 2 seconds
      pollingIntervalRef.current = setInterval(fetchPosition, 2000);
    } else {
      // Stop polling
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
  }, [isTracking, droneId, orderId, destinationLat, destinationLng, onDistanceUpdate]);

  // Expose start/stop methods via ref
  const startTracking = () => {
    setIsTracking(true);
  };
  const stopTracking = () => {
    setIsTracking(false);
  };

  // Auto start if autoStart prop is true
  useEffect(() => {
    if (autoStart) {
      setIsTracking(true);
    }
  }, [autoStart]);

  // Expose methods to parent via window object
  useEffect(() => {
    if (!window.droneTrackingRefs) {
      window.droneTrackingRefs = {};
    }
    window.droneTrackingRefs[orderId] = { startTracking, stopTracking };
    
    return () => {
      if (window.droneTrackingRefs) {
        delete window.droneTrackingRefs[orderId];
      }
    };
  }, [orderId]);

  return (
    <div className="space-y-2" style={{ position: 'relative', zIndex: 1 }}>
      <div 
        id={`drone-tracking-map-${orderId}`} 
        className="w-full h-64 rounded-lg border border-gray-300"
        style={{ minHeight: '256px', position: 'relative', zIndex: 1 }}
      />
      {dronePosition && (
        <div className="text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Navigation className="h-4 w-4 text-red-600" />
            <span>Vị trí: {dronePosition.lat.toFixed(6)}, {dronePosition.lng.toFixed(6)}</span>
          </div>
        </div>
      )}
      {distance !== null && (
        <div className="text-sm font-semibold text-orange-600">
          Khoảng cách còn lại: {distance.toFixed(2)} km
        </div>
      )}
    </div>
  );
}

// Helper to start tracking from parent
export const startDroneTracking = (orderId) => {
  if (window.droneTrackingRefs && window.droneTrackingRefs[orderId]) {
    window.droneTrackingRefs[orderId].startTracking();
  }
};

// Helper to stop tracking from parent
export const stopDroneTracking = (orderId) => {
  if (window.droneTrackingRefs && window.droneTrackingRefs[orderId]) {
    window.droneTrackingRefs[orderId].stopTracking();
  }
};

