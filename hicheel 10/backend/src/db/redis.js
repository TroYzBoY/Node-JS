const { createClient } = require("redis");

const redisUrl =
  process.env.REDIS_URL ||
  `redis://${process.env.REDIS_HOST || "127.0.0.1"}:${
    process.env.REDIS_PORT || 6379
  }`;

let connected = false;
let fallback = null;
let warned = false;

const client = createClient({
  url: redisUrl,
  socket: { reconnectStrategy: () => false },
});

client.on("error", (err) => {
  if (!warned) {
    console.warn("Redis error:", err.message);
    warned = true;
  }
});

function createFallbackClient() {
  const store = new Map();
  const expiries = new Map();

  const now = () => Date.now();
  const isExpired = (key) => {
    const expiresAt = expiries.get(key);
    if (!expiresAt) return false;
    if (now() > expiresAt) {
      expiries.delete(key);
      store.delete(key);
      return true;
    }
    return false;
  };

  return {
    async get(key) {
      if (isExpired(key)) return null;
      return store.has(key) ? store.get(key) : null;
    },
    async setEx(key, ttlSeconds, value) {
      store.set(key, value);
      expiries.set(key, now() + Number(ttlSeconds) * 1000);
      return "OK";
    },
    async del(key) {
      expiries.delete(key);
      store.delete(key);
      return 1;
    },
    async incr(key) {
      if (isExpired(key)) {
        store.delete(key);
      }
      const current = Number(store.get(key) || 0);
      const next = current + 1;
      store.set(key, String(next));
      return next;
    },
    async expire(key, ttlSeconds) {
      if (!store.has(key)) return 0;
      expiries.set(key, now() + Number(ttlSeconds) * 1000);
      return 1;
    },
    async quit() {
      return "OK";
    },
  };
}

async function getRedis() {
  if (fallback) return fallback;
  if (!connected) {
    try {
      await client.connect();
      connected = true;
    } catch (err) {
      if (!warned) {
        console.warn(
          "Redis not available. Falling back to in-memory cache/rate-limit. Not for production.",
          err.message
        );
        warned = true;
      }
      fallback = createFallbackClient();
      return fallback;
    }
  }
  return client;
}

module.exports = {
  getRedis,
};
