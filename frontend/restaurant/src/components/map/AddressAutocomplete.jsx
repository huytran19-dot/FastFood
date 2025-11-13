import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { autocompleteAddress, getPlaceDetail, debounce } from '@/lib/goong-api';

/**
 * AddressAutocomplete - Gợi ý địa chỉ Việt Nam bằng Goong.io API
 * @param {Object} props
 * @param {Function} props.onAddressSelect - Callback khi chọn địa chỉ (address, lat, lng)
 * @param {string} props.initialValue - Giá trị ban đầu
 * @param {string} props.placeholder - Placeholder text
 */
export default function AddressAutocomplete({ 
  onAddressSelect, 
  initialValue = '',
  placeholder = "Nhập địa chỉ nhà hàng..."
}) {
  const [input, setInput] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  // Click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search function
  const searchAddress = useRef(
    debounce(async (searchTerm) => {
      if (searchTerm.length < 3) {
        setSuggestions([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const results = await autocompleteAddress(searchTerm, { limit: 7 });
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Search error:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 500)
  ).current;

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    searchAddress(value);
  };

  const handleSelectSuggestion = async (suggestion) => {
    const description = suggestion.description || suggestion.structured_formatting?.main_text;
    setInput(description);
    setShowSuggestions(false);
    setSuggestions([]);

    // Get place detail to retrieve coordinates
    if (suggestion.place_id) {
      try {
        const placeDetail = await getPlaceDetail(suggestion.place_id);
        if (placeDetail && placeDetail.lat && placeDetail.lng) {
          onAddressSelect?.(
            placeDetail.formattedAddress || description,
            placeDetail.lat,
            placeDetail.lng
          );
        } else {
          onAddressSelect?.(description, null, null);
        }
      } catch (error) {
        console.error('Error getting place detail:', error);
        onAddressSelect?.(description, null, null);
      }
    } else {
      onAddressSelect?.(description, null, null);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <Label className="flex items-center gap-2 mb-2">
        <MapPin className="h-4 w-4" />
        Địa chỉ nhà hàng
      </Label>
      
      <div className="relative">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="pr-10"
          autoComplete="off"
        />
        
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          ) : (
            <Search className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {suggestions.map((suggestion, index) => {
            const mainText = suggestion.structured_formatting?.main_text || suggestion.description;
            const secondaryText = suggestion.structured_formatting?.secondary_text || '';

            return (
              <button
                key={suggestion.place_id || index}
                type="button"
                onClick={() => handleSelectSuggestion(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{mainText}</p>
                    {secondaryText && (
                      <p className="text-sm text-gray-500 truncate">{secondaryText}</p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* No results message */}
      {showSuggestions && !isLoading && suggestions.length === 0 && input.length >= 3 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500 text-sm">
          Không tìm thấy địa chỉ phù hợp
        </div>
      )}

      <p className="text-xs text-gray-500 mt-1">
        💡 Gõ ít nhất 3 ký tự để tìm kiếm (dùng Goong.io API)
      </p>
    </div>
  );
}
