// src/api/auth.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function loginAdmin(email, password) {
  console.log("🔐 [API] Attempting login:", email);
  
  const res = await fetch(`${API_BASE_URL}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: 'include',
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  
  if (!res.ok) {
    console.error("❌ [API] Login failed:", data);
    throw new Error(data.error || data.message || "Login failed");
  }

  console.log("✅ [API] Login successful:", data);

  // Lưu token vào localStorage
  if (data.token) {
    localStorage.setItem("token", data.token);
  }
  if (data.user) {
    localStorage.setItem("user", JSON.stringify(data.user));
  }

  return data;
}

export async function getUsers(token) {
  const res = await fetch(`${API_BASE_URL}/admin/users`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }

  return res.json();
}

export async function updateUserStatus(token, userId, status) {
  const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });

  if (!res.ok) {
    throw new Error("Failed to update user status");
  }

  return res.json();
}
