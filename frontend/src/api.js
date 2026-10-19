const TOKEN_KEY = 'eventora_admin_token';
const ADMIN_KEY = 'eventora_admin_info';

const STUDENT_TOKEN_KEY = 'eventora_student_token';
const STUDENT_KEY = 'eventora_student_info';

// Admin authentication storage helpers
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

// Student authentication storage helpers
export const studentStorage = {
  getToken: () => localStorage.getItem(STUDENT_TOKEN_KEY),
  setToken: (token) => {
    if (token) localStorage.setItem(STUDENT_TOKEN_KEY, token);
    else localStorage.removeItem(STUDENT_TOKEN_KEY);
  },
  clearToken: () => {
    localStorage.removeItem(STUDENT_TOKEN_KEY);
    localStorage.removeItem(STUDENT_KEY);
  },
  getStudent: () => {
    try {
      const data = localStorage.getItem(STUDENT_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  setStudent: (student) => {
    if (student) localStorage.setItem(STUDENT_KEY, JSON.stringify(student));
    else localStorage.removeItem(STUDENT_KEY);
  },
  isAuthenticated: () => Boolean(localStorage.getItem(STUDENT_TOKEN_KEY)),
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
  // Determine whether to send student or admin token
  const isStudentRoute = path.startsWith('/students') || path.startsWith('/student');
  const token = isStudentRoute
    ? studentStorage.getToken() || authStorage.getToken()
    : authStorage.getToken() || studentStorage.getToken();

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
    if (res.status === 401) {
      if (isStudentRoute && !path.includes('/login') && !path.includes('/signup')) {
        studentStorage.clearToken();
      } else if (!path.includes('/login')) {
        authStorage.clearToken();
      }
    }
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

export const api = {
  // Admin Authentication
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

  // Student Authentication & Storage
  studentSignup: async (formData) => {
    const data = await request('/students/signup', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
    if (data?.token) {
      studentStorage.setToken(data.token);
      studentStorage.setStudent(data.student);
    }
    return data;
  },

  studentLogin: async (credentials) => {
    const data = await request('/students/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (data?.token) {
      studentStorage.setToken(data.token);
      studentStorage.setStudent(data.student);
    }
    return data;
  },

  studentLogout: () => {
    studentStorage.clearToken();
  },

  isStudentAuthenticated: studentStorage.isAuthenticated,
  getStudent: studentStorage.getStudent,
  getStudentToken: studentStorage.getToken,

  // Student Profile & Activities
  getStudentProfile: () => request('/students/profile'),

  updateStudentProfile: (payload) =>
    request('/students/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  getMyRegistrations: () => request('/students/my-registrations'),

  cancelMyRegistration: (registrationId) =>
    request(`/students/cancel-registration/${registrationId}`, {
      method: 'POST',
    }),

  getNotifications: () => request('/students/notifications'),

  markNotificationRead: (id) =>
    request(`/students/notifications/${id}/read`, {
      method: 'PUT',
    }),

  markAllNotificationsRead: () =>
    request('/students/notifications/read-all', {
      method: 'PUT',
    }),

  getMyCertificates: () => request('/students/certificates'),

  // Events
  getEvents: (options = false) => {
    if (typeof options === 'boolean') {
      return request(`/events${options ? '?upcoming=true' : ''}`);
    }
    const params = new URLSearchParams();
    if (options.upcoming) params.append('upcoming', 'true');
    if (options.includeDrafts) params.append('includeDrafts', 'true');
    if (options.status && options.status !== 'All') params.append('status', options.status);
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

  // Registrations & Waitlist
  getRegistrations: (eventId = '') =>
    request(`/registrations${eventId ? `?event=${eventId}` : ''}`),

  getTicket: (code) =>
    request(`/registrations/ticket/${code}`),

  register: (body) =>
    request('/registrations', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  checkIn: (payload) =>
    request('/registrations/check-in', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  undoCheckIn: (payload) =>
    request('/registrations/undo-check-in', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getStats: async (eventId) => {
    try {
      return await request(`/registrations/stats/${eventId}`);
    } catch (err) {
      if (err.message && (err.message.includes('API route not found') || err.message.includes('404'))) {
        try {
          return await request(`/events/${eventId}/stats`);
        } catch {
          return await request(`/stats/${eventId}`);
        }
      }
      throw err;
    }
  },

  deleteRegistration: (id) =>
    request(`/registrations/${id}`, { method: 'DELETE' }),

  // Announcements & Event Communication Centre
  getAnnouncements: async (eventId = '') => {
    try {
      const cleanId = (eventId || '').trim();
      return await request(`/announcements${cleanId ? `?event=${cleanId}` : ''}`);
    } catch (err) {
      if (err.message && (err.message.includes('API route not found') || err.message.includes('404')) && eventId) {
        return await request(`/events/${eventId}/announcements`);
      }
      throw err;
    }
  },

  createAnnouncement: async (body) => {
    try {
      return await request('/announcements', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    } catch (err) {
      if (err.message && (err.message.includes('API route not found') || err.message.includes('404')) && body?.event) {
        return await request(`/events/${body.event}/announcements`, {
          method: 'POST',
          body: JSON.stringify(body),
        });
      }
      throw err;
    }
  },

  deleteAnnouncement: (id) =>
    request(`/announcements/${id}`, { method: 'DELETE' }),
};
