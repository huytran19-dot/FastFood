// Test script to verify database connection
require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    dialect: 'mysql',
    logging: console.log
  }
);

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    console.log('Database:', process.env.DB_NAME);
    console.log('Host:', process.env.DB_HOST);
    console.log('Port:', process.env.DB_PORT);
    console.log('User:', process.env.DB_USER);
    
    await sequelize.authenticate();
    console.log('✅ Connection established successfully.');
    
    // Query restaurants table
    console.log('\n📊 Querying restaurants table...');
    const [results] = await sequelize.query('SELECT id, name, owner_id, created_at FROM restaurants ORDER BY id DESC LIMIT 5');
    
    console.log('\n📋 Last 5 restaurants in database:');
    console.table(results);
    
    // Count total restaurants
    const [countResult] = await sequelize.query('SELECT COUNT(*) as total FROM restaurants');
    console.log(`\n📈 Total restaurants in database: ${countResult[0].total}`);
    
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
  } finally {
    await sequelize.close();
  }
}

testConnection();
