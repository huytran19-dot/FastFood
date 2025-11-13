import { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import { autocompleteAddress, reverseGeocode, getPlaceDetail } from '@/lib/goong-api';

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

/**
 * LocationPickerWithAddress - Combined address input + map picker
 * @param {Object} props
 * @param {Function} props.onLocationChange - Callback (address, lat, lng) => void
 * @param {string} props.initialAddress - Initial address
 * @param {number} props.initialLat - Initial latitude
 * @param {number} props.initialLng - Initial longitude
 * @param {string} props.height - Map height (default: '400px')
 */
export default function LocationPickerWithAddress({ 
  onLocationChange,
  initialAddress = '',
  initialLat = 21.0285, 
  initialLng = 105.8542,
  height = '400px' 
}) {
  const [address, setAddress] = useState(initialAddress);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );
  
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize map
  useEffect(() => {
    const map = L.map('location-address-picker-map').setView(
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

      setupMarkerEvents();
    }

    // Click on map to place/move marker
    map.on('click', handleMapClick);

    // Cleanup
    return () => {
      map.remove();
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  const setupMarkerEvents = () => {
    if (!markerRef.current) return;

    markerRef.current.on('dragend', async function(e) {
      const { lat, lng } = e.target.getLatLng();
      setSelectedLocation({ lat, lng });
      
      // Auto reverse geocode to get address
      await handleReverseGeocode(lat, lng);
    });
  };

  const handleMapClick = async (e) => {
    const { lat, lng } = e.latlng;
    
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], { draggable: true })
        .addTo(mapRef.current)
        .bindPopup('📍 Vị trí nhà hàng')
        .openPopup();

      setupMarkerEvents();
    }

    setSelectedLocation({ lat, lng });
    
    // Auto reverse geocode to get address
    await handleReverseGeocode(lat, lng);
  };

  const handleReverseGeocode = async (lat, lng) => {
    setIsReverseGeocoding(true);
    try {
      const result = await reverseGeocode(lat, lng);
      if (result) {
        setAddress(result);
        onLocationChange?.(result, lat, lng);
      }
    } catch (error) {
      console.error('Reverse geocode error:', error);
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  // Address input change with autocomplete
  const handleAddressChange = (e) => {
    const value = e.target.value;
    setAddress(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    if (value.trim().length > 2) {
      setIsLoadingSuggestions(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const results = await autocompleteAddress(value);
          setSuggestions(results);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Autocomplete error:', error);
          setSuggestions([]);
        } finally {
          setIsLoadingSuggestions(false);
        }
      }, 500); // 500ms debounce
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoadingSuggestions(false);
    }
  };

  // Select suggestion
  const handleSuggestionClick = async (suggestion) => {
    try {
      // Goong Autocomplete trả về predictions với place_id
      // Cần gọi Place Detail để lấy tọa độ chính xác
      const placeDetail = await getPlaceDetail(suggestion.place_id);
      
      if (!placeDetail || !placeDetail.lat || !placeDetail.lng) {
        console.error('❌ Không lấy được tọa độ từ place_id:', suggestion.place_id);
        alert('Không thể lấy tọa độ địa điểm này');
        return;
      }

      const { lat, lng, formattedAddress } = placeDetail;

      setAddress(formattedAddress);
      setSelectedLocation({ lat, lng });
      setShowSuggestions(false);
      setSuggestions([]);

      // Move map to selected location
      mapRef.current?.setView([lat, lng], 15);

      // Place/move marker
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]).openPopup();
      } else {
        markerRef.current = L.marker([lat, lng], { draggable: true })
          .addTo(mapRef.current)
          .bindPopup('📍 ' + formattedAddress)
          .openPopup();

        setupMarkerEvents();
      }

      // Notify parent
      onLocationChange?.(formattedAddress, lat, lng);
    } catch (error) {
      console.error('❌ Error selecting suggestion:', error);
      alert('Có lỗi khi chọn địa điểm');
    }
  };

  // Get current user location
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

          setupMarkerEvents();
        }

        setSelectedLocation({ lat, lng });
        setIsGettingLocation(false);

        // Auto reverse geocode to get address
        await handleReverseGeocode(lat, lng);
      },
      (error) => {
        console.error('Lỗi lấy vị trí:', error);
        setIsGettingLocation(false);
        
        let message = 'Không thể lấy vị trí hiện tại. ';
        switch (error.code) {
          case 1: // PERMISSION_DENIED
            message += 'Bạn đã từ chối quyền truy cập vị trí. Vui lòng bật quyền trong cài đặt trình duyệt.';
            break;
          case 2: // POSITION_UNAVAILABLE
            message += 'Thông tin vị trí không khả dụng. Hãy thử nhấp trực tiếp vào bản đồ.';
            break;
          case 3: // TIMEOUT
            message += 'Yêu cầu quá thời gian chờ. Hãy thử lại hoặc nhấp trực tiếp vào bản đồ.';
            break;
          default:
            message += 'Lỗi không xác định. Bạn có thể nhấp trực tiếp trên bản đồ để chọn vị trí.';
        }
        alert(message);
      },
      {
        enableHighAccuracy: false, // Tắt để nhanh hơn
        timeout: 15000, // Tăng lên 15 giây
        maximumAge: 60000 // Cache 60 giây
      }
    );
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-4">
      {/* Address Input with Autocomplete */}
      <div ref={inputRef} className="relative" style={{ zIndex: 9999 }}>
        <div className="flex items-center gap-2 relative">
          <MapPin className="h-4 w-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
          <Input
            type="text"
            value={address}
            onChange={handleAddressChange}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Nhập địa chỉ nhà hàng (VD: 123 Lý Thường Kiệt, Quận 1)"
            className="pl-10 pr-4"
            autoComplete="off"
          />
          {isReverseGeocoding && (
            <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
          )}
        </div>

        {/* Autocomplete Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div 
            className="absolute w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
            style={{ zIndex: 9999 }}
          >
            {isLoadingSuggestions ? (
              <div className="p-4 text-center text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                Đang tìm kiếm...
              </div>
            ) : (
              suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.place_id || index}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  onMouseDown={(e) => e.preventDefault()} 
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {suggestion.structured_formatting?.main_text || suggestion.description}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {suggestion.structured_formatting?.secondary_text || suggestion.formatted_address}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Map Controls */}
      <div className="text-sm text-gray-600">
        <span className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Nhấp vào bản đồ hoặc kéo marker để chọn vị trí
        </span>
      </div>

      {/* Map */}
      <div 
        id="location-address-picker-map" 
        style={{ height, width: '100%', zIndex: 1 }}
        className="rounded-lg border border-gray-300 relative"
      />

      {/* Selected Coordinates Display */}
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
