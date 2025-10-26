const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const AdminController = require('../controllers/adminAuthControllers'); // đường dẫn đúng tới controller

const SECRET_KEY = process.env.JWT_SECRET || "SECRET_KEY";

// 🧩 Middleware: kiểm tra token và vai trò admin
const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'Thiếu token xác thực' });

  const token = authHeader.split(' ')[1];
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token không hợp lệ' });
    if (user.role !== 'admin') return res.status(403).json({ message: 'Không có quyền truy cập' });

    req.user = user;
    next();
  });
};

// 🧠 Route đăng nhập (không cần middleware)
router.post('/login', AdminController.login);

// 👥 Route quản lý người dùng (cần xác thực admin)
router.get('/users', verifyAdmin, AdminController.getUsers);
router.patch('/users/:userId/status', verifyAdmin, AdminController.updateUserStatus);

module.exports = router;
