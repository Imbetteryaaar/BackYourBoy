// Central place for the backend URLs. In production set these in your host
// (e.g. Vercel env vars). Locally they default to the dev backend on :8000.
const RAW_API = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const API_URL = RAW_API.replace(/\/$/, '');
export const WS_URL =
  import.meta.env.VITE_WS_URL || API_URL.replace(/^http/, 'ws') + '/ws';
