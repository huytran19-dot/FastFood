import { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation } from 'lucide-react';

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

/**
 * LocationPicker - Interactive map to pick restaurant location
 * @param {Object} props
 * @param {Function} props.onLocationSelect - Callback (lat, lng) => void
 * @param {number} props.initialLat - Initial latitude (default: Hanoi)
 * @param {number} props.initialLng - Initial longitude
 * @param {string} props.height - Map height (default: '500px')
 */
export default function LocationPicker({ 
  onLocationSelect, 
  initialLat = 21.0285, 
  initialLng = 105.8542,
  height = '500px' 
}) {
  const [selectedLocation, setSelectedLocation] = useState(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    // Initialize map
    const map = L.map('location-picker-map').setView(
      [initialLat, initialLng], 
      13
    );
    mapRef.current = map;

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Add initial marker if coordinates provided
    if (initialLat && initialLng) {
      markerRef.current = L.marker([initialLat, initialLng], { draggable: true })
        .addTo(map)
        .bindPopup('📍 Vị trí nhà hàng')
        .openPopup();

      // Update location when marker is dragged
      markerRef.current.on('dragend', function(e) {
        const { lat, lng } = e.target.getLatLng();
        setSelectedLocation({ lat, lng });
        onLocationSelect?.(lat, lng);
      });
    }

    // Click on map to place/move marker
    map.on('click', function(e) {
      const { lat, lng } = e.latlng;
      
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], { draggable: true })
          .addTo(map)
          .bindPopup('📍 Vị trí nhà hàng')
          .openPopup();

        markerRef.current.on('dragend', function(e) {
          const { lat, lng } = e.target.getLatLng();
          setSelectedLocation({ lat, lng });
          onLocationSelect?.(lat, lng);
        });
      }

      setSelectedLocation({ lat, lng });
      onLocationSelect?.(lat, lng);
    });

    // Cleanup
    return () => {
      map.remove();
    };
  }, []);

  // Get current user location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Trình duyệt không hỗ trợ định vị');
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // Move map to current location
        mapRef.current?.setView([lat, lng], 15);

        // Place/move marker
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]).openPopup();
        } else {
          markerRef.current = L.marker([lat, lng], { draggable: true })
            .addTo(mapRef.current)
            .bindPopup('📍 Vị trí hiện tại')
            .openPopup();

          markerRef.current.on('dragend', function(e) {
            const { lat, lng } = e.target.getLatLng();
            setSelectedLocation({ lat, lng });
            onLocationSelect?.(lat, lng);
          });
        }

        setSelectedLocation({ lat, lng });
        onLocationSelect?.(lat, lng);
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Lỗi lấy vị trí:', error);
        setIsGettingLocation(false);
        
        // Better error messages
        let message = 'Không thể lấy vị trí hiện tại. ';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message += 'Bạn đã từ chối quyền truy cập vị trí. Vui lòng bật quyền trong cài đặt trình duyệt.';
            break;
          case error.POSITION_UNAVAILABLE:
            message += 'Thông tin vị trí không khả dụng.';
            break;
          case error.TIMEOUT:
            message += 'Yêu cầu quá thời gian chờ.';
            break;
          default:
            message += 'Lỗi không xác định. Bạn có thể nhấp trực tiếp trên bản đồ để chọn vị trí.';
        }
        alert(message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4" />
          <span>Nhấp vào bản đồ hoặc kéo marker để chọn vị trí</span>
        </div>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={getCurrentLocation}
          disabled={isGettingLocation}
        >
          <Navigation className="h-4 w-4 mr-2" />
          {isGettingLocation ? 'Đang lấy...' : 'Vị trí hiện tại'}
        </Button>
      </div>

      <div 
        id="location-picker-map" 
        style={{ height, width: '100%' }}
        className="rounded-lg border border-gray-300"
      />

      {selectedLocation && (
        <div className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
          <p className="font-medium mb-1">Tọa độ đã chọn:</p>
          <p>
            <span className="font-mono">Lat: {selectedLocation.lat.toFixed(6)}</span>
            {' | '}
            <span className="font-mono">Lng: {selectedLocation.lng.toFixed(6)}</span>
          </p>
        </div>
      )}
    </div>
  );
}
