/**
 * Goong.io API Integration
 * Free API for Vietnam Maps - 5,000 requests/month
 * Docs: https://docs.goong.io/
 */

const GOONG_API_KEY = import.meta.env.VITE_GOONG_API_KEY || '';
const GOONG_BASE_URL = 'https://rsapi.goong.io';

/**
 * Autocomplete - Gợi ý địa chỉ khi người dùng nhập
 * @param {string} input - Địa chỉ người dùng đang gõ
 * @param {object} options - Options (location, radius, limit)
 * @returns {Promise<Array>} Danh sách gợi ý
 */
export async function autocompleteAddress(input, options = {}) {
  if (!GOONG_API_KEY) {
    console.warn('⚠️ GOONG_API_KEY not configured');
    return [];
  }

  if (!input || input.trim().length < 3) {
    return [];
  }

  try {
    const params = new URLSearchParams({
      api_key: GOONG_API_KEY,
      input: input.trim(),
      limit: options.limit || 5,
      ...(options.location && { location: options.location }), // "lat,lng"
      ...(options.radius && { radius: options.radius }), // meters
    });

    const response = await fetch(`${GOONG_BASE_URL}/Place/AutoComplete?${params}`);
    
    if (!response.ok) {
      throw new Error(`Goong API error: ${response.status}`);
    }

    const data = await response.json();
    
    return data.predictions || [];
  } catch (error) {
    console.error('❌ Autocomplete error:', error);
    return [];
  }
}

/**
 * Place Detail - Lấy chi tiết địa điểm (bao gồm tọa độ)
 * @param {string} placeId - Place ID từ Autocomplete
 * @returns {Promise<Object>} Chi tiết địa điểm
 */
export async function getPlaceDetail(placeId) {
  if (!GOONG_API_KEY) {
    console.warn('⚠️ GOONG_API_KEY not configured');
    return null;
  }

  try {
    const params = new URLSearchParams({
      api_key: GOONG_API_KEY,
      place_id: placeId,
    });

    const response = await fetch(`${GOONG_BASE_URL}/Place/Detail?${params}`);
    
    if (!response.ok) {
      throw new Error(`Goong API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.result) {
      return {
        placeId: data.result.place_id,
        name: data.result.name,
        formattedAddress: data.result.formatted_address,
        lat: data.result.geometry?.location?.lat,
        lng: data.result.geometry?.location?.lng,
        address: data.result.formatted_address,
        types: data.result.types,
      };
    }

    return null;
  } catch (error) {
    console.error('❌ Place Detail error:', error);
    return null;
  }
}

/**
 * Forward Geocoding - Chuyển địa chỉ thành tọa độ
 * @param {string} address - Địa chỉ cần geocode
 * @returns {Promise<Object>} { lat, lng, formattedAddress }
 */
export async function geocodeAddress(address) {
  if (!GOONG_API_KEY) {
    console.warn('⚠️ GOONG_API_KEY not configured');
    return null;
  }

  try {
    const params = new URLSearchParams({
      api_key: GOONG_API_KEY,
      address: address,
    });

    const response = await fetch(`${GOONG_BASE_URL}/geocode?${params}`);
    
    if (!response.ok) {
      throw new Error(`Goong API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      return {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formattedAddress: result.formatted_address,
        placeId: result.place_id,
      };
    }

    return null;
  } catch (error) {
    console.error('❌ Geocode error:', error);
    return null;
  }
}

/**
 * Reverse Geocoding - Chuyển tọa độ thành địa chỉ
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<string>} Địa chỉ
 */
export async function reverseGeocode(lat, lng) {
  if (!GOONG_API_KEY) {
    console.warn('⚠️ GOONG_API_KEY not configured');
    return null;
  }

  try {
    const params = new URLSearchParams({
      api_key: GOONG_API_KEY,
      latlng: `${lat},${lng}`,
    });

    const response = await fetch(`${GOONG_BASE_URL}/geocode?${params}`);
    
    if (!response.ok) {
      throw new Error(`Goong API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      return data.results[0].formatted_address;
    }

    return null;
  } catch (error) {
    console.error('❌ Reverse Geocode error:', error);
    return null;
  }
}

/**
 * Nearby Search - Tìm địa điểm gần vị trí
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {object} options - Options (radius, type, limit)
 * @returns {Promise<Array>} Danh sách địa điểm
 */
export async function searchNearby(lat, lng, options = {}) {
  if (!GOONG_API_KEY) {
    console.warn('⚠️ GOONG_API_KEY not configured');
    return [];
  }

  try {
    const params = new URLSearchParams({
      api_key: GOONG_API_KEY,
      location: `${lat},${lng}`,
      radius: options.radius || 1000, // meters
      limit: options.limit || 10,
      ...(options.type && { type: options.type }), // restaurant, cafe, etc
    });

    const response = await fetch(`${GOONG_BASE_URL}/Place/Nearby?${params}`);
    
    if (!response.ok) {
      throw new Error(`Goong API error: ${response.status}`);
    }

    const data = await response.json();
    
    return data.results || [];
  } catch (error) {
    console.error('❌ Nearby Search error:', error);
    return [];
  }
}

/**
 * Helper: Debounce function cho autocomplete
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
