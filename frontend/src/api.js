const TOKEN_KEY = 'eventora_admin_token';
const ADMIN_KEY = 'eventora_admin_info';

// Authentication storage helpers
export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  },
  clearToken: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
  },
  getAdmin: () => {
    try {
      const data = localStorage.getItem(ADMIN_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  setAdmin: (admin) => {
    if (admin) localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
    else localStorage.removeItem(ADMIN_KEY);
  },
  isAuthenticated: () => Boolean(localStorage.getItem(TOKEN_KEY)),
};

// Resolves the backend API base URL correctly for local Vite dev and Render deployment
export function resolveApiBaseUrl() {
  const envUrl = (import.meta.env.VITE_API_URL || '').trim();

  // If no env variable is specified:
  // In development, use relative '/api' (proxied by Vite to localhost:5000)
  if (!envUrl) {
    return '/api';
  }

  // Strip trailing slashes
  const cleanUrl = envUrl.replace(/\/+$/, '');

  // If VITE_API_URL already ends with /api, use it as is
  if (cleanUrl.endsWith('/api')) {
    return cleanUrl;
  }

  // Otherwise append /api
  return `${cleanUrl}/api`;
}

// All communication with the Express backend lives here.
async function request(path, options = {}) {
  const token = authStorage.getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const apiBase = resolveApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const targetUrl = `${apiBase}${cleanPath}`;

  const res = await fetch(targetUrl, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401 && !path.includes('/login')) {
      authStorage.clearToken();
    }
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

export const api = {
  // Authentication
  login: async (credentials) => {
    let data;
    try {
      data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    } catch (err) {
      // Fallback to /admin/login if /auth/login route is not found
      if (err.message && (err.message.includes('API route not found') || err.message.includes('404'))) {
        data = await request('/admin/login', {
          method: 'POST',
          body: JSON.stringify(credentials),
        });
      } else {
        throw err;
      }
    }

    if (data?.token) {
      authStorage.setToken(data.token);
      authStorage.setAdmin(data.admin);
    }
    return data;
  },

  verifyAuth: async () => {
    try {
      return await request('/auth/verify');
    } catch (err) {
      if (err.message && (err.message.includes('API route not found') || err.message.includes('404'))) {
        return await request('/admin/verify');
      }
      throw err;
    }
  },

  logout: () => {
    authStorage.clearToken();
  },

  getToken: authStorage.getToken,
  getAdmin: authStorage.getAdmin,
  isAuthenticated: authStorage.isAuthenticated,
  getBaseUrl: resolveApiBaseUrl,

  // Events
  getEvents: (options = false) => {
    if (typeof options === 'boolean') {
      return request(`/events${options ? '?upcoming=true' : ''}`);
    }
    const params = new URLSearchParams();
    if (options.upcoming) params.append('upcoming', 'true');
    if (options.category && options.category !== 'All') params.append('category', options.category);
    if (options.search && options.search.trim()) params.append('search', options.search.trim());
    const qs = params.toString();
    return request(`/events${qs ? `?${qs}` : ''}`);
  },

  getEvent: (id) => request(`/events/${id}`),

  createEvent: (body) =>
    request('/events', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  updateEvent: (id, body) =>
    request(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  deleteEvent: (id) =>
    request(`/events/${id}`, { method: 'DELETE' }),

  // Registrations
  getRegistrations: (eventId = '') =>
    request(`/registrations${eventId ? `?event=${eventId}` : ''}`),

  register: (body) =>
    request('/registrations', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  deleteRegistration: (id) =>
    request(`/registrations/${id}`, { method: 'DELETE' }),
};
