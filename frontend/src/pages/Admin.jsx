import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';
import EventForm from '../components/EventForm.jsx';
import { formatDate, categoryColors } from '../utils.js';

export default function Admin() {
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [filterEvent, setFilterEvent] = useState(''); // '' = all events
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', text }
  const [formState, setFormState] = useState({ open: false, event: null });

  const loadAll = useCallback(async () => {
    setError('');
    try {
      const [ev, reg] = await Promise.all([api.getEvents(), api.getRegistrations()]);
      setEvents(ev);
      setRegistrations(reg);
    } catch (err) {
      setError(err.message || 'Could not load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Hide the toast after 3 seconds
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const closeForm = useCallback(() => setFormState({ open: false, event: null }), []);

  const handleSaved = (message) => {
    closeForm();
    setToast({ type: 'success', text: message });
    loadAll();
  };

  const handleDeleteEvent = async (event) => {
    if (!window.confirm(`Delete "${event.title}"? Its registrations will be deleted too.`)) return;
    try {
      await api.deleteEvent(event._id);
      if (filterEvent === event._id) setFilterEvent('');
      setToast({ type: 'success', text: 'Event deleted' });
      loadAll();
    } catch (err) {
      setToast({ type: 'error', text: err.message });
    }
  };

  const handleDeleteRegistration = async (reg) => {
    if (!window.confirm(`Remove ${reg.name} from this event?`)) return;
    try {
      await api.deleteRegistration(reg._id);
      setToast({ type: 'success', text: 'Registration removed' });
      loadAll();
    } catch (err) {
      setToast({ type: 'error', text: err.message });
    }
  };

  const showStudents = (eventId) => {
    setFilterEvent(eventId);
    document.getElementById('students')?.scrollIntoView({ behavior: 'smooth' });
  };

  const visibleRegistrations = filterEvent
    ? registrations.filter((r) => r.event?._id === filterEvent)
    : registrations;

  const today = new Date().toISOString().slice(0, 10);
  const upcomingCount = events.filter((e) => e.date.slice(0, 10) >= today).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500">Manage events and see who has registered.</p>
        </div>
        <button onClick={() => setFormState({ open: true, event: null })} className="btn-primary">
          ＋ Add Event
        </button>
      </div>

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          ['Total events', events.length, 'from-indigo-500 to-violet-500'],
          ['Upcoming events', upcomingCount, 'from-fuchsia-500 to-pink-500'],
          ['Total registrations', registrations.length, 'from-emerald-500 to-teal-500'],
        ].map(([label, value, gradient]) => (
          <div key={label} className="animate-fade-up rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className={`mb-3 h-1.5 w-12 rounded-full bg-gradient-to-r ${gradient}`} />
            <p className="text-3xl font-extrabold text-slate-900">{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-8 rounded-2xl bg-red-50 p-5 text-red-700 ring-1 ring-red-200">
          <p className="font-semibold">{error}</p>
          <p className="text-sm">Make sure the backend server and MongoDB are running.</p>
          <button onClick={() => { setLoading(true); loadAll(); }} className="btn-ghost mt-3">Try again</button>
        </div>
      )}

      {/* Events list */}
      <section className="mt-10">
        <h2 className="mb-4 text-xl font-bold text-slate-900">Events</h2>
        {loading ? (
          <div className="h-40 animate-pulse rounded-2xl bg-slate-200" />
        ) : events.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center text-slate-500 ring-1 ring-slate-200">
            No events yet. Click “Add Event” to create your first one.
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => {
              const isPast = event.date.slice(0, 10) < today;
              return (
                <div key={event._id} className="flex animate-fade-up flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-center">
                  <div className="h-20 w-full shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 sm:w-32">
                    {event.imageUrl && (
                      <img src={event.imageUrl} alt="" className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-bold text-slate-900">{event.title}</h3>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${categoryColors[event.category]}`}>{event.category}</span>
                      {isPast && <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-600">Ended</span>}
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatDate(event.date)} · {event.time} · {event.venue}
                    </p>
                    <p className="text-sm text-slate-500">{event.registered} / {event.capacity} registered</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => showStudents(event._id)} className="btn-ghost !px-3 !py-1.5">Students</button>
                    <button onClick={() => setFormState({ open: true, event })} className="btn-ghost !px-3 !py-1.5">Edit</button>
                    <button onClick={() => handleDeleteEvent(event)} className="inline-flex items-center rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-100">
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Registered students */}
      <section id="students" className="mt-12 scroll-mt-20">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-900">Registered Students</h2>
          <select value={filterEvent} onChange={(e) => setFilterEvent(e.target.value)} className="input !w-auto min-w-[14rem]">
            <option value="">All events</option>
            {events.map((e) => <option key={e._id} value={e._id}>{e.title}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Dept / Year</th>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleRegistrations.length === 0 ? (
                <tr><td colSpan="6" className="px-4 py-10 text-center text-slate-500">No registrations to show.</td></tr>
              ) : (
                visibleRegistrations.map((r) => (
                  <tr key={r._id} className="transition hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{r.name}</td>
                    <td className="px-4 py-3">{r.email}</td>
                    <td className="px-4 py-3">{r.phone}</td>
                    <td className="px-4 py-3">{r.department} · {r.year}</td>
                    <td className="px-4 py-3">{r.event?.title || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDeleteRegistration(r)} className="text-sm font-medium text-red-600 hover:underline">Remove</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {formState.open && <EventForm event={formState.event} onClose={closeForm} onSaved={handleSaved} />}

      {toast && (
        <div className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-pop rounded-xl px-5 py-3 text-sm font-medium text-white shadow-xl ${toast.type === 'error' ? 'bg-red-600' : 'bg-slate-900'}`}>
          {toast.text}
        </div>
      )}
    </div>
  );
}
