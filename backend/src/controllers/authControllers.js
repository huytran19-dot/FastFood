const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'fastfood-secret-key-change-in-production';

// POST /api/auth/login - Login for all users
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await db.users.findOne({ 
      where: { email },
      include: [{
        model: db.roles,
        as: 'role',
        attributes: ['id', 'name']
      }]
    });
    
    if (!user) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    const token = jwt.sign(
      { userId: user.id, roleId: user.role_id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password_hash, ...userWithoutPassword } = user.toJSON();

    res.json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// POST /api/auth/signup-user - Register customer
exports.signupUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const existingUser = await db.users.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    // Get user role ID
    const userRole = await db.roles.findOne({ where: { name: 'user' } });
    if (!userRole) {
      return res.status(500).json({ message: 'Role không tồn tại' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.users.create({
      full_name: name,
      email,
      phone,
      password_hash: hashedPassword,
      role_id: userRole.id
    });

    const token = jwt.sign(
      { userId: user.id, roleId: user.role_id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password_hash, ...userWithoutPassword } = user.toJSON();
    userWithoutPassword.role = userRole;

    res.status(201).json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Signup user error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// POST /api/auth/signup-owner - Register restaurant owner
exports.signupOwner = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const existingUser = await db.users.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    // Get restaurant role ID
    const ownerRole = await db.roles.findOne({ where: { name: 'restaurant' } });
    if (!ownerRole) {
      return res.status(500).json({ message: 'Role không tồn tại' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.users.create({
      full_name: name,
      email,
      phone,
      password_hash: hashedPassword,
      role_id: ownerRole.id
    });

    const token = jwt.sign(
      { userId: user.id, roleId: user.role_id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password_hash, ...userWithoutPassword } = user.toJSON();
    userWithoutPassword.role = ownerRole;

    res.status(201).json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Signup owner error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
