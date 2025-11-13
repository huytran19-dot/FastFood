import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { geocodeAddress, reverseGeocode, searchNearby } from '@/lib/goong-api';

/**
 * GoongAPIDemo - Test các tính năng của Goong API
 * Chỉ dùng để test, không cần trong production
 */
export default function GoongAPIDemo() {
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testGeocode = async () => {
    setLoading(true);
    try {
      const result = await geocodeAddress(address);
      setResult(result);
      console.log('Geocode result:', result);
    } catch (error) {
      console.error(error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testReverseGeocode = async () => {
    setLoading(true);
    try {
      const result = await reverseGeocode(parseFloat(lat), parseFloat(lng));
      setResult({ address: result });
      console.log('Reverse Geocode result:', result);
    } catch (error) {
      console.error(error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testNearby = async () => {
    setLoading(true);
    try {
      const result = await searchNearby(parseFloat(lat), parseFloat(lng), {
        radius: 1000,
        type: 'restaurant',
        limit: 10
      });
      setResult({ places: result });
      console.log('Nearby result:', result);
    } catch (error) {
      console.error(error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">🧪 Goong.io API Demo</h1>

      <div className="space-y-6">
        {/* Geocoding Test */}
        <Card>
          <CardHeader>
            <CardTitle>1. Forward Geocoding (Địa chỉ → Tọa độ)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Nhập địa chỉ (VD: 123 Nguyễn Huệ, Quận 1, TP.HCM)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <Button onClick={testGeocode} disabled={loading || !address}>
              {loading ? 'Đang xử lý...' : 'Test Geocode'}
            </Button>
          </CardContent>
        </Card>

        {/* Reverse Geocoding Test */}
        <Card>
          <CardHeader>
            <CardTitle>2. Reverse Geocoding (Tọa độ → Địa chỉ)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Latitude (VD: 10.7769)"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
              />
              <Input
                placeholder="Longitude (VD: 106.7009)"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
              />
            </div>
            <Button onClick={testReverseGeocode} disabled={loading || !lat || !lng}>
              {loading ? 'Đang xử lý...' : 'Test Reverse Geocode'}
            </Button>
          </CardContent>
        </Card>

        {/* Nearby Search Test */}
        <Card>
          <CardHeader>
            <CardTitle>3. Nearby Search (Tìm nhà hàng gần)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Latitude"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
              />
              <Input
                placeholder="Longitude"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
              />
            </div>
            <Button onClick={testNearby} disabled={loading || !lat || !lng}>
              {loading ? 'Đang xử lý...' : 'Test Nearby Search'}
            </Button>
          </CardContent>
        </Card>

        {/* Result Display */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Kết quả:</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Sample Coordinates */}
        <Card className="bg-blue-50">
          <CardHeader>
            <CardTitle>📍 Tọa độ mẫu để test</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>
                <strong>Hà Nội:</strong> 21.0285, 105.8542
              </li>
              <li>
                <strong>TP.HCM (Bến Thành):</strong> 10.7723, 106.6988
              </li>
              <li>
                <strong>Đà Nẵng:</strong> 16.0544, 108.2022
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
