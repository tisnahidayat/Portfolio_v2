const store = new Map();
const TTL = 5 * 60 * 1000; // 5 minutes

export function getCache(key) {
  const entry = store.get(key);
  if (!entry || Date.now() > entry.exp) {
    store.delete(key);
    return null;
  }
  return entry.data;
}

export function setCache(key, data, ttl = TTL) {
  store.set(key, { data, exp: Date.now() + ttl });
}

export function clearCache(key) {
  if (key) store.delete(key);
  else store.clear();
}
