// In-memory counters for the /metrics endpoint. Resets on every restart
// and won't aggregate across pods, fine for now (single process), the
// upgrade path once horizontally scaled is moving these to Redis INCR.

type Counter = { count: number; totalMs: number; errors: number };

const groq: Counter = { count: 0, totalMs: 0, errors: 0 };
const http: Counter = { count: 0, totalMs: 0, errors: 0 };

const recordGroqCall = (durationMs: number, isError: boolean) => {
  groq.count += 1;
  groq.totalMs += durationMs;
  if (isError) groq.errors += 1;
};

const recordHttpRequest = (durationMs: number) => {
  http.count += 1;
  http.totalMs += durationMs;
};

const avg = (c: Counter) => (c.count === 0 ? 0 : Math.round(c.totalMs / c.count));

const snapshot = () => ({
  groq: { callCount: groq.count, avgLatencyMs: avg(groq), errorCount: groq.errors },
  http: { requestCount: http.count, avgLatencyMs: avg(http) },
});

export const metrics = {
  recordGroqCall,
  recordHttpRequest,
  snapshot,
};
