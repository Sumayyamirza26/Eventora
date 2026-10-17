import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';
import EventCard from '../components/EventCard.jsx';
import EventModal from '../components/EventModal.jsx';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  const loadEvents = useCallback(async () => {
    setError('');
    try {
      setEvents(await api.getEvents(true));
    } catch (err) {
      setError(err.message || 'Could not load events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const closeModal = useCallback(() => setSelected(null), []);
  const totalRegistered = events.reduce((sum, e) => sum + e.registered, 0);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-600 text-white">
        <div className="absolute -left-20 -top-20 h-72 w-72 animate-float rounded-full bg-fuchsia-400/30 blur-3xl" />
        <div className="absolute -bottom-24 right-0 h-80 w-80 animate-float rounded-full bg-sky-400/30 blur-3xl [animation-delay:2s]" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-center sm:py-28">
          <span className="inline-block animate-fade-up rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium backdrop-blur">
            🎉 Your campus. Your events.
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl animate-fade-up text-4xl font-extrabold leading-tight sm:text-6xl" style={{ animationDelay: '100ms' }}>
            Discover &amp; join the best <span className="text-amber-300">college events</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl animate-fade-up text-lg text-indigo-100" style={{ animationDelay: '200ms' }}>
            Hackathons, fests, workshops and more. Find what's happening on campus and reserve your seat in seconds.
          </p>
          <div className="mt-8 flex animate-fade-up flex-wrap justify-center gap-3" style={{ animationDelay: '300ms' }}>
            <a href="#events" className="rounded-xl bg-white px-6 py-3 font-semibold text-indigo-700 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl">
              Browse Events
            </a>
          </div>
          <div className="mx-auto mt-12 grid max-w-md animate-fade-up grid-cols-2 gap-4" style={{ animationDelay: '400ms' }}>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-3xl font-extrabold">{events.length}</p>
              <p className="text-sm text-indigo-100">Upcoming events</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-3xl font-extrabold">{totalRegistered}</p>
              <p className="text-sm text-indigo-100">Students registered</p>
            </div>
          </div>
        </div>
      </section>

      {/* Events */}
      <section id="events" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold text-slate-900">Upcoming Events</h2>
          <p className="mt-2 text-slate-500">Pick an event to see details and register.</p>
        </div>

        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 animate-pulse rounded-2xl bg-slate-200" />
            ))}
          </div>
        )}

        {error && (
          <div className="mx-auto max-w-md rounded-2xl bg-red-50 p-6 text-center text-red-700 ring-1 ring-red-200">
            <p className="font-semibold">{error}</p>
            <p className="mt-1 text-sm">Make sure the backend server is running.</p>
            <button onClick={() => { setLoading(true); loadEvents(); }} className="btn-primary mt-4">Try again</button>
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="rounded-2xl bg-white p-10 text-center ring-1 ring-slate-200">
            <p className="text-4xl">📭</p>
            <p className="mt-3 font-semibold text-slate-700">No upcoming events yet</p>
            <p className="text-sm text-slate-500">Add some from the Admin dashboard.</p>
          </div>
        )}

        {!loading && !error && events.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event, i) => (
              <EventCard key={event._id} event={event} index={i} onOpen={setSelected} />
            ))}
          </div>
        )}
      </section>

      {selected && <EventModal event={selected} onClose={closeModal} onRegistered={loadEvents} />}
    </>
  );
}
