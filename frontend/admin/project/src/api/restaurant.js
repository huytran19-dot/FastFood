import { mockFetch } from './http';
import {
  mockRestaurants,
  mockMenuItems,
  mockOrders,
  mockOrderItems,
  mockDeliveries,
  mockDrones,
  mockLocations
} from './mockData';

let restaurantsData = [...mockRestaurants];
let menuItemsData = [...mockMenuItems];
let ordersData = [...mockOrders];
let orderItemsData = [...mockOrderItems];
let deliveriesData = [...mockDeliveries];
let dronesData = [...mockDrones];
let locationsData = [...mockLocations];

export async function getMyRestaurant(owner_user_id) {
  const restaurant = restaurantsData.find(r => r.owner_id === owner_user_id);
  if (!restaurant) throw new Error('Restaurant not found');
  return mockFetch({ ...restaurant });
}

export async function updateMyRestaurant(owner_user_id, patch) {
  const idx = restaurantsData.findIndex(r => r.owner_id === owner_user_id);
  if (idx === -1) throw new Error('Restaurant not found');

  restaurantsData[idx] = {
    ...restaurantsData[idx],
    ...patch,
    updated_at: new Date().toISOString()
  };

  return mockFetch({ ...restaurantsData[idx] });
}

export async function getMenuItems(restaurant_id) {
  const items = menuItemsData.filter(item => item.restaurant_id === restaurant_id);
  return mockFetch([...items]);
}

export async function createMenuItem(input) {
  const newItem = {
    ...input,
    item_id: Math.max(...menuItemsData.map(i => i.item_id)) + 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  menuItemsData.push(newItem);
  return mockFetch(newItem);
}

export async function updateMenuItem(item_id, patch) {
  const idx = menuItemsData.findIndex(i => i.item_id === item_id);
  if (idx === -1) throw new Error('Menu item not found');

  menuItemsData[idx] = {
    ...menuItemsData[idx],
    ...patch,
    updated_at: new Date().toISOString()
  };

  return mockFetch({ ...menuItemsData[idx] });
}

export async function deleteMenuItem(item_id) {
  const idx = menuItemsData.findIndex(i => i.item_id === item_id);
  if (idx !== -1) {
    menuItemsData.splice(idx, 1);
  }
  return mockFetch({ ok: true });
}

export async function getOrdersByRestaurant(restaurant_id, status) {
  let filtered = ordersData.filter(o => o.restaurant_id === restaurant_id);

  if (status) {
    filtered = filtered.filter(o => o.status === status);
  }

  return mockFetch([...filtered]);
}

export async function getOrderItems(order_id) {
  const items = orderItemsData.filter(oi => oi.order_id === order_id);
  return mockFetch([...items]);
}

export async function updateOrderStatus(order_id, nextStatus) {
  const order = ordersData.find(o => o.order_id === order_id);
  if (!order) throw new Error('Order not found');

  order.status = nextStatus;
  order.updated_at = new Date().toISOString();

  return mockFetch({ ...order });
}

export async function getDronesByRestaurant(restaurant_id) {
  const drones = dronesData.filter(d => d.restaurant_id === restaurant_id);
  return mockFetch([...drones]);
}

export async function getDeliveriesByRestaurant(restaurant_id) {
  const orderIds = ordersData
    .filter(o => o.restaurant_id === restaurant_id)
    .map(o => o.order_id);

  const deliveries = deliveriesData.filter(d => orderIds.includes(d.order_id));
  return mockFetch([...deliveries]);
}

export async function getLastLocation(drone_id) {
  const locations = locationsData.filter(l => l.drone_id === drone_id);
  if (locations.length === 0) return mockFetch(null);

  const latest = locations.sort((a, b) =>
    new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
  )[0];

  return mockFetch({ ...latest });
}
