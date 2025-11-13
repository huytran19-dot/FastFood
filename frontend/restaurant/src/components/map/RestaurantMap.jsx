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
 * @param {number} props.zoom - Map zoom level (default: 15)
 * @param {string} props.height - Map container height (default: '400px')
 */
export default function RestaurantMap({ lat, lng, name, zoom = 15, height = '400px' }) {
  useEffect(() => {
    if (!lat || !lng) return;

    // Initialize map
    const map = L.map('restaurant-map').setView([lat, lng], zoom);

    // Add OpenStreetMap tile layer (Vietnam)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add marker
    const marker = L.marker([lat, lng]).addTo(map);
    
    if (name) {
      marker.bindPopup(`<b>${name}</b>`).openPopup();
    }

    // Cleanup
    return () => {
      map.remove();
    };
  }, [lat, lng, name, zoom]);

  if (!lat || !lng) {
    return (
      <div className="flex items-center justify-center bg-gray-100 rounded-lg" style={{ height }}>
        <p className="text-gray-500">Chưa có tọa độ địa lý</p>
      </div>
    );
  }

  return (
    <div 
      id="restaurant-map" 
      style={{ height, width: '100%' }}
      className="rounded-lg border border-gray-300"
    />
  );
}
