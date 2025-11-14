// Redis client helper
// If Redis is not configured, functions will return null/do nothing gracefully
// Falls back to in-memory store when Redis is unavailable

const memoryStore = require('../services/memoryStore');

let redisClient = null;
let isConnected = false;

async function initRedis() {
  try {
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
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              console.warn('⚠️ Redis: Max retries reached, continuing without Redis');
              return false;
            }
            return Math.min(retries * 100, 3000);
          }
        }
      });

      redisClient.on('error', (err) => {
        console.warn('⚠️ Redis Client Error:', err.message);
        isConnected = false;
      });

      redisClient.on('connect', () => {
        console.log('✅ Redis connected');
        isConnected = true;
      });

      redisClient.on('ready', () => {
        isConnected = true;
      });

      // Connect to Redis (async for v4+)
      try {
        await redisClient.connect();
        isConnected = true;
      } catch (error) {
        console.warn('⚠️ Redis connection failed, continuing without Redis:', error.message);
        isConnected = false;
      }
    } catch (error) {
      // Fallback: try v3 style
      redisClient = redis.createClient({
        host: REDIS_HOST,
        port: REDIS_PORT,
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            console.warn('⚠️ Redis connection refused, continuing without Redis');
            return null;
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Retry time exhausted');
          }
          if (options.attempt > 10) {
            return undefined;
          }
          return Math.min(options.attempt * 100, 3000);
        }
      });

      redisClient.on('error', (err) => {
        console.warn('⚠️ Redis Client Error:', err.message);
        isConnected = false;
      });

      redisClient.on('connect', () => {
        console.log('✅ Redis connected');
        isConnected = true;
      });
    }
  } catch (error) {
    console.warn('⚠️ Redis not available, continuing without Redis:', error.message);
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
      console.error('Redis setJson error, falling back to memory:', error.message);
      // Fall through to memory store
    }
  }
  
  // Fallback to in-memory store
  console.log(`💾 [MemoryStore] Storing ${key} (Redis unavailable)`);
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
      console.error('Redis getJson error, falling back to memory:', error.message);
      // Fall through to memory store
    }
  }
  
  // Fallback to in-memory store
  const memoryValue = memoryStore.getMemory(key);
  if (memoryValue) {
    console.log(`💾 [MemoryStore] Retrieved ${key} from memory (Redis unavailable)`);
  }
  return memoryValue;
}

module.exports = {
  getRedisClient,
  setJson,
  getJson
};

