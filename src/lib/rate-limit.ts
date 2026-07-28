const hits = new Map<string, { count: number; reset: number }>();
export function rateLimit(key: string, limit = 20, windowMs = 60_000) {
  const now = Date.now(); const current = hits.get(key);
  if (!current || current.reset < now) { hits.set(key, { count: 1, reset: now + windowMs }); return true; }
  current.count++; return current.count <= limit;
}
