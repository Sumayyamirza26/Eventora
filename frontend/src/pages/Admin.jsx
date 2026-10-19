import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';
import EventForm from '../components/EventForm.jsx';
import { formatDate, categoryColors } from '../utils.js';
import { useToast } from '../components/Toast.jsx';

export default function Admin() {
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [filterEvent, setFilterEvent] = useState(''); // '' = all events
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formState, setFormState] = useState({ open: false, event: null });
  const { toast } = useToast();

  const loadAll = useCallback(async () => {
    setError('');
    try {
      const [ev, reg] = await Promise.all([api.getEvents(), api.getRegistrations()]);
      setEvents(ev);
      setRegistrations(reg);
    } catch (err) {
      const msg = err.message || 'Could not load data';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const closeForm = useCallback(() => setFormState({ open: false, event: null }), []);

  const handleSaved = (message) => {
    closeForm();
    toast.success(message);
    loadAll();
  };

  const handleDeleteEvent = async (event) => {
    if (!window.confirm(`Delete "${event.title}"? Its registrations will be permanently removed.`)) return;
    try {
      await api.deleteEvent(event._id);
      if (filterEvent === event._id) setFilterEvent('');
      toast.success(`Event "${event.title}" deleted`);
      loadAll();
    } catch (err) {
      toast.error(err.message || 'Failed to delete event');
    }
  };

  const handleDeleteRegistration = async (reg) => {
    if (!window.confirm(`Remove registration for ${reg.name}?`)) return;
    try {
      await api.deleteRegistration(reg._id);
      toast.success(`Removed registration for ${reg.name}`);
      loadAll();
    } catch (err) {
      toast.error(err.message || 'Failed to remove registration');
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
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E7E2E9] pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#625078]">Administration</span>
          <h1 className="text-3xl font-extrabold text-[#292331]">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-[#625078]">
            Manage campus events, monitor seat capacities, and view attendee lists.
          </p>
        </div>
        <button onClick={() => setFormState({ open: true, event: null })} className="btn-primary">
          <span className="text-base font-bold">＋</span>
          <span>Add New Event</span>
        </button>
      </div>

      {/* Metrics Cards using Eventora Palette Tokens */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#E7E2E9] bg-white p-6 shadow-sm">
          <div className="mb-2 h-1.5 w-10 rounded-full bg-[#292331]" />
          <p className="text-3xl font-extrabold text-[#292331]">{events.length}</p>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#625078] mt-1">Total Events</p>
        </div>

        <div className="rounded-2xl border border-[#E7E2E9] bg-white p-6 shadow-sm">
          <div className="mb-2 h-1.5 w-10 rounded-full bg-[#625078]" />
          <p className="text-3xl font-extrabold text-[#292331]">{upcomingCount}</p>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#625078] mt-1">Upcoming Events</p>
        </div>

        <div className="rounded-2xl border border-[#E7E2E9] bg-white p-6 shadow-sm">
          <div className="mb-2 h-1.5 w-10 rounded-full bg-[#356548]" />
          <p className="text-3xl font-extrabold text-[#292331]">{registrations.length}</p>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#625078] mt-1">Total Registrations</p>
        </div>
      </div>

      {error && (
        <div className="mt-8 rounded-2xl border border-[#A34235]/30 bg-white p-5 text-[#A34235] shadow-sm">
          <p className="font-bold">Error loading dashboard data</p>
          <p className="text-sm mt-0.5">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              loadAll();
            }}
            className="btn-ghost mt-3 text-xs"
          >
            Try again
          </button>
        </div>
      )}

      {/* Events Section */}
      <section className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#292331]">All Events</h2>
          <span className="text-xs text-[#625078] font-medium">{events.length} total events in database</span>
        </div>

        {loading ? (
          <div className="h-44 animate-pulse rounded-2xl border border-[#E7E2E9] bg-white" />
        ) : events.length === 0 ? (
          <div className="rounded-2xl border border-[#E7E2E9] bg-white p-10 text-center text-[#625078]">
            No events yet. Click “Add New Event” to create your first campus event.
          </div>
        ) : (
          <div className="space-y-3.5">
            {events.map((event) => {
              const isPast = event.date.slice(0, 10) < today;
              const capacity = Number(event.capacity) || 1;
              const registered = Number(event.registered) || 0;
              const spotsLeft = Math.max(capacity - registered, 0);
              const percentFull = Math.min(Math.round((registered / capacity) * 100), 100);

              return (
                <div
                  key={event._id}
                  className="flex flex-col gap-4 rounded-2xl border border-[#E7E2E9] bg-white p-4 sm:p-5 shadow-sm transition hover:border-[#625078]/30 sm:flex-row sm:items-center"
                >
                  <div className="h-20 w-full shrink-0 overflow-hidden rounded-xl bg-[#292331] sm:w-32">
                    {event.imageUrl ? (
                      <img
                        src={event.imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-[#292331] to-[#625078] grid place-items-center text-xs font-bold text-white/50">
                        EVENTORA
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-bold text-[#292331] text-base">{event.title}</h3>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          categoryColors[event.category] || categoryColors.Other
                        }`}
                      >
                        {event.category}
                      </span>
                      {isPast ? (
                        <span className="rounded-full bg-[#E7E2E9] px-2.5 py-0.5 text-xs font-semibold text-[#625078]">
                          Ended
                        </span>
                      ) : spotsLeft === 0 ? (
                        <span className="rounded-full bg-[#A34235]/15 text-[#A34235] px-2.5 py-0.5 text-xs font-bold">
                          Sold Out
                        </span>
                      ) : (
                        <span className="rounded-full bg-[#356548]/15 text-[#356548] px-2.5 py-0.5 text-xs font-bold">
                          Active
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs text-[#625078]">
                      📅 {formatDate(event.date)} &nbsp;·&nbsp; 🕒 {event.time} &nbsp;·&nbsp; 📍 {event.venue}
                    </p>

                    <div className="mt-2 flex items-center gap-3">
                      <div className="h-1.5 w-32 overflow-hidden rounded-full bg-[#E7E2E9]">
                        <div
                          className={`h-full rounded-full ${
                            spotsLeft === 0 ? 'bg-[#A34235]' : spotsLeft <= 5 ? 'bg-[#875B18]' : 'bg-[#292331]'
                          }`}
                          style={{ width: `${percentFull}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-[#625078]">
                        {registered} / {capacity} seats ({spotsLeft} remaining)
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => showStudents(event._id)}
                      className="btn-ghost !px-3.5 !py-2 text-xs"
                    >
                      Attendees ({registered})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormState({ open: true, event })}
                      className="btn-ghost !px-3.5 !py-2 text-xs"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteEvent(event)}
                      className="inline-flex items-center rounded-xl border border-[#A34235]/30 bg-[#A34235]/10 px-3.5 py-2 text-xs font-semibold text-[#A34235] transition hover:bg-[#A34235]/20"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Registered Students Section */}
      <section id="students" className="mt-14 scroll-mt-20">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-[#292331]">Registered Attendees</h2>
            <p className="text-xs text-[#625078]">Student registrations across campus events</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#625078]">Filter Event:</span>
            <select
              value={filterEvent}
              onChange={(e) => setFilterEvent(e.target.value)}
              className="input !w-auto min-w-[14rem] text-xs py-2"
            >
              <option value="">All Events ({registrations.length})</option>
              {events.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[#E7E2E9] bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-[#E7E2E9] bg-[#F7F5F0] text-xs font-bold uppercase tracking-wider text-[#625078]">
              <tr>
                <th className="px-5 py-3.5">Student</th>
                <th className="px-5 py-3.5">Email</th>
                <th className="px-5 py-3.5">Phone</th>
                <th className="px-5 py-3.5">Dept / Year</th>
                <th className="px-5 py-3.5">Registered Event</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E2E9]">
              {visibleRegistrations.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-[#625078]">
                    No student registrations found for this selection.
                  </td>
                </tr>
              ) : (
                visibleRegistrations.map((r) => (
                  <tr key={r._id} className="transition hover:bg-[#F7F5F0]/60">
                    <td className="px-5 py-3.5 font-semibold text-[#292331]">{r.name}</td>
                    <td className="px-5 py-3.5 text-[#625078]">{r.email}</td>
                    <td className="px-5 py-3.5 text-[#625078]">{r.phone}</td>
                    <td className="px-5 py-3.5 text-[#292331]">
                      {r.department} &nbsp;·&nbsp; <span className="text-xs text-[#625078]">{r.year}</span>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-[#292331]">{r.event?.title || '—'}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteRegistration(r)}
                        className="text-xs font-semibold text-[#A34235] hover:underline"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Event Form Modal */}
      {formState.open && (
        <EventForm event={formState.event} onClose={closeForm} onSaved={handleSaved} />
      )}
    </div>
  );
}
