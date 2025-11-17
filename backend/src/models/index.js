const { Sequelize } = require('sequelize');
require('dotenv').config();
const initModels = require('./init-models');

// Use environment variables directly (Railway MySQL)
const sequelize = new Sequelize(
  process.env.DB_NAME || 'railway',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
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
