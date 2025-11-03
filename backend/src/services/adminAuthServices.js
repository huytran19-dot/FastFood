// src/services/adminServices.js
const db = require('../models');
const { users, roles } = db;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || "SECRET_KEY";

class AdminService {
  static async login(email, password) {
    const user = await users.findOne({
      where: { email },
      include: [{ model: roles, as: "role" }]
    });
    if (!user) throw new Error('User not found');
    if (user.role.name !== 'admin') throw new Error('Not an admin');

    // Admin dùng plain text password (không hash)
    if (password !== user.password_hash) throw new Error('Invalid password');

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role.name },
      SECRET_KEY,
      { expiresIn: '8h' }
    );

    return { token, user: { id: user.id, full_name: user.full_name, email: user.email } };
  }

  static async getAllUsers() {
    const usersList = await users.findAll({
      include: [{ model: roles, as: "role" }],
      attributes: { exclude: ['password_hash'] }
    });
    
    // Convert status từ số sang chuỗi cho frontend
    return usersList.map(user => {
      const userData = user.toJSON();
      userData.status = userData.status === 1 ? 'active' : 'inactive';
      return userData;
    });
  }

  static async changeUserStatus(userId, status) {
    const user = await users.findByPk(userId);
    if (!user) throw new Error('User not found');

    // ✅ FIX: Chuyển đổi giá trị status từ chuỗi ('active'/'inactive') sang số (1/0)
    // Điều này đảm bảo dữ liệu gửi lên khớp với kiểu dữ liệu TINYINT/BOOLEAN trong database.
    const newStatus = status === 'active' ? 1 : 0;
    user.status = newStatus;
    
    await user.save();
    return user;
  }

  static async deleteUser(userId) {
    const user = await users.findByPk(userId);
    if (!user) throw new Error('User not found');
    await user.destroy();
    return { message: 'User deleted successfully' };
  }

  static async createAdmin(email, password, full_name, phone) {
    // Kiểm tra email đã tồn tại
    const existingUser = await users.findOne({ where: { email } });
    if (existingUser) throw new Error('Email already exists');

    // Admin dùng plain text password (không hash)
    const password_hash = password;

    // Tìm role admin
    const adminRole = await roles.findOne({ where: { name: 'admin' } });
    if (!adminRole) throw new Error('Admin role not found');

    // Tạo user mới
    const user = await users.create({
      email,
      password_hash,
      full_name,
      phone,
      role_id: adminRole.id,
      // ✅ FIX: Đặt giá trị status là số 1 thay vì chuỗi 'active'
      status: 1 
    });

    return { 
      id: user.id, 
      email: user.email, 
      full_name: user.full_name 
    };
  }
}

module.exports = AdminService;