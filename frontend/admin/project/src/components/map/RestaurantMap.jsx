import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue with Leaflet + Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

/**
 * RestaurantMap - Display restaurant location on OpenStreetMap
 * @param {Object} props
 * @param {number} props.lat - Latitude
 * @param {number} props.lng - Longitude
 * @param {string} props.name - Restaurant name for popup
 * @param {string} props.address - Restaurant address
 * @param {number} props.zoom - Map zoom level (default: 15)
 * @param {string} props.height - Map container height (default: '400px')
 * @param {string} props.mapId - Unique map container ID
 */
export default function RestaurantMap({ 
  lat, 
  lng, 
  name, 
  address,
  zoom = 15, 
  height = '400px',
  mapId = 'restaurant-map'
}) {
  useEffect(() => {
    if (!lat || !lng) return;

    // Initialize map
    const map = L.map(mapId).setView([lat, lng], zoom);

    // Add OpenStreetMap tile layer (Vietnam)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add marker
    const marker = L.marker([lat, lng]).addTo(map);
    
    if (name || address) {
      const popupContent = `
        <div style="min-width: 150px;">
          ${name ? `<h3 style="font-weight: bold; margin-bottom: 4px;">${name}</h3>` : ''}
          ${address ? `<p style="margin-bottom: 4px;">📍 ${address}</p>` : ''}
          <p style="font-size: 12px; color: #666; margin-top: 4px;">
            Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}
          </p>
        </div>
      `;
      marker.bindPopup(popupContent).openPopup();
    }

    // Cleanup
    return () => {
      map.remove();
    };
  }, [lat, lng, name, address, zoom, mapId]);

  if (!lat || !lng) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 rounded-lg border border-gray-300" 
        style={{ height }}
      >
        <div className="text-center text-gray-500">
          <p className="font-medium">Chưa có tọa độ địa lý</p>
          <p className="text-sm mt-1">Nhà hàng chưa cung cấp vị trí trên bản đồ</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      id={mapId}
      style={{ height, width: '100%' }}
      className="rounded-lg border border-gray-300"
    />
  );
}
