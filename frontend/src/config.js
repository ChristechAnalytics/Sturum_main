// API Configuration
// Automatically detects environment and uses appropriate API URL
const getApiUrl = () => {
  // If REACT_APP_API_URL is explicitly set, use it (for Vercel deployments)
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // For local development (localhost)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:4000';
  }
  
  // For staging/production deployments, try to infer from current host
  // or default to production backend
  const hostname = window.location.hostname;
  
  // If it's a Vercel preview/staging URL, you can set a staging backend here
  if (hostname.includes('staging') || hostname.includes('stg')) {
    return process.env.REACT_APP_STAGING_API_URL || 'https://sturum-backend-staging.onrender.com';
  }
  
  // Default to production backend for production deployments
  return 'https://sturum-backend.onrender.com';
};

const API_URL = getApiUrl();

// Debug: Log the API URL
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Development Mode');
  console.log('API_URL:', API_URL);
  console.log('REACT_APP_API_URL env var:', process.env.REACT_APP_API_URL);
  console.log('Current hostname:', window.location.hostname);
}

export default API_URL;
