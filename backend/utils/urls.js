const normalizeUrl = (url) => (url ? url.replace(/\/+$/, "") : url);

const getFrontendUrl = () =>
  normalizeUrl(process.env.FRONTEND_URL) || "http://localhost:3000";

const getPublicApiUrl = () =>
  normalizeUrl(process.env.API_PUBLIC_URL || process.env.BACKEND_URL);

/**
 * Email links should hit the public API (Render), which verifies then redirects
 * to the Vercel app. Avoids localhost links when FRONTEND_URL was unset locally.
 */
const buildEmailVerificationUrl = (rawToken) => {
  const encoded = encodeURIComponent(rawToken);
  const apiBase = getPublicApiUrl();

  if (apiBase) {
    return `${apiBase}/api/users/verify-email/redirect?token=${encoded}`;
  }

  return `${getFrontendUrl()}/verify-email?token=${encoded}`;
};

const buildFrontendVerifyResultUrl = (status, message) => {
  const base = `${getFrontendUrl()}/verify-email`;
  const params = new URLSearchParams({ status });
  if (message) params.set("message", message);
  return `${base}?${params.toString()}`;
};

const warnIfMisconfiguredForProduction = () => {
  if (process.env.NODE_ENV !== "production") return;

  const frontend = process.env.FRONTEND_URL || "";
  const api = getPublicApiUrl();

  if (!frontend || frontend.includes("localhost")) {
    console.warn(
      "[config] Set FRONTEND_URL to your live Vercel URL on Render (e.g. https://your-app.vercel.app)"
    );
  }
  if (!api) {
    console.warn(
      "[config] Set API_PUBLIC_URL to your Render backend URL so verification emails use a reachable link"
    );
  }
};

module.exports = {
  normalizeUrl,
  getFrontendUrl,
  getPublicApiUrl,
  buildEmailVerificationUrl,
  buildFrontendVerifyResultUrl,
  warnIfMisconfiguredForProduction,
};
