let BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Handle cases where the environment variable is literally the string '""' or "''" (often happens in Vercel settings)
if (BACKEND_URL === '""' || BACKEND_URL === "''") {
  BACKEND_URL = '';
}

if (!BACKEND_URL) {
  console.warn('[api] NEXT_PUBLIC_BACKEND_URL not set, falling back to default.');
}

// Strip trailing slash from BASE_URL to prevent double-slashes in requests
const BASE_URL = (BACKEND_URL || 'http://localhost:3001').replace(/\/$/, '');

export function resolveUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_URL}${cleanPath}`;
}

async function request(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('keytone_token') : null;
  
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const response = await fetch(`${BASE_URL}${cleanEndpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const errData = await response.json();
      errorMsg = errData.message || errorMsg;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  // Handle empty response bodies
  const text = await response.text();
  return text ? JSON.parse(text) : {};
}

type RequestBody = Record<string, unknown> | FormData | null | undefined;

export const api = {
  get: (endpoint: string, options?: RequestInit) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint: string, body?: RequestBody, options?: RequestInit) =>
    request(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: (endpoint: string, body?: RequestBody, options?: RequestInit) =>
    request(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: (endpoint: string, options?: RequestInit) => request(endpoint, { ...options, method: 'DELETE' }),
};
