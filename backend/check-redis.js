// Script to check Redis connection
const redis = require('redis');

async function checkRedis() {
  console.log('🔍 Checking Redis connection...\n');
  
  try {
    const client = redis.createClient({
      socket: {
        host: '127.0.0.1',
        port: 6379,
        connectTimeout: 3000
      }
    });

    client.on('error', (err) => {
      console.log('❌ Redis connection failed:', err.message);
      console.log('\n💡 Solutions:');
      console.log('1. Make sure Docker Desktop is running');
      console.log('2. Run: docker run -d -p 6379:6379 --name redis-fastfood redis:latest');
      console.log('3. Or use WSL: sudo service redis-server start');
      console.log('\n⚠️  Code will use memory store as fallback.');
      process.exit(1);
    });

    await client.connect();
    console.log('✅ Redis connected successfully!');
    
    // Test write/read
    await client.set('test', 'hello');
    const value = await client.get('test');
    console.log('✅ Redis read/write test:', value === 'hello' ? 'PASSED' : 'FAILED');
    
    await client.quit();
    console.log('\n🎉 Redis is ready to use!');
    process.exit(0);
  } catch (error) {
    console.log('❌ Redis connection failed:', error.message);
    console.log('\n💡 Code will use memory store as fallback.');
    console.log('   This is fine for development, but data will be lost on server restart.');
    process.exit(1);
  }
}

checkRedis();

