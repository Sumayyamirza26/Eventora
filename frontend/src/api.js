// All communication with the Express backend lives here.
// "/api" is proxied to http://localhost:5000 by vite.config.js

async function request(path, options = {}) {
  const res = await fetch('/api' + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}

export const api = {
  getEvents: (upcomingOnly = false) => request(`/events${upcomingOnly ? '?upcoming=true' : ''}`),
  createEvent: (body) => request('/events', { method: 'POST', body: JSON.stringify(body) }),
  updateEvent: (id, body) => request(`/events/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteEvent: (id) => request(`/events/${id}`, { method: 'DELETE' }),

  getRegistrations: (eventId = '') => request(`/registrations${eventId ? `?event=${eventId}` : ''}`),
  register: (body) => request('/registrations', { method: 'POST', body: JSON.stringify(body) }),
  deleteRegistration: (id) => request(`/registrations/${id}`, { method: 'DELETE' }),
};
