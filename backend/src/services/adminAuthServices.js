// src/services/adminServices.js
const { users, roles } = require('../models/init-models')(require('../config/db'));
const bcrypt = require('bcrypt');
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

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) throw new Error('Invalid password');

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role.name },
      SECRET_KEY,
      { expiresIn: '8h' }
    );

    return { token, user: { id: user.id, full_name: user.full_name, email: user.email } };
  }

  static async getAllUsers() {
    return await users.findAll({
      include: [{ model: roles, as: "role" }],
      attributes: { exclude: ['password_hash'] }
    });
  }

  static async changeUserStatus(userId, status) {
    const user = await users.findByPk(userId);
    if (!user) throw new Error('User not found');
    user.status = status;
    await user.save();
    return user;
  }
}

module.exports = AdminService;
