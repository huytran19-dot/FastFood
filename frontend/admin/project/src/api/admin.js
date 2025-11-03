const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
function getAuthToken() {
  const stored = sessionStorage.getItem('auth');
  if (stored) {
    try {
      const auth = JSON.parse(stored);
      return auth.token;
    } catch {
      return null;
    }
  }
  return null;
}

/* ==================== USERS ==================== */
export async function getUsers() {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch users');
  const data = await response.json();
  return data.users || data;
}

export async function createUser(input) {
  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input)
  });
  if (!response.ok) throw new Error('Failed to create user');
  return await response.json();
}

export async function updateUserRole(user_id, role) {
  const response = await fetch(`${API_BASE_URL}/admin/users/${user_id}/role`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ role })
  });
  if (!response.ok) throw new Error('Failed to update user role');
  return await response.json();
}

export async function toggleUserStatus(user_id, status) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/admin/users/${user_id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });
  if (!response.ok) throw new Error('Failed to toggle user status');
  return await response.json();
}

export async function deleteUser(user_id) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/admin/users/${user_id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Failed to delete user');
  return await response.json();
}

/* ==================== RESTAURANTS ==================== */
export async function getRestaurants() {
  const response = await fetch(`${API_BASE_URL}/admin/restaurants`, {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to fetch restaurants');
  const data = await response.json();
  return data.restaurants || data;
}

export async function createRestaurant(input) {
  const response = await fetch(`${API_BASE_URL}/admin/restaurants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input)
  });
  if (!response.ok) throw new Error('Failed to create restaurant');
  return await response.json();
}

export async function toggleRestaurantStatus(restaurant_id) {
  const response = await fetch(`${API_BASE_URL}/admin/restaurants/${restaurant_id}/toggle-status`, {
    method: 'PUT',
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to toggle restaurant status');
  return await response.json();
}

export async function approveRestaurant(restaurant_id) {
  const response = await fetch(`${API_BASE_URL}/admin/restaurants/${restaurant_id}/approve`, {
    method: 'PUT',
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to approve restaurant');
  return await response.json();
}

export async function rejectRestaurant(restaurant_id, reason) {
  const response = await fetch(`${API_BASE_URL}/admin/restaurants/${restaurant_id}/reject`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ reason })
  });
  if (!response.ok) throw new Error('Failed to reject restaurant');
  return await response.json();
}

/* ==================== DRONES ==================== */
export async function getDrones() {
  const response = await fetch(`${API_BASE_URL}/admin/drones`, {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to fetch drones');
  const data = await response.json();
  return data.drones || data;
}

export async function createDrone(input) {
  const response = await fetch(`${API_BASE_URL}/admin/drones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input)
  });
  if (!response.ok) throw new Error('Failed to create drone');
  return await response.json();
}

export async function updateDrone(drone_id, patch) {
  const response = await fetch(`${API_BASE_URL}/admin/drones/${drone_id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(patch)
  });
  if (!response.ok) throw new Error('Failed to update drone');
  return await response.json();
}

export async function toggleDroneStatus(drone_id) {
  const response = await fetch(`${API_BASE_URL}/admin/drones/${drone_id}/toggle-status`, {
    method: 'PUT',
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to toggle drone status');
  return await response.json();
}

/* ==================== ORDERS ==================== */
export async function getOrders() {
  const response = await fetch(`${API_BASE_URL}/admin/orders`, {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to fetch orders');
  const data = await response.json();
  return data.orders || data;
}

/* ==================== DELIVERIES ==================== */
export async function getDeliveries() {
  const response = await fetch(`${API_BASE_URL}/admin/deliveries`, {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to fetch deliveries');
  const data = await response.json();
  return data.deliveries || data;
}

/* ==================== PAYMENTS ==================== */
export async function getPayments() {
  const response = await fetch(`${API_BASE_URL}/admin/payments`, {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to fetch payments');
  const data = await response.json();
  return data.payments || data;
}
