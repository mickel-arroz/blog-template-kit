import axiosLib, { AxiosHeaders } from 'axios';

// Compute a base URL that works both on server (Node) and client (browser)
export function getBaseUrl(): string {
  // Browser: relative URL so cookies/headers work under same origin
  if (typeof window !== 'undefined') return '';

  // Server: need absolute URL
  const raw =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_URL ||
    'http://localhost:3000';

  const hasProtocol = /^https?:\/\//i.test(raw);
  const proto = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const base = hasProtocol ? raw : `${proto}://${raw}`;
  return base.replace(/\/$/, '');
}

// Preconfigured Axios instance that prefixes requests with the base URL on server
const client = axiosLib.create({
  baseURL: getBaseUrl() || undefined,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Optional: Set or clear Authorization token for all requests
export function setAuthToken(token: string | null) {
  if (token) {
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete client.defaults.headers.common['Authorization'];
  }
}

// Request interceptor: you can enrich headers or log
client.interceptors.request.use(
  (config) => {
    // Normalize headers to AxiosHeaders instance
    if (!config.headers) config.headers = new AxiosHeaders();
    if (!(config.headers instanceof AxiosHeaders)) {
      config.headers = new AxiosHeaders(config.headers);
    }
    const headers = config.headers as AxiosHeaders;

    // Ensure JSON content-type when sending a body
    if (config.data && !headers.get('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    if (process.env.NODE_ENV !== 'production') {
      // Lightweight debug log (method + url)
      const method = (config.method || 'get').toUpperCase();
      const fullUrl = `${config.baseURL ?? ''}${config.url ?? ''}`;
      console.debug(`[HTTP] ${method} ${fullUrl}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: unify basic error logging without altering the thrown type
client.interceptors.response.use(
  (response) => response,
  (error) => {
    try {
      const status = error?.response?.status;
      const url = error?.config?.url;
      const method = (error?.config?.method || 'get').toUpperCase();
      const msg =
        error?.response?.data?.message || error?.message || 'Request failed';
      console.error(`[HTTP] ${method} ${url} -> ${status ?? 'ERR'}: ${msg}`);
    } catch {}
    return Promise.reject(error);
  }
);

// Export the configured axios instance as default and as a named export `axios`
export default client;
export { client as axios };
