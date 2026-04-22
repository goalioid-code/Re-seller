const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

let redis;
let useMemoryFallback = false;
const memoryStorage = new Map();

try {
  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 1, // Kita batasi retry agar cepat beralih ke fallback
    retryStrategy: (times) => {
      if (times > 3) {
        console.warn('[Redis] ⚠️ Failed to connect after 3 attempts. Using memory fallback.');
        useMemoryFallback = true;
        return null; // Berhenti mencoba
      }
      return 1000;
    },
  });

  redis.on('error', (err) => {
    // Jangan crash, biarkan retryStrategy yang menghandle fallback
    if (!useMemoryFallback) {
      console.error('[Redis] 🔴 Connection error, retrying...');
    }
  });

  redis.on('connect', () => {
    console.log('[Redis] 🟢 Connected to Redis');
    useMemoryFallback = false;
  });
} catch (e) {
  console.error('[Redis] 🔴 Initialization error, using memory fallback.');
  useMemoryFallback = true;
}

// Wrapper untuk mendukung fallback otomatis
const redisWrapper = {
  get: async (key) => {
    if (useMemoryFallback) return memoryStorage.get(key);
    try {
      return await redis.get(key);
    } catch (e) {
      return memoryStorage.get(key);
    }
  },
  set: async (key, value, mode, duration) => {
    if (useMemoryFallback) {
      memoryStorage.set(key, value);
      if (mode === 'EX') {
        setTimeout(() => memoryStorage.delete(key), duration * 1000);
      }
      return 'OK';
    }
    try {
      return await redis.set(key, value, mode, duration);
    } catch (e) {
      memoryStorage.set(key, value);
      return 'OK';
    }
  },
  del: async (key) => {
    if (useMemoryFallback) return memoryStorage.delete(key);
    try {
      return await redis.del(key);
    } catch (e) {
      return memoryStorage.delete(key);
    }
  },
  // Tambahkan fungsi lain jika diperlukan (publish/subscribe dll)
};

module.exports = redisWrapper;
