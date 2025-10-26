import { mockFetch } from './http';
import {
  mockUsers,
  mockRestaurants,
  mockOrders,
  mockPayments,
  mockDrones,
  mockDeliveries,
  userRoles
} from './mockData';

// ===== Mock Data =====
let usersData = [...mockUsers];
let restaurantsData = [...mockRestaurants];
let ordersData = [...mockOrders];
let paymentsData = [...mockPayments];
let dronesData = [...mockDrones];
let deliveriesData = [...mockDeliveries];

/* ==================== USERS ==================== */
export async function getUsers() {
  return mockFetch([...usersData]);
}

export async function createUser(input) {
  const newId = usersData.length ? Math.max(...usersData.map(u => u.user_id)) + 1 : 1;
  const newUser = {
    user_id: newId,
    full_name: input.full_name || '',
    email: input.email || '',
    phone: input.phone,
    address: input.address,
    status: input.status ?? 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  usersData.push(newUser);
  userRoles[newUser.user_id] = input.role ?? 'user';
  return mockFetch(newUser);
}

export async function updateUserRole(user_id, role) {
  const user = usersData.find(u => u.user_id === user_id);
  if (!user) return mockFetch(null);
  userRoles[user_id] = role;
  user.updated_at = new Date().toISOString();
  return mockFetch({ ...user });
}

export async function toggleUserStatus(user_id) {
  const user = usersData.find(u => u.user_id === user_id);
  if (!user) return mockFetch(null);
  user.status = user.status === 1 ? 0 : 1;
  user.updated_at = new Date().toISOString();
  return mockFetch({ ...user });
}

/* ==================== RESTAURANTS ==================== */
export async function getRestaurants() {
  return mockFetch([...restaurantsData]);
}

export async function createRestaurant(input) {
  const newId = restaurantsData.length ? Math.max(...restaurantsData.map(r => r.restaurant_id)) + 1 : 1;
  const newRestaurant = {
    restaurant_id: newId,
    name: input.name || 'Unnamed',
    address: input.address || '',
    phone: input.phone || '',
    status: input.status ?? 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  restaurantsData.push(newRestaurant);
  return mockFetch(newRestaurant);
}

export async function toggleRestaurantStatus(restaurant_id) {
  const restaurant = restaurantsData.find(r => r.restaurant_id === restaurant_id);
  if (!restaurant) return mockFetch(null);
  restaurant.status = restaurant.status === 1 ? 0 : 1;
  restaurant.updated_at = new Date().toISOString();
  return mockFetch({ ...restaurant });
}

/* ==================== DRONES ==================== */
export async function getDrones() {
  return mockFetch([...dronesData]);
}

export async function createDrone(input) {
  const newId = dronesData.length ? Math.max(...dronesData.map(d => d.drone_id)) + 1 : 1;
  const newDrone = {
    drone_id: newId,
    name: input.name || 'New Drone',
    model: input.model || 'Generic Model',
    status: input.status ?? 'idle',
    battery_level: input.battery_level ?? 100,
    last_maintenance: input.last_maintenance || new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  dronesData.push(newDrone);
  return mockFetch(newDrone);
}

export async function updateDrone(drone_id, patch) {
  const idx = dronesData.findIndex(d => d.drone_id === drone_id);
  if (idx === -1) return mockFetch(null);
  dronesData[idx] = {
    ...dronesData[idx],
    ...patch,
    updated_at: new Date().toISOString()
  };
  return mockFetch({ ...dronesData[idx] });
}

export async function toggleDroneStatus(drone_id) {
  const drone = dronesData.find(d => d.drone_id === drone_id);
  if (!drone) return mockFetch(null);
  drone.status = drone.status === 'active' ? 'idle' : 'active';
  drone.updated_at = new Date().toISOString();
  return mockFetch({ ...drone });
}

/* ==================== ORDERS ==================== */
export async function getOrders() {
  return mockFetch([...ordersData]);
}

/* ==================== DELIVERIES ==================== */
export async function getDeliveries() {
  return mockFetch([...deliveriesData]);
}

/* ==================== PAYMENTS ==================== */
export async function getPayments() {
  return mockFetch([...paymentsData]);
}
