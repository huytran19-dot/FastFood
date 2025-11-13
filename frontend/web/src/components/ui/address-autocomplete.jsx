import { useState, useRef, useEffect } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { autocompleteAddress, getPlaceDetail } from '@/lib/goong-api';

/**
 * AddressAutocomplete - Gợi ý địa chỉ khi nhập (dùng Goong API - giống restaurant app)
 * @param {Object} props
 * @param {string} props.value - Giá trị địa chỉ
 * @param {Function} props.onChange - Callback khi thay đổi
 * @param {Function} props.onSelectAddress - Callback khi chọn địa chỉ (address, lat, lng) => void
 * @param {string} props.placeholder - Placeholder
 */
export default function AddressAutocomplete({ 
  value, 
  onChange, 
  onSelectAddress,
  placeholder = "Nhập địa chỉ..."
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value && value.trim().length > 2) {
      setIsLoading(true);
      searchTimeoutRef.current = setTimeout(async () => {
        await searchAddress(value);
      }, 500); // 500ms debounce
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoading(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [value]);

  const searchAddress = async (query) => {
    try {
      // Goong Autocomplete API - giống restaurant app
      const results = await autocompleteAddress(query, { limit: 8 });
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } catch (error) {
      console.error('Address search error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSuggestion = async (suggestion) => {
    try {
      // Lấy chi tiết địa điểm từ place_id để có tọa độ chính xác
      const placeDetail = await getPlaceDetail(suggestion.place_id);
      
      if (!placeDetail || !placeDetail.lat || !placeDetail.lng) {
        console.error('❌ Không lấy được tọa độ từ place_id:', suggestion.place_id);
        return;
      }

      const { lat, lng, formattedAddress } = placeDetail;

      onChange({ target: { value: formattedAddress } });
      onSelectAddress?.(formattedAddress, lat, lng);
      
      setSuggestions([]);
      setShowSuggestions(false);
    } catch (error) {
      console.error('❌ Error selecting suggestion:', error);
    }
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
    <div ref={inputRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          value={value}
          onChange={onChange}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          className="pl-10 pr-10"
          autoComplete="off"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          className="absolute w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto z-[9999]"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.place_id || index}
              type="button"
              onClick={() => handleSelectSuggestion(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-muted border-b border-border last:border-b-0 transition-colors"
            >
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {suggestion.structured_formatting?.main_text || suggestion.description}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {suggestion.structured_formatting?.secondary_text || suggestion.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {showSuggestions && !isLoading && suggestions.length === 0 && value.trim().length > 2 && (
        <div className="absolute w-full mt-1 bg-background border border-border rounded-lg shadow-lg p-4 z-[9999]">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Không tìm thấy địa chỉ phù hợp
            </p>
            <p className="text-xs text-muted-foreground">
              💡 Thử nhập: tên đường, quận, thành phố hoặc nhấp trực tiếp vào bản đồ bên dưới
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
