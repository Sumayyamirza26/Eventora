import { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  Check,
  Clock,
  MapPin,
  Megaphone,
  Plus,
  Ticket,
} from 'lucide-react';
import { api } from '../api.js';
import EventForm from '../components/EventForm.jsx';
import TicketVerifierModal from '../components/TicketVerifierModal.jsx';
import EventStatsModal from '../components/EventStatsModal.jsx';
import CommunicationCenterModal from '../components/CommunicationCenterModal.jsx';
import { formatDate, categoryColors } from '../utils.js';
import { useToast } from '../components/Toast.jsx';

// Status badge helper
function StatusBadge({ status }) {
  if (!status || status === 'Published') return null;
  const map = {
    Draft: 'bg-[#875B18]/15 text-[#875B18] border border-[#875B18]/30',
    Cancelled: 'bg-[#A34235]/15 text-[#A34235] border border-[#A34235]/30',
    Completed: 'bg-[#485A99]/15 text-[#485A99] border border-[#485A99]/30',
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${map[status] || 'bg-[#E7E2E9] text-[#625078]'}`}>
      {status}
    </span>
  );
}

export default function Admin() {
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [filterEvent, setFilterEvent] = useState(''); // '' = all events
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formState, setFormState] = useState({ open: false, event: null });

  // New modal states
  const [showVerifier, setShowVerifier] = useState(false);
  const [statsEventId, setStatsEventId] = useState(null);   // non-null = modal open
  const [commsEvent, setCommsEvent] = useState(null);       // non-null = modal open

  const { toast } = useToast();

  const loadAll = useCallback(async () => {
    setError('');
    try {
      const [ev, reg] = await Promise.all([
        api.getEvents({ includeDrafts: true }),
        api.getRegistrations(),
      ]);
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

  // Dashboard metrics
  const publishedCount = events.filter((e) => !e.status || e.status === 'Published').length;
  const upcomingCount = events.filter(
    (e) => e.date?.slice(0, 10) >= today && (!e.status || e.status === 'Published'),
  ).length;
  const confirmedCount = registrations.filter((r) => !r.status || r.status === 'Confirmed').length;
  const waitlistedCount = registrations.filter((r) => r.status === 'Waitlisted').length;

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
        <div className="flex flex-wrap items-center gap-2">
          {/* QR Check-in Station */}
          <button
            type="button"
            onClick={() => setShowVerifier(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-[#292331]/20 bg-[#292331] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#3a3145]"
          >
            <Ticket className="h-4 w-4" />
            <span>QR Check-in Station</span>
          </button>
          <button
            onClick={() => setFormState({ open: true, event: null })}
            className="btn-primary"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Event</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-[#E7E2E9] bg-white p-5 shadow-sm">
          <div className="mb-2 h-1.5 w-10 rounded-full bg-[#292331]" />
          <p className="text-3xl font-extrabold text-[#292331]">{events.length}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#625078]">Total Events</p>
        </div>

        <div className="rounded-2xl border border-[#E7E2E9] bg-white p-5 shadow-sm">
          <div className="mb-2 h-1.5 w-10 rounded-full bg-[#625078]" />
          <p className="text-3xl font-extrabold text-[#292331]">{upcomingCount}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#625078]">Upcoming Published</p>
        </div>

        <div className="rounded-2xl border border-[#E7E2E9] bg-white p-5 shadow-sm">
          <div className="mb-2 h-1.5 w-10 rounded-full bg-[#356548]" />
          <p className="text-3xl font-extrabold text-[#292331]">{confirmedCount}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#625078]">Confirmed Seats</p>
        </div>

        <div className="rounded-2xl border border-[#E7E2E9] bg-white p-5 shadow-sm">
          <div className="mb-2 h-1.5 w-10 rounded-full bg-[#875B18]" />
          <p className="text-3xl font-extrabold text-[#292331]">{waitlistedCount}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#625078]">On Waitlist</p>
        </div>
      </div>

      {error && (
        <div className="mt-8 rounded-2xl border border-[#A34235]/30 bg-white p-5 text-[#A34235] shadow-sm">
          <p className="font-bold">Error loading dashboard data</p>
          <p className="mt-0.5 text-sm">{error}</p>
          <button
            onClick={() => { setLoading(true); loadAll(); }}
            className="btn-ghost mt-3 text-xs"
          >
            Try again
          </button>
        </div>
      )}

      {/* Events Section */}
      <section className="mt-12">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-[#292331]">All Events</h2>
          <span className="text-xs font-medium text-[#625078]">
            {events.length} events · {publishedCount} published
          </span>
        </div>

        {loading ? (
          <div className="h-44 animate-pulse rounded-2xl border border-[#E7E2E9] bg-white" />
        ) : events.length === 0 ? (
          <div className="rounded-2xl border border-[#E7E2E9] bg-white p-10 text-center text-[#625078]">
            No events yet. Click "Add New Event" to create your first campus event.
          </div>
        ) : (
          <div className="space-y-3.5">
            {events.map((event) => {
              const isPast = event.date?.slice(0, 10) < today;
              const capacity = Number(event.capacity) || 1;
              const registered = Number(event.registered) || 0;
              const waitlisted = Number(event.waitlisted) || 0;
              const spotsLeft = Math.max(capacity - registered, 0);
              const percentFull = Math.min(Math.round((registered / capacity) * 100), 100);
              const isCancelled = event.status === 'Cancelled';
              const isCompleted = event.status === 'Completed';
              const isDraft = event.status === 'Draft';

              return (
                <div
                  key={event._id}
                  className={`flex flex-col gap-4 rounded-2xl border bg-white p-4 sm:p-5 shadow-sm transition sm:flex-row sm:items-center ${
                    isCancelled
                      ? 'border-[#A34235]/20 opacity-75'
                      : isDraft
                      ? 'border-[#875B18]/20 bg-[#F7F5F0]'
                      : 'border-[#E7E2E9] hover:border-[#625078]/30'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="h-20 w-full shrink-0 overflow-hidden rounded-xl bg-[#292331] sm:w-32">
                    {event.imageUrl ? (
                      <img
                        src={event.imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center bg-gradient-to-br from-[#292331] to-[#625078] text-xs font-bold text-white/50">
                        EVENTORA
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-base font-bold text-[#292331]">{event.title}</h3>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          categoryColors[event.category] || categoryColors.Other
                        }`}
                      >
                        {event.category}
                      </span>

                      {/* Lifecycle status badge */}
                      <StatusBadge status={event.status} />

                      {/* Capacity / availability badge */}
                      {!isCancelled && !isDraft && (
                        isPast || isCompleted ? (
                          <span className="rounded-full bg-[#E7E2E9] px-2.5 py-0.5 text-xs font-semibold text-[#625078]">
                            Ended
                          </span>
                        ) : spotsLeft === 0 ? (
                          <span className="rounded-full bg-[#A34235]/15 px-2.5 py-0.5 text-xs font-bold text-[#A34235]">
                            Sold Out
                          </span>
                        ) : spotsLeft <= 5 ? (
                          <span className="rounded-full bg-[#875B18]/15 px-2.5 py-0.5 text-xs font-bold text-[#875B18]">
                            Few Left
                          </span>
                        ) : (
                          <span className="rounded-full bg-[#356548]/15 px-2.5 py-0.5 text-xs font-bold text-[#356548]">
                            Active
                          </span>
                        )
                      )}
                    </div>

                    <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-[#625078]">
                      <Calendar className="h-3.5 w-3.5 inline shrink-0" />
                      <span>{formatDate(event.date)}</span>
                      <span>·</span>
                      <Clock className="h-3.5 w-3.5 inline shrink-0" />
                      <span>{event.time}</span>
                      <span>·</span>
                      <MapPin className="h-3.5 w-3.5 inline shrink-0" />
                      <span>{event.venue}</span>
                    </p>

                    {/* Seat progress bar */}
                    {!isCancelled && (
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
                          {registered}/{capacity} seats
                          {waitlisted > 0 && (
                            <span className="ml-1.5 text-[#875B18]">· {waitlisted} waitlisted</span>
                          )}
                        </span>
                      </div>
                    )}

                    {isCancelled && event.cancellationReason && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-[#A34235]">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        <span>{event.cancellationReason}</span>
                      </p>
                    )}
                  </div>

                  {/* Action buttons */}
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
                      onClick={() => setStatsEventId(event._id)}
                      className="btn-ghost !px-3.5 !py-2 text-xs inline-flex items-center gap-1.5"
                    >
                      <BarChart3 className="h-3.5 w-3.5" />
                      <span>Stats</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCommsEvent(event)}
                      className="btn-ghost !px-3.5 !py-2 text-xs inline-flex items-center gap-1.5"
                    >
                      <Megaphone className="h-3.5 w-3.5" />
                      <span>Updates</span>
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

      {/* Registered Attendees Section */}
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
              className="input !w-auto min-w-[14rem] py-2 text-xs"
            >
              <option value="">All Events ({registrations.length})</option>
              {events.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.title} {e.status && e.status !== 'Published' ? `[${e.status}]` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[#E7E2E9] bg-white shadow-sm">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-[#E7E2E9] bg-[#F7F5F0] text-xs font-bold uppercase tracking-wider text-[#625078]">
              <tr>
                <th className="px-5 py-3.5">Student</th>
                <th className="px-5 py-3.5">Email</th>
                <th className="px-5 py-3.5">Phone</th>
                <th className="px-5 py-3.5">Dept / Year</th>
                <th className="px-5 py-3.5">Registered Event</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Ticket</th>
                <th className="px-5 py-3.5">Checked In</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E2E9]">
              {visibleRegistrations.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-5 py-12 text-center text-[#625078]">
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
                    <td className="px-5 py-3.5">
                      {r.status === 'Waitlisted' ? (
                        <span className="inline-flex items-center rounded-full bg-[#875B18]/15 px-2.5 py-0.5 text-[10px] font-bold text-[#875B18]">
                          Waitlist {r.waitlistPosition ? `#${r.waitlistPosition}` : ''}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-[#356548]/15 px-2.5 py-0.5 text-[10px] font-bold text-[#356548]">
                          Confirmed
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {r.ticketCode ? (
                        <span className="font-mono text-[11px] text-[#625078]">{r.ticketCode}</span>
                      ) : (
                        <span className="text-xs text-[#E7E2E9]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {r.checkedIn ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#356548]">
                          <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                          <span>Yes</span>
                        </span>
                      ) : (
                        <span className="text-xs text-[#625078]">No</span>
                      )}
                    </td>
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

      {/* ── Modals ── */}

      {/* Event Form Modal */}
      {formState.open && (
        <EventForm event={formState.event} onClose={closeForm} onSaved={handleSaved} />
      )}

      {/* QR Ticket Verifier */}
      {showVerifier && (
        <TicketVerifierModal
          onClose={() => setShowVerifier(false)}
          onCheckInComplete={loadAll}
        />
      )}

      {/* Post-Event Statistics */}
      {statsEventId && (
        <EventStatsModal
          eventId={statsEventId}
          onClose={() => setStatsEventId(null)}
        />
      )}

      {/* Event Communication Centre */}
      {commsEvent && (
        <CommunicationCenterModal
          event={commsEvent}
          isAdmin={true}
          onClose={() => setCommsEvent(null)}
          onUpdated={loadAll}
        />
      )}
    </div>
  );
}
