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

let usersData = [...mockUsers];
let restaurantsData = [...mockRestaurants];
let ordersData = [...mockOrders];
let paymentsData = [...mockPayments];
let dronesData = [...mockDrones];
let deliveriesData = [...mockDeliveries];

export async function getUsers() {
  return mockFetch([...usersData]);
}

export async function createUser(input) {
  const newUser = {
    user_id: Math.max(...usersData.map(u => u.user_id)) + 1,
    full_name: input.full_name || '',
    email: input.email || '',
    phone: input.phone,
    address: input.address,
    status: input.status ?? 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  usersData.push(newUser);
  userRoles[newUser.user_id] = input.role;

  return mockFetch(newUser);
}

export async function updateUserRole(user_id, role) {
  const user = usersData.find(u => u.user_id === user_id);
  if (!user) throw new Error('User not found');

  userRoles[user_id] = role;
  user.updated_at = new Date().toISOString();

  return mockFetch({ ...user });
}

export async function toggleUserStatus(user_id) {
  const user = usersData.find(u => u.user_id === user_id);
  if (!user) throw new Error('User not found');

  user.status = user.status === 1 ? 0 : 1;
  user.updated_at = new Date().toISOString();

  return mockFetch({ ...user });
}

export async function getRestaurants() {
  return mockFetch([...restaurantsData]);
}

export async function createRestaurant(input) {
  const newRestaurant = {
    ...input,
    restaurant_id: Math.max(...restaurantsData.map(r => r.restaurant_id)) + 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  restaurantsData.push(newRestaurant);
  return mockFetch(newRestaurant);
}

export async function updateRestaurant(restaurant_id, patch) {
  const idx = restaurantsData.findIndex(r => r.restaurant_id === restaurant_id);
  if (idx === -1) throw new Error('Restaurant not found');

  restaurantsData[idx] = {
    ...restaurantsData[idx],
    ...patch,
    updated_at: new Date().toISOString()
  };

  return mockFetch({ ...restaurantsData[idx] });
}

export async function getOrders(params) {
  let filtered = [...ordersData];

  if (params?.status) {
    filtered = filtered.filter(o => o.status === params.status);
  }

  if (params?.restaurant_id) {
    filtered = filtered.filter(o => o.restaurant_id === params.restaurant_id);
  }

  return mockFetch(filtered);
}

export async function updateOrderStatus(order_id, status) {
  const order = ordersData.find(o => o.order_id === order_id);
  if (!order) throw new Error('Order not found');

  order.status = status;
  order.updated_at = new Date().toISOString();

  return mockFetch({ ...order });
}

export async function getPayments() {
  return mockFetch([...paymentsData]);
}

export async function getDrones() {
  return mockFetch([...dronesData]);
}

export async function createDrone(input) {
  const newDrone = {
    ...input,
    drone_id: Math.max(...dronesData.map(d => d.drone_id)) + 1
  };

  dronesData.push(newDrone);
  return mockFetch(newDrone);
}

export async function updateDrone(drone_id, patch) {
  const idx = dronesData.findIndex(d => d.drone_id === drone_id);
  if (idx === -1) throw new Error('Drone not found');

  dronesData[idx] = { ...dronesData[idx], ...patch };
  return mockFetch({ ...dronesData[idx] });
}

export async function getDeliveries() {
  return mockFetch([...deliveriesData]);
}

export function getUserRole(user_id) {
  return userRoles[user_id];
}
