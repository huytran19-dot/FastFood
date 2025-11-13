import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, ExternalLink, Eye, EyeOff, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

// Fix default marker icon with custom restaurant icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom restaurant marker icon - using URI encoding instead of btoa
const restaurantIcon = L.icon({
  iconUrl: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 44" width="32" height="44">
      <path fill="#ef4444" stroke="#b91c1c" stroke-width="1.5" d="M16 1C10.5 1 6 5.5 6 11c0 7 10 20 10 20s10-13 10-20c0-5.5-4.5-10-10-10z"/>
      <circle fill="#fff" cx="16" cy="11" r="5"/>
      <circle fill="#ef4444" cx="16" cy="11" r="3"/>
    </svg>
  `),
  iconSize: [32, 44],
  iconAnchor: [16, 44],
  popupAnchor: [0, -44]
});

/**
 * RestaurantMapView - Display restaurant location on map (read-only)
 * @param {Object} props
 * @param {number} props.lat - Restaurant latitude
 * @param {number} props.lng - Restaurant longitude
 * @param {string} props.restaurantName - Restaurant name
 * @param {string} props.address - Restaurant address
 * @param {string} props.height - Map height (default: '300px')
 */
export default function RestaurantMapView({ 
  lat,
  lng,
  restaurantName = 'Nhà hàng',
  address = '',
  height = '300px' 
}) {
  const mapRef = useRef(null);
  const circleRef = useRef(null);
  const fullscreenMapRef = useRef(null);
  const fullscreenCircleRef = useRef(null);
  const [showDeliveryZone, setShowDeliveryZone] = useState(true);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

  useEffect(() => {
    if (!lat || !lng) return;

    const map = L.map('restaurant-map-view', {
      center: [lat, lng],
      zoom: 13,
      scrollWheelZoom: true, // Enable scroll zoom
      dragging: true,
      zoomControl: true, // Show zoom buttons
    });
    mapRef.current = map;

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
      minZoom: 10,
    }).addTo(map);

    // Add restaurant marker with custom icon
    const marker = L.marker([lat, lng], { icon: restaurantIcon })
      .addTo(map)
      .bindPopup(`
        <div style="text-align: center; min-width: 200px;">
          <h3 style="font-weight: bold; margin-bottom: 8px; font-size: 16px;">
            ${restaurantName}
          </h3>
          <p style="font-size: 12px; color: #666; margin-bottom: 12px;">
            ${address || 'Địa chỉ nhà hàng'}
          </p>
          <a 
            href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" 
            target="_blank"
            rel="noopener noreferrer"
            style="
              display: inline-block;
              padding: 6px 12px;
              background: #3b82f6;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              font-size: 12px;
              font-weight: 500;
            "
          >
            Chỉ đường →
          </a>
        </div>
      `)
      .openPopup();

    // Add circle radius (e.g., delivery zone)
    circleRef.current = L.circle([lat, lng], {
      color: '#ef4444',
      fillColor: '#fca5a5',
      fillOpacity: 0.2,
      radius: 10000 // 10km delivery radius
    }).addTo(map);

    return () => {
      map.remove();
    };
  }, [lat, lng, restaurantName, address]);

  // Toggle delivery zone visibility
  useEffect(() => {
    if (circleRef.current && mapRef.current) {
      if (showDeliveryZone) {
        circleRef.current.addTo(mapRef.current);
      } else {
        circleRef.current.remove();
      }
    }
  }, [showDeliveryZone]);

  const toggleDeliveryZone = () => {
    setShowDeliveryZone(!showDeliveryZone);
  };

  // Initialize fullscreen map when dialog opens
  useEffect(() => {
    if (!isFullscreenOpen || !lat || !lng) return;

    // Cleanup any existing fullscreen map first
    if (fullscreenMapRef.current) {
      fullscreenMapRef.current.remove();
      fullscreenMapRef.current = null;
    }

    // Small delay to ensure DOM is ready and dialog is rendered
    const timer = setTimeout(() => {
      const container = document.getElementById('restaurant-map-fullscreen');
      if (!container) return;

      // Remove any existing map instance
      container.innerHTML = '';
      
      const fullscreenMap = L.map('restaurant-map-fullscreen', {
        center: [lat, lng],
        zoom: 14,
        scrollWheelZoom: true,
        dragging: true,
        zoomControl: true,
      });
      fullscreenMapRef.current = fullscreenMap;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
        minZoom: 10,
      }).addTo(fullscreenMap);

      // Add marker
      L.marker([lat, lng], { icon: restaurantIcon })
        .addTo(fullscreenMap)
        .bindPopup(`
          <div style="text-align: center; min-width: 200px;">
            <h3 style="font-weight: bold; margin-bottom: 8px; font-size: 16px;">
              ${restaurantName}
            </h3>
            <p style="font-size: 12px; color: #666; margin-bottom: 12px;">
              ${address || 'Địa chỉ nhà hàng'}
            </p>
          </div>
        `)
        .openPopup();

      // Add circle
      fullscreenCircleRef.current = L.circle([lat, lng], {
        color: '#ef4444',
        fillColor: '#fca5a5',
        fillOpacity: 0.2,
        radius: 10000,
      }).addTo(fullscreenMap);
    }, 150);

    return () => {
      clearTimeout(timer);
      if (fullscreenMapRef.current) {
        try {
          fullscreenMapRef.current.remove();
        } catch (e) {
          console.error('Error removing fullscreen map:', e);
        }
        fullscreenMapRef.current = null;
      }
      if (fullscreenCircleRef.current) {
        fullscreenCircleRef.current = null;
      }
    };
  }, [isFullscreenOpen, lat, lng, restaurantName, address]);

  if (!lat || !lng) {
    return (
      <div 
        className="flex items-center justify-center bg-muted rounded-lg"
        style={{ height }}
      >
        <div className="text-center text-muted-foreground">
          <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Chưa có thông tin vị trí</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          Vị trí nhà hàng
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsFullscreenOpen(true)}
          >
            <Maximize2 className="mr-2 h-4 w-4" />
            Xem toàn màn
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            asChild
          >
            <a 
              href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Chỉ đường
            </a>
          </Button>
        </div>
      </div>

      <div 
        id="restaurant-map-view" 
        style={{ height, width: '100%', display: isFullscreenOpen ? 'none' : 'block', zIndex: 1 }}
        className="rounded-lg border border-border relative overflow-hidden"
      />

      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground flex items-center gap-4">
          <span>
            <span className="inline-block w-3 h-3 rounded-full bg-red-500/20 border border-red-500 mr-2"></span>
            Khu vực giao hàng trong bán kính 10km
          </span>
          <span className="text-muted-foreground">
            💡 Cuộn chuột hoặc dùng nút +/- để zoom
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleDeliveryZone}
          className="gap-2"
        >
          {showDeliveryZone ? (
            <>
              <EyeOff className="h-4 w-4" />
              Ẩn vùng giao
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              Hiện vùng giao
            </>
          )}
        </Button>
      </div>

      {/* Fullscreen Map Dialog */}
      <Dialog open={isFullscreenOpen} onOpenChange={setIsFullscreenOpen}>
        <DialogContent className="max-w-[95vw] w-[95vw] h-[95vh] p-0 flex flex-col">
          <DialogHeader className="p-4 pb-3 shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              {restaurantName}
            </DialogTitle>
            <DialogDescription>
              {address}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 px-4 pb-4 min-h-0">
            <div 
              id="restaurant-map-fullscreen" 
              className="w-full h-full rounded-lg border border-border"
            />
          </div>
          <div className="p-4 pt-3 border-t flex justify-between items-center shrink-0">
            <span className="text-sm text-muted-foreground">
              <span className="inline-block w-3 h-3 rounded-full bg-red-500/20 border border-red-500 mr-2"></span>
              Vùng giao hàng 10km
            </span>
            <Button
              variant="default"
              size="sm"
              asChild
            >
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Mở Google Maps
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
