import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import { CATEGORIES } from '../utils.js';
import EventCard from '../components/EventCard.jsx';
import EventModal from '../components/EventModal.jsx';
import { useFavourites } from '../useFavourites.js';
import { useToast } from '../components/Toast.jsx';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Favourites
  const { isFavourite, toggleFavourite, favouritesCount } = useFavourites();
  const { toast } = useToast();

  const loadEvents = useCallback(async () => {
    setError('');
    try {
      const data = await api.getEvents(true);
      setEvents(data);
    } catch (err) {
      const msg = err.message || 'Could not load events from server';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const closeModal = useCallback(() => setSelected(null), []);

  // Update selected modal event when events list refreshes (keeping seat availability live)
  useEffect(() => {
    if (selected) {
      const refreshed = events.find((e) => e._id === selected._id);
      if (refreshed) setSelected(refreshed);
    }
  }, [events, selected]);

  const totalRegistered = events.reduce((sum, e) => sum + (Number(e.registered) || 0), 0);

  // Filtered Events: combining Category + Search Query + Favourites
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // 1. Category / Favourites check
      if (selectedCategory === 'Favourites') {
        if (!isFavourite(event._id)) return false;
      } else if (selectedCategory !== 'All') {
        if (event.category !== selectedCategory) return false;
      }

      // 2. Search query check (title, venue, description)
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const inTitle = (event.title || '').toLowerCase().includes(query);
        const inVenue = (event.venue || '').toLowerCase().includes(query);
        const inDesc = (event.description || '').toLowerCase().includes(query);
        if (!inTitle && !inVenue && !inDesc) return false;
      }

      return true;
    });
  }, [events, selectedCategory, searchQuery, isFavourite]);

  const hasActiveFilters = searchQuery.trim() !== '' || selectedCategory !== 'All';

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#292331] text-white">
        {/* Subtle architectural ambient glows */}
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-[#625078]/25 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 right-0 h-96 w-96 rounded-full bg-[#D6E59A]/10 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-6xl px-4 py-20 text-center sm:py-28 sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E7E2E9]/20 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-white backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-[#D6E59A]" />
            Curated College Events Hub
          </div>

          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl leading-[1.15]">
            Discover &amp; experience the best <span className="text-[#D6E59A]">campus events</span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base text-[#E7E2E9]/90 sm:text-lg leading-relaxed">
            Hackathons, cultural fests, technical workshops, and sports meets. Find what's happening and reserve your seat in seconds.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="#events"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-[#292331] shadow-lg transition hover:bg-[#F7F5F0] hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Explore Events</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </a>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mx-auto mt-12 grid max-w-lg grid-cols-3 gap-3 sm:gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
              <p className="text-2xl sm:text-3xl font-extrabold text-white">{events.length}</p>
              <p className="text-xs text-[#E7E2E9]/80 mt-1">Active Events</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
              <p className="text-2xl sm:text-3xl font-extrabold text-white">{totalRegistered}</p>
              <p className="text-xs text-[#E7E2E9]/80 mt-1">Registrations</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
              <p className="text-2xl sm:text-3xl font-extrabold text-[#D6E59A]">{favouritesCount}</p>
              <p className="text-xs text-[#E7E2E9]/80 mt-1">My Favourites</p>
            </div>
          </div>
        </div>
      </section>

      {/* Events Browsing Section */}
      <section id="events" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-14 sm:px-6">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#625078]">
              Campus Calendar
            </span>
            <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-[#292331]">
              Upcoming Events
            </h2>
            <p className="mt-1 text-sm text-[#625078]">
              Browse upcoming campus activities, filter by category, or search by name.
            </p>
          </div>

          {/* Live Count Badge */}
          {!loading && !error && (
            <div className="text-xs font-semibold text-[#625078]">
              Showing <span className="font-bold text-[#292331]">{filteredEvents.length}</span> of {events.length} events
            </div>
          )}
        </div>

        {/* Search Bar & Category Filters (Requirement 1 & 2) */}
        <div className="mb-8 space-y-4">
          {/* Search Input Container */}
          <div className="relative w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#625078]">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events by event name, venue, or keywords..."
              className="w-full rounded-2xl border border-[#E7E2E9] bg-white py-3.5 pl-11 pr-10 text-sm text-[#292331] shadow-sm transition placeholder:text-slate-400 focus:border-[#625078] focus:outline-none focus:ring-2 focus:ring-[#625078]/20"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search text"
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#625078] hover:text-[#292331]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter Pills & Favourites Tab */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* "All" Pill */}
              <button
                type="button"
                onClick={() => setSelectedCategory('All')}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-semibold transition ${
                  selectedCategory === 'All'
                    ? 'border-[#625078] bg-[#625078] text-white shadow-sm'
                    : 'border-[#E7E2E9] bg-white text-[#292331] hover:bg-[#F7F5F0]'
                }`}
              >
                {selectedCategory === 'All' && <span className="h-1.5 w-1.5 rounded-full bg-[#D6E59A]" />}
                All Categories
              </button>

              {/* Supported Categories */}
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
                      isActive
                        ? 'border-[#625078] bg-[#625078] text-white shadow-sm'
                        : 'border-[#E7E2E9] bg-white text-[#292331] hover:bg-[#F7F5F0]'
                    }`}
                  >
                    {isActive && <span className="h-1.5 w-1.5 rounded-full bg-[#D6E59A]" />}
                    {cat}
                  </button>
                );
              })}

              {/* "My Favourites" Pill (Requirement 2) */}
              <button
                type="button"
                onClick={() => setSelectedCategory('Favourites')}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
                  selectedCategory === 'Favourites'
                    ? 'border-[#292331] bg-[#292331] text-[#D6E59A] shadow-sm'
                    : 'border-[#E7E2E9] bg-white text-[#292331] hover:bg-[#F7F5F0]'
                }`}
              >
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill={selectedCategory === 'Favourites' ? '#D6E59A' : 'none'}
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                <span>My Favourites</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    selectedCategory === 'Favourites'
                      ? 'bg-[#D6E59A] text-[#292331]'
                      : 'bg-[#E7E2E9] text-[#625078]'
                  }`}
                >
                  {favouritesCount}
                </span>
              </button>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1 rounded-xl border border-[#E7E2E9] bg-white px-3 py-1.5 text-xs font-medium text-[#625078] transition hover:bg-[#F7F5F0] hover:text-[#292331]"
              >
                <span>Clear filters</span>
                <span className="text-slate-400">✕</span>
              </button>
            )}
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-96 animate-pulse rounded-2xl border border-[#E7E2E9] bg-white p-5 flex flex-col justify-between"
              >
                <div className="h-44 rounded-xl bg-[#E7E2E9]/60" />
                <div className="space-y-3 mt-4">
                  <div className="h-5 w-3/4 rounded bg-[#E7E2E9]/80" />
                  <div className="h-4 w-1/2 rounded bg-[#E7E2E9]/60" />
                  <div className="h-10 rounded-xl bg-[#E7E2E9]/50" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mx-auto max-w-md rounded-2xl border border-[#A34235]/30 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#A34235]/15 text-[#A34235] text-xl font-bold">
              !
            </div>
            <p className="mt-4 font-bold text-[#292331]">Could not load events</p>
            <p className="mt-1 text-sm text-[#625078]">{error}</p>
            <button
              onClick={() => {
                setLoading(true);
                loadEvents();
              }}
              className="btn-primary mt-5"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Empty State: No events exist in database */}
        {!loading && !error && events.length === 0 && (
          <div className="rounded-2xl border border-[#E7E2E9] bg-white p-12 text-center shadow-sm">
            <span className="text-4xl">🗓️</span>
            <h3 className="mt-4 text-lg font-bold text-[#292331]">No upcoming events right now</h3>
            <p className="mt-1 text-sm text-[#625078]">
              Check back soon for new hackathons, workshops, and campus meetups.
            </p>
          </div>
        )}

        {/* Empty State: Filter or Search yielded 0 results (Requirement 1 & 2) */}
        {!loading && !error && events.length > 0 && filteredEvents.length === 0 && (
          <div className="rounded-2xl border border-[#E7E2E9] bg-white p-12 text-center shadow-sm max-w-lg mx-auto animate-fade-up">
            {selectedCategory === 'Favourites' ? (
              <>
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#F7F5F0] text-2xl text-[#625078] border border-[#E7E2E9]">
                  ⭐
                </div>
                <h3 className="mt-4 text-lg font-bold text-[#292331]">No favourite events yet</h3>
                <p className="mt-1.5 text-sm text-[#625078] leading-relaxed">
                  You haven't bookmarked any events. Click the bookmark icon on any event card to save it to your personal list.
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('All')}
                  className="btn-primary mt-6"
                >
                  Browse All Events
                </button>
              </>
            ) : (
              <>
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#F7F5F0] text-2xl text-[#625078] border border-[#E7E2E9]">
                  🔍
                </div>
                <h3 className="mt-4 text-lg font-bold text-[#292331]">No matching events found</h3>
                <p className="mt-1.5 text-sm text-[#625078] leading-relaxed">
                  We couldn't find any events matching {searchQuery ? `"${searchQuery}"` : ''} in{' '}
                  <span className="font-semibold text-[#292331]">{selectedCategory}</span>. Try adjusting your search or clear filters.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="btn-primary mt-6"
                >
                  Show All Events
                </button>
              </>
            )}
          </div>
        )}

        {/* Events Grid */}
        {!loading && !error && filteredEvents.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event, i) => (
              <EventCard
                key={event._id}
                event={event}
                index={i}
                onOpen={setSelected}
                isFav={isFavourite(event._id)}
                onToggleFav={toggleFavourite}
              />
            ))}
          </div>
        )}
      </section>

      {/* Event Details & Registration Modal */}
      {selected && (
        <EventModal
          event={selected}
          onClose={closeModal}
          onRegistered={loadEvents}
          isFav={isFavourite(selected._id)}
          onToggleFav={toggleFavourite}
        />
      )}
    </>
  );
}
