'use strict';

const path = require('path');
const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

const Product = require('./products');
db.Product = Product.initModel(sequelize);

console.log('DEBUG db.Product:', db.Product); // kiểm tra xem đã init chưa

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
