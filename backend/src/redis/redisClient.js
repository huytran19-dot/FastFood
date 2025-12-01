// Redis client helper
// If Redis is not configured, functions will return null/do nothing gracefully
// Falls back to in-memory store when Redis is unavailable

const memoryStore = require('../services/memoryStore');

let redisClient = null;
let isConnected = false;

async function initRedis() {
  try {
    // Check if redis module is installed first
    try {
      require.resolve('redis');
    } catch (e) {
      // Redis module not installed, silently skip
      isConnected = false;
      return;
    }

    const redis = require('redis');
    const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
    const REDIS_PORT = process.env.REDIS_PORT || 6379;
    
    // Try to create client (works for both v3 and v4+)
    try {
      // Redis v4+ style
      redisClient = redis.createClient({
        socket: {
          host: REDIS_HOST,
          port: REDIS_PORT,
          connectTimeout: 2000,
          reconnectStrategy: false // Disable reconnection
        }
      });

      // Suppress error logging
      redisClient.on('error', () => {
        // Silently ignore errors
        isConnected = false;
      });

      redisClient.on('connect', () => {
        isConnected = true;
      });

      redisClient.on('ready', () => {
        isConnected = true;
      });

      // Connect to Redis (async for v4+)
      try {
        await redisClient.connect();
        console.log('✅ Redis connected');
        isConnected = true;
      } catch (error) {
        // Redis not available, use memory store silently
        isConnected = false;
        redisClient = null;
      }
    } catch (error) {
      // Fallback: try v3 style
      redisClient = redis.createClient({
        host: REDIS_HOST,
        port: REDIS_PORT,
        retry_strategy: () => null, // No retry
        enable_offline_queue: false
      });

      redisClient.on('error', () => {
        // Silently ignore errors
        isConnected = false;
      });

      redisClient.on('connect', () => {
        console.log('✅ Redis connected');
        isConnected = true;
      });
    }
  } catch (error) {
    // Silently fail
    isConnected = false;
  }
}

// Initialize Redis on module load (don't await, let it connect in background)
initRedis().catch(() => {
  // Ignore initialization errors
});

function getRedisClient() {
  return isConnected ? redisClient : null;
}

async function setJson(key, value, expireSeconds = null) {
  // Try Redis first
  if (redisClient && isConnected) {
    try {
      const jsonValue = JSON.stringify(value);
      
      // Handle both Redis v3 and v4+ APIs
      if (typeof redisClient.setEx === 'function') {
        // Redis v4+
        if (expireSeconds) {
          await redisClient.setEx(key, expireSeconds, jsonValue);
        } else {
          await redisClient.set(key, jsonValue);
        }
      } else {
        // Redis v3
        if (expireSeconds) {
          await new Promise((resolve, reject) => {
            redisClient.setex(key, expireSeconds, jsonValue, (err, reply) => {
              if (err) reject(err);
              else resolve(reply);
            });
          });
        } else {
          await new Promise((resolve, reject) => {
            redisClient.set(key, jsonValue, (err, reply) => {
              if (err) reject(err);
              else resolve(reply);
            });
          });
        }
      }
      return true;
    } catch (error) {
      // Silently fall through to memory store
    }
  }
  
  // Fallback to in-memory store
  return memoryStore.setMemory(key, value, expireSeconds);
}

async function getJson(key) {
  // Try Redis first
  if (redisClient && isConnected) {
    try {
      let value;
      
      // Handle both Redis v3 and v4+ APIs
      if (typeof redisClient.get === 'function' && redisClient.get.constructor.name === 'AsyncFunction') {
        // Redis v4+ (promise-based)
        value = await redisClient.get(key);
      } else {
        // Redis v3 (callback-based)
        value = await new Promise((resolve, reject) => {
          redisClient.get(key, (err, reply) => {
            if (err) reject(err);
            else resolve(reply);
          });
        });
      }
      
      if (value) {
        return JSON.parse(value);
      }
    } catch (error) {
      // Silently fall through to memory store
    }
  }
  
  // Fallback to in-memory store
  return memoryStore.getMemory(key);
}

module.exports = {
  getRedisClient,
  setJson,
  getJson
};

