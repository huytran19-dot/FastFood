// src/config/config.js
require('dotenv').config();

module.exports = {
  HOST: "127.0.0.1",   // hoặc IP của DB
  PORT: 3306,          // MySQL port (default: 3306, Docker: 3307)
  USER: "root",        // user MySQL của bạn
  PASSWORD: "your_password_here",        // password MySQL
  DB: "fastfood",       // tên database bạn tạo
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};
