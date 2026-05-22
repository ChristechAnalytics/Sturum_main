const normalizeUrl = (url) => (url ? url.replace(/\/+$/, "") : url);

const parseOriginList = (value) =>
  (value || "")
    .split(",")
    .map((s) => normalizeUrl(s.trim()))
    .filter(Boolean);

const buildAllowedOrigins = () => {
  const fromEnv = [
    ...parseOriginList(process.env.FRONTEND_URL),
    ...parseOriginList(process.env.ALLOWED_ORIGINS),
  ];

  const defaults = [
    "http://localhost:3000",
    "https://localhost:3000",
    "http://127.0.0.1:3000",
  ];

  return [...new Set([...fromEnv, ...defaults])];
};

const isVercelOrigin = (origin) => {
  try {
    const { hostname } = new URL(origin);
    return hostname === "vercel.app" || hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
};

const isOriginAllowed = (origin, allowedOrigins) => {
  if (!origin) return true;

  const normalized = normalizeUrl(origin);
  if (allowedOrigins.includes(normalized)) return true;

  const allowVercel =
    process.env.ALLOW_VERCEL_ORIGINS !== "false" &&
    (process.env.NODE_ENV === "production" || process.env.ALLOW_VERCEL_ORIGINS === "true");

  if (allowVercel && isVercelOrigin(origin)) return true;

  return false;
};

const createCorsOptions = (allowedOrigins) => ({
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (isOriginAllowed(origin, allowedOrigins)) {
      return callback(null, normalizeUrl(origin));
    }

    console.warn(`[CORS] Blocked origin: ${origin}`);
    console.warn(`[CORS] Allowed: ${allowedOrigins.join(", ") || "(none)"}`);
    // Do not pass Error — that becomes a 500 without CORS headers in the browser
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

module.exports = {
  buildAllowedOrigins,
  isOriginAllowed,
  createCorsOptions,
  normalizeUrl,
};
