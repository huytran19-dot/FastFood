export const mockUsers = [
  {
    user_id: 1,
    full_name: "Nguyễn Văn Admin",
    email: "admin@fastfood.vn",
    status: 1,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z"
  },
  {
    user_id: 2,
    full_name: "Lê Thị Chủ Quán",
    email: "owner@fastfood.vn",
    status: 1,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z"
  },
  {
    user_id: 3,
    full_name: "Trần Văn Khách",
    email: "customer1@gmail.com",
    status: 1,
    created_at: "2025-01-05T00:00:00Z",
    updated_at: "2025-01-05T00:00:00Z"
  }
];

export const userRoles = {
  1: 'admin',
  2: 'restaurant_owner',
  3: 'restaurant_owner'
};

export const mockRestaurants = [
  {
    restaurant_id: 1,
    owner_id: 2,
    name: "Fast Burger Drone",
    address: "123 Trần Hưng Đạo, Q1",
    phone: "0909000111",
    status: 1,
    rating: 4.7,
    description: "Burger giao hàng bằng drone nhanh chóng",
    created_at: "2025-01-02T00:00:00Z",
    updated_at: "2025-01-02T00:00:00Z"
  }
];

export const mockMenuItems = [
  {
    item_id: 11,
    restaurant_id: 1,
    name: "Burger Bò Phô Mai",
    price: 89000,
    image_url: "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg",
    is_available: true,
    description: "Burger bò Úc 100% với phô mai cheddar",
    created_at: "2025-01-02T00:00:00Z",
    updated_at: "2025-01-02T00:00:00Z"
  },
  {
    item_id: 12,
    restaurant_id: 1,
    name: "Gà Rán Giòn",
    price: 59000,
    image_url: "https://images.pexels.com/photos/60616/fried-chicken-chicken-fried-crunchy-60616.jpeg",
    is_available: true,
    description: "Gà rán giòn tan với gia vị bí mật",
    created_at: "2025-01-02T00:00:00Z",
    updated_at: "2025-01-02T00:00:00Z"
  },
  {
    item_id: 13,
    restaurant_id: 1,
    name: "Khoai Tây Chiên",
    price: 35000,
    image_url: "https://images.pexels.com/photos/1893556/pexels-photo-1893556.jpeg",
    is_available: true,
    description: "Khoai tây chiên giòn rụm",
    created_at: "2025-01-02T00:00:00Z",
    updated_at: "2025-01-02T00:00:00Z"
  },
  {
    item_id: 14,
    restaurant_id: 1,
    name: "Coca Cola",
    price: 15000,
    image_url: "https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg",
    is_available: true,
    description: "Nước ngọt Coca Cola 330ml",
    created_at: "2025-01-02T00:00:00Z",
    updated_at: "2025-01-02T00:00:00Z"
  }
];

export const mockOrders = [
  {
    order_id: 101,
    restaurant_id: 1,
    customer_id: 201,
    total_price: 232000,
    delivery_address: "12 Nguyễn Huệ, Q1",
    status: "PREPARING",
    created_at: "2025-10-08T09:00:00Z",
    updated_at: "2025-10-08T09:10:00Z"
  },
  {
    order_id: 102,
    restaurant_id: 1,
    customer_id: 202,
    total_price: 340000,
    delivery_address: "88 Lê Lợi, Q1",
    status: "DELIVERING",
    created_at: "2025-10-08T09:05:00Z",
    updated_at: "2025-10-08T09:20:00Z"
  },
  {
    order_id: 103,
    restaurant_id: 1,
    customer_id: 203,
    total_price: 178000,
    delivery_address: "45 Hai Bà Trưng, Q3",
    status: "COMPLETED",
    created_at: "2025-10-08T08:00:00Z",
    updated_at: "2025-10-08T08:45:00Z"
  },
  {
    order_id: 104,
    restaurant_id: 1,
    customer_id: 204,
    total_price: 89000,
    delivery_address: "78 Võ Văn Tần, Q3",
    status: "PENDING",
    created_at: "2025-10-08T09:30:00Z",
    updated_at: "2025-10-08T09:30:00Z"
  }
];

export const mockOrderItems = [
  { order_item_id: 1001, order_id: 101, item_id: 11, quantity: 2, price: 89000, note: "Không hành" },
  { order_item_id: 1002, order_id: 101, item_id: 12, quantity: 1, price: 59000 },
  { order_item_id: 1003, order_id: 102, item_id: 11, quantity: 3, price: 89000 },
  { order_item_id: 1004, order_id: 102, item_id: 13, quantity: 2, price: 35000 },
  { order_item_id: 1005, order_id: 103, item_id: 11, quantity: 2, price: 89000 },
  { order_item_id: 1006, order_id: 104, item_id: 11, quantity: 1, price: 89000 }
];

export const mockPayments = [
  { payment_id: 2001, order_id: 101, amount: 232000, method: "MOMO", status: "SUCCESS", created_at: "2025-10-08T09:01:00Z" },
  { payment_id: 2002, order_id: 102, amount: 340000, method: "VNPAY", status: "SUCCESS", created_at: "2025-10-08T09:06:00Z" },
  { payment_id: 2003, order_id: 103, amount: 178000, method: "COD", status: "SUCCESS", created_at: "2025-10-08T08:00:00Z" },
  { payment_id: 2004, order_id: 104, amount: 89000, method: "ZALOPAY", status: "PENDING", created_at: "2025-10-08T09:30:00Z" }
];

export const mockDrones = [
  { drone_id: 301, restaurant_id: 1, model: "DJI Air", capacity: 2.5, battery: 76, status: "EN_ROUTE" },
  { drone_id: 302, restaurant_id: 1, model: "DJI Mini", capacity: 1.5, battery: 92, status: "IDLE" },
  { drone_id: 303, restaurant_id: 1, model: "DJI Mavic", capacity: 3.0, battery: 45, status: "RETURNING" }
];

export const mockDeliveries = [
  {
    delivery_id: 501,
    order_id: 102,
    drone_id: 301,
    start_location: "123 Trần Hưng Đạo, Q1",
    end_location: "88 Lê Lợi, Q1",
    status: "EN_ROUTE",
    delivered_at: null
  },
  {
    delivery_id: 502,
    order_id: 103,
    drone_id: 302,
    start_location: "123 Trần Hưng Đạo, Q1",
    end_location: "45 Hai Bà Trưng, Q3",
    status: "DROPPED",
    delivered_at: "2025-10-08T08:40:00Z"
  }
];

export const mockLocations = [
  { location_id: 9001, drone_id: 301, latitude: 10.7769, longitude: 106.7009, altitude: 80.5, recorded_at: "2025-10-08T09:21:00Z" },
  { location_id: 9002, drone_id: 301, latitude: 10.7779, longitude: 106.7019, altitude: 82.0, recorded_at: "2025-10-08T09:22:00Z" }
];
