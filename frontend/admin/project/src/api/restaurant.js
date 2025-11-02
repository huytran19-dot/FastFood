const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function getMyRestaurant(owner_user_id) {
  const response = await fetch(`${API_BASE_URL}/restaurant/my-restaurant`, {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Restaurant not found');
  const data = await response.json();
  return data.restaurant || data;
}

export async function updateMyRestaurant(owner_user_id, patch) {
  const response = await fetch(`${API_BASE_URL}/restaurant/my-restaurant`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(patch)
  });
  if (!response.ok) throw new Error('Failed to update restaurant');
  return await response.json();
}

export async function getMenuItems(restaurant_id) {
  const response = await fetch(`${API_BASE_URL}/restaurant/${restaurant_id}/menu`, {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to fetch menu items');
  const data = await response.json();
  return data.items || data;
}

export async function createMenuItem(input) {
  const response = await fetch(`${API_BASE_URL}/restaurant/menu`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input)
  });
  if (!response.ok) throw new Error('Failed to create menu item');
  return await response.json();
}

export async function updateMenuItem(item_id, patch) {
  const response = await fetch(`${API_BASE_URL}/restaurant/menu/${item_id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(patch)
  });
  if (!response.ok) throw new Error('Failed to update menu item');
  return await response.json();
}

export async function deleteMenuItem(item_id) {
  const response = await fetch(`${API_BASE_URL}/restaurant/menu/${item_id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to delete menu item');
  return await response.json();
}

export async function getOrdersByRestaurant(restaurant_id, status) {
  const url = status 
    ? `${API_BASE_URL}/restaurant/${restaurant_id}/orders?status=${status}`
    : `${API_BASE_URL}/restaurant/${restaurant_id}/orders`;
  
  const response = await fetch(url, {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to fetch orders');
  const data = await response.json();
  return data.orders || data;
}

export async function getOrderItems(order_id) {
  const response = await fetch(`${API_BASE_URL}/restaurant/orders/${order_id}/items`, {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to fetch order items');
  const data = await response.json();
  return data.items || data;
}

export async function updateOrderStatus(order_id, nextStatus) {
  const response = await fetch(`${API_BASE_URL}/restaurant/orders/${order_id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ status: nextStatus })
  });
  if (!response.ok) throw new Error('Failed to update order status');
  return await response.json();
}

export async function getDronesByRestaurant(restaurant_id) {
  const response = await fetch(`${API_BASE_URL}/restaurant/${restaurant_id}/drones`, {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to fetch drones');
  const data = await response.json();
  return data.drones || data;
}

export async function getDeliveriesByRestaurant(restaurant_id) {
  const response = await fetch(`${API_BASE_URL}/restaurant/${restaurant_id}/deliveries`, {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to fetch deliveries');
  const data = await response.json();
  return data.deliveries || data;
}

export async function getLastLocation(drone_id) {
  const response = await fetch(`${API_BASE_URL}/restaurant/drones/${drone_id}/last-location`, {
    credentials: 'include'
  });
  if (!response.ok) return null;
  const data = await response.json();
  return data.location || data;
}
