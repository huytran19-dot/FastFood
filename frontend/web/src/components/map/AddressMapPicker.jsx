import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

/**
 * AddressMapPicker - Map to select delivery address
 * @param {Object} props
 * @param {Function} props.onLocationSelect - Callback (lat, lng, address) => void
 * @param {number} props.initialLat - Initial latitude
 * @param {number} props.initialLng - Initial longitude
 * @param {number} props.lat - External latitude (from autocomplete)
 * @param {number} props.lng - External longitude (from autocomplete)
 * @param {string} props.height - Map height (default: '300px')
 */
export default function AddressMapPicker({ 
  onLocationSelect,
  initialLat = 10.8231, // Default: TP.HCM
  initialLng = 106.6297,
  lat,
  lng,
  height = '300px' 
}) {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    const map = L.map('address-map-picker').setView([initialLat, initialLng], 13);
    mapRef.current = map;

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Click on map to place/move marker
    map.on('click', handleMapClick);

    return () => {
      map.remove();
    };
  }, []);

  // Update marker when external lat/lng changes (from autocomplete)
  useEffect(() => {
    if (lat && lng && mapRef.current) {
      // Move map to new location
      mapRef.current.setView([lat, lng], 15);

      // Update or create marker
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]).openPopup();
      } else {
        markerRef.current = L.marker([lat, lng], { draggable: true })
          .addTo(mapRef.current)
          .bindPopup('📍 Địa chỉ giao hàng')
          .openPopup();

        markerRef.current.on('dragend', function(e) {
          const { lat, lng } = e.target.getLatLng();
          handleLocationSelect(lat, lng);
        });
      }

      setSelectedLocation({ lat, lng });
    }
  }, [lat, lng]);

  const handleMapClick = async (e) => {
    const { lat, lng } = e.latlng;
    
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], { draggable: true })
        .addTo(mapRef.current)
        .bindPopup('📍 Địa chỉ giao hàng')
        .openPopup();

      markerRef.current.on('dragend', function(e) {
        const { lat, lng } = e.target.getLatLng();
        handleLocationSelect(lat, lng);
      });
    }

    handleLocationSelect(lat, lng);
  };

  const handleLocationSelect = async (lat, lng) => {
    setSelectedLocation({ lat, lng });
    setIsReverseGeocoding(true);

    try {
      // Reverse geocode using Nominatim (OpenStreetMap)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'vi'
          }
        }
      );
      
      const data = await response.json();
      const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      
      onLocationSelect?.(lat, lng, address);
    } catch (error) {
      console.error('Reverse geocode error:', error);
      onLocationSelect?.(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Trình duyệt không hỗ trợ định vị');
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        mapRef.current?.setView([lat, lng], 15);

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]).openPopup();
        } else {
          markerRef.current = L.marker([lat, lng], { draggable: true })
            .addTo(mapRef.current)
            .bindPopup('📍 Vị trí hiện tại')
            .openPopup();

          markerRef.current.on('dragend', function(e) {
            const { lat, lng } = e.target.getLatLng();
            handleLocationSelect(lat, lng);
          });
        }

        setIsGettingLocation(false);
        await handleLocationSelect(lat, lng);
      },
      (error) => {
        console.error('Lỗi lấy vị trí:', error);
        setIsGettingLocation(false);
        alert('Không thể lấy vị trí hiện tại. Vui lòng nhấp trực tiếp vào bản đồ.');
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
        <div className="text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Nhấp vào bản đồ để chọn vị trí giao hàng
          </span>
        </div>
      </div>

      <div 
        id="address-map-picker" 
        style={{ height, width: '100%', zIndex: 1 }}
        className="rounded-lg border border-border relative"
      />

      {isReverseGeocoding && (
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Đang xác định địa chỉ...
        </div>
      )}

      {selectedLocation && (
        <div className="text-xs text-muted-foreground">
          Tọa độ: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
        </div>
      )}
    </div>
  );
}
