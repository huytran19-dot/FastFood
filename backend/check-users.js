const mysql = require('mysql2/promise');

async function checkUsers() {
  try {
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3307,
      user: 'root',
      password: 'huytran123', // Từ backend config
      database: 'fastfood'
    });

    console.log('✅ Connected to database\n');

    // 1. Check roles table
    console.log('📋 Roles in database:');
    const [roles] = await connection.execute('SELECT * FROM roles');
    console.table(roles);

    // 2. Check users
    console.log('\n👥 Users in database:');
    const [users] = await connection.execute(`
      SELECT u.id, u.email, u.full_name, u.role_id, r.name as role_name, u.created_at 
      FROM users u 
      LEFT JOIN roles r ON u.role_id = r.id
      ORDER BY u.id
    `);
    
    if (users.length === 0) {
      console.log('❌ No users found! Database is empty.');
      console.log('\n💡 You need to add users first. Do you want me to create demo users?');
    } else {
      console.table(users);
      
      // Check if admin exists
      const adminUser = users.find(u => u.role_name === 'admin');
      if (adminUser) {
        console.log('\n✅ Admin user found:');
        console.log(`   Email: ${adminUser.email}`);
        console.log(`   Name: ${adminUser.full_name}`);
      } else {
        console.log('\n⚠️  No admin user found!');
      }
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkUsers();
