const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const sequelize = require('./src/config/db');
const uploadRoutes = require('./src/routes/uploadRoutes'); // nếu có upload feature
const adminRoutes = require('./src/routes/adminAuthRoutes');   // admin module

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174', 
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:5177'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/upload', uploadRoutes); // nếu chưa có, bạn có thể comment tạm
app.use('/api/admin', adminRoutes);

// Kết nối DB và chạy server
sequelize.sync({ alter: false })
  .then(() => {
    console.log("✅ Database connected and synced");
    app.listen(8000, () => console.log("🚀 Server running on port 8000"));
  })
  .catch(err => console.error("❌ Database connection error:", err));
