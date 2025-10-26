// src/config/config.js
require('dotenv').config();

module.exports = {
  HOST: "127.0.0.1",   // hoặc IP của DB
  USER: "root",        // user MySQL của bạn
  PASSWORD: "123123",        // password MySQL (điền nếu có)
  DB: "fastfood",       // tên database bạn tạo
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};
