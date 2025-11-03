// Script để hash lại password cho các user hiện có trong database
const bcrypt = require('bcryptjs');
const db = require('./src/models');
const { users } = db;

async function hashExistingPasswords() {
  try {
    console.log('🔄 Đang hash lại passwords...');
    
    // Danh sách users với password hiện tại (plain text)
    const usersToUpdate = [
      { email: 'admin@fastfood.vn', plainPassword: 'admin1' },
    ];

    for (const userData of usersToUpdate) {
      const user = await users.findOne({ where: { email: userData.email } });
      
      if (user) {
        // Hash password với salt rounds = 10
        const hashedPassword = await bcrypt.hash(userData.plainPassword, 10);
        
        // Update password_hash
        user.password_hash = hashedPassword;
        await user.save();
        
        console.log(`✅ Đã hash password cho: ${userData.email}`);
        console.log(`   Plain: ${userData.plainPassword}`);
        console.log(`   Hash: ${hashedPassword.substring(0, 30)}...`);
      } else {
        console.log(`⚠️  Không tìm thấy user: ${userData.email}`);
      }
    }
    
    console.log('\n✅ Hoàn tất! Tất cả passwords đã được hash.');
    console.log('Bây giờ bạn có thể đăng nhập với password gốc.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

hashExistingPasswords();
