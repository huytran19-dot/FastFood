const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function testLogin() {
  try {
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3307,
      user: 'root',
      password: 'huytran123',
      database: 'fastfood'
    });

    // Get user from database
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      ['huy@gmail.com']
    );

    if (users.length === 0) {
      console.log('❌ User not found!');
      await connection.end();
      return;
    }

    const user = users[0];
    console.log('✅ User found:');
    console.log('  ID:', user.id);
    console.log('  Email:', user.email);
    console.log('  Full Name:', user.full_name);
    console.log('  Password Hash:', user.password_hash ? user.password_hash.substring(0, 20) + '...' : 'NULL');

    // Test password
    const testPassword = 'admin123';
    console.log('\n🔐 Testing password:', testPassword);

    const isValid = await bcrypt.compare(testPassword, user.password_hash);
    console.log('  Result:', isValid ? '✅ VALID' : '❌ INVALID');

    if (!isValid) {
      console.log('\n🔧 Fixing password...');
      const newHash = await bcrypt.hash(testPassword, 10);
      await connection.execute(
        'UPDATE users SET password_hash = ? WHERE id = ?',
        [newHash, user.id]
      );
      console.log('✅ Password updated successfully!');
      
      // Verify again
      const [updatedUsers] = await connection.execute(
        'SELECT password_hash FROM users WHERE id = ?',
        [user.id]
      );
      const verifyAgain = await bcrypt.compare(testPassword, updatedUsers[0].password_hash);
      console.log('  Verification:', verifyAgain ? '✅ VALID' : '❌ STILL INVALID');
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testLogin();
