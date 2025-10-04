const express = require('express');
const sequelize = require('./src/config/db');
const productRoutes = require('./src/routes/productRoutes');

const app = express();
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);

// Kết nối DB và chạy server
sequelize.sync({ alter: false })
  .then(() => {
    console.log("✅ Database connected and synced");
    app.listen(8000, () => {
      console.log("🚀 Server running on port 8000");
    });
  })
  .catch((err) => {
    console.error("❌ Database connection error:", err);
  });
