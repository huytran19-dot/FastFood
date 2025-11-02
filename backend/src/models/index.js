const { Sequelize } = require('sequelize');
const config = require('../config/config.json');
const initModels = require('./init-models');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env] || {};

// Allow overriding DB host/port via environment for local docker setups
const DB_HOST = process.env.DB_HOST || dbConfig.host || '127.0.0.1';
const DB_PORT = process.env.DB_PORT || dbConfig.port || 3307;

// Initialize Sequelize
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: DB_HOST,
    port: DB_PORT,
    dialect: dbConfig.dialect,
    logging: false, // set to console.log to see SQL queries
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Initialize all models
const models = initModels(sequelize);

// Test connection
sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connected successfully');
  })
  .catch(err => {
    console.error('❌ Unable to connect to database:', err);
  });

// Export sequelize instance and models
module.exports = {
  sequelize,
  Sequelize,
  ...models
};
