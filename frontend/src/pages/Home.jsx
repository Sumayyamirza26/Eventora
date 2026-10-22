import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  GraduationCap,
  Megaphone,
  Search,
  Settings2,
  Sparkles,
  Star,
  Target,
  Ticket,
  X,
} from 'lucide-react';
import { api, studentStorage } from '../api.js';
import { CATEGORIES } from '../utils.js';
import EventCard from '../components/EventCard.jsx';
import EventModal from '../components/EventModal.jsx';
import DigitalPass from '../components/DigitalPass.jsx';
import InterestsModal from '../components/InterestsModal.jsx';
import CommunicationCenterModal from '../components/CommunicationCenterModal.jsx';
import { useFavourites } from '../useFavourites.js';
import { useInterests } from '../useInterests.js';
import { useToast } from '../components/Toast.jsx';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modals
  const [showInterestsModal, setShowInterestsModal] = useState(false);
  const [showCommunication, setShowCommunication] = useState(false);
  const [ticketLookupOpen, setTicketLookupOpen] = useState(false);
  const [lookupCode, setLookupCode] = useState('');
  const [foundRegistration, setFoundRegistration] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  // Favourites & Interests
  const { isFavourite, toggleFavourite, favouritesCount } = useFavourites();
  const { interests, setStudentInterests, hasPreferences } = useInterests();
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

  // Update selected modal event when events list refreshes
  useEffect(() => {
    if (selected) {
      const refreshed = events.find((e) => e._id === selected._id);
      if (refreshed) setSelected(refreshed);
    }
  }, [events, selected]);

  const totalRegistered = events.reduce((sum, e) => sum + (Number(e.registered) || 0), 0);

  // Derive categories from user's favourites for smart fallback recommendations
  const favouriteCategories = useMemo(() => {
    const cats = new Set();
    events.forEach((ev) => {
      if (isFavourite(ev._id)) cats.add(ev.category);
    });
    return Array.from(cats);
  }, [events, isFavourite]);

  const activeInterests = interests.length > 0 ? interests : favouriteCategories;

  // Filtered & Ranked Events: combining Category + Search Query + Favourites + Personalized Discovery
  const filteredEvents = useMemo(() => {
    const filtered = events.filter((event) => {
      // 1. Category / Favourites / Personalized check
      if (selectedCategory === 'Favourites') {
        if (!isFavourite(event._id)) return false;
      } else if (selectedCategory === 'ForYou') {
        // If user has preferences or favourite categories, match them
        if (activeInterests.length > 0) {
          if (!activeInterests.includes(event.category)) return false;
        }
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

    // Sort by recommendation relevance if in "For You" mode
    if (selectedCategory === 'ForYou') {
      return [...filtered].sort((a, b) => {
        const aFav = isFavourite(a._id) ? 1 : 0;
        const bFav = isFavourite(b._id) ? 1 : 0;
        return bFav - aFav;
      });
    }

    return filtered;
  }, [events, selectedCategory, searchQuery, isFavourite, activeInterests]);

  const hasActiveFilters = searchQuery.trim() !== '' || selectedCategory !== 'All';

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
  };

  const handleLookupPass = async (e) => {
    e.preventDefault();
    if (!lookupCode.trim()) {
      toast.warning('Please enter your ticket pass code');
      return;
    }

    setLookupLoading(true);
    try {
      const reg = await api.getTicket(lookupCode.trim().toUpperCase());
      setFoundRegistration(reg);
      setTicketLookupOpen(false);
      setLookupCode('');
    } catch (err) {
      toast.error(err.message || 'Pass not found. Please check your code.');
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#292331] text-white">
        {/* Responsive Hero Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/hero-bg.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          aria-hidden="true"
        />

        {/* Subtle Dark Purple Overlay for text readability & brand cohesion */}
        <div
          className="absolute inset-0 bg-[#292331]/80 backdrop-brightness-90"
          aria-hidden="true"
        />

        {/* Ambient Glows */}
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-[#625078]/25 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 right-0 h-96 w-96 rounded-full bg-[#D6E59A]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-20 text-center sm:py-28 sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E7E2E9]/20 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-white backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-[#D6E59A]" />
            Curated College Events &amp; QR Digital Passes
          </div>

          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl leading-[1.15]">
            Discover &amp; experience the best <span className="text-[#D6E59A]">campus events</span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base text-[#E7E2E9]/90 sm:text-lg leading-relaxed">
            Personalized event discovery, real-time waitlists, automated seat allocation, and instant QR digital passes.
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

            <Link
              to={studentStorage.isAuthenticated() ? '/dashboard' : '/student/login'}
              className="inline-flex items-center gap-2 rounded-xl bg-[#D6E59A] px-5 py-3 font-bold text-[#292331] shadow-lg transition hover:bg-[#c9da88] hover:-translate-y-0.5 active:translate-y-0"
            >
              <GraduationCap className="h-4 w-4" />
              <span>{studentStorage.isAuthenticated() ? 'My Student Dashboard' : 'Student Portal'}</span>
            </Link>

            <button
              type="button"
              onClick={() => setTicketLookupOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
            >
              <Ticket className="h-4 w-4" />
              <span>Lookup Pass</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCommunication(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 font-semibold text-[#E7E2E9] backdrop-blur-md transition hover:bg-white/20"
            >
              <Megaphone className="h-4 w-4" />
              <span>Campus Notices</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mx-auto mt-12 grid max-w-xl grid-cols-3 gap-3 sm:gap-4">
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
              Upcoming Campus Events
            </h2>
            <p className="mt-1 text-sm text-[#625078]">
              Browse scheduled campus activities, personalized recommendations, or search by keywords.
            </p>
          </div>

          {/* Live Count & Personalize Action */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowInterestsModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#E7E2E9] bg-white px-3 py-1.5 text-xs font-bold text-[#625078] hover:text-[#292331] hover:border-[#625078]/40 shadow-xs transition"
              title="Personalize recommended events"
            >
              <Settings2 className="h-3.5 w-3.5" />
              <span>My Interests</span>
              {hasPreferences && (
                <span className="h-2 w-2 rounded-full bg-[#356548]" />
              )}
            </button>
 
            {!loading && !error && (
              <span className="text-xs font-semibold text-[#625078]">
                Showing <strong className="text-[#292331]">{filteredEvents.length}</strong> of {events.length} events
              </span>
            )}
          </div>
        </div>

        {/* Search Bar & Category Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Input Container */}
          <div className="relative w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#625078]">
              <Search className="h-5 w-5" />
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events by event name, venue, description, or keyword..."
              className="w-full rounded-2xl border border-[#E7E2E9] bg-white py-3.5 pl-11 pr-10 text-sm text-[#292331] shadow-sm transition placeholder:text-slate-400 focus:border-[#625078] focus:outline-none focus:ring-2 focus:ring-[#625078]/20"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search text"
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#625078] hover:text-[#292331]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Category Filter Pills, For You, and Favourites Tab */}
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

              {/* "For You" Pill (Personalized Event Discovery) */}
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('ForYou');
                  if (!hasPreferences && favouriteCategories.length === 0) {
                    setShowInterestsModal(true);
                  }
                }}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
                  selectedCategory === 'ForYou'
                    ? 'border-[#292331] bg-[#292331] text-[#D6E59A] shadow-sm'
                    : 'border-[#E7E2E9] bg-white text-[#292331] hover:bg-[#F7F5F0]'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>For You</span>
                {activeInterests.length > 0 && (
                  <span className="rounded-full bg-[#D6E59A] text-[#292331] px-1.5 py-0.2 text-[10px] font-bold">
                    {activeInterests.length}
                  </span>
                )}
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

              {/* "My Favourites" Pill */}
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
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#E7E2E9] bg-white px-3 py-1.5 text-xs font-medium text-[#625078] transition hover:bg-[#F7F5F0] hover:text-[#292331]"
              >
                <span>Clear filters</span>
                <X className="h-3 w-3 text-slate-400" />
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

        {/* Empty State: No events exist */}
        {!loading && !error && events.length === 0 && (
          <div className="rounded-2xl border border-[#E7E2E9] bg-white p-12 text-center shadow-sm">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#F7F5F0] border border-[#E7E2E9] text-[#625078]">
              <Calendar className="h-7 w-7 text-[#625078]" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-[#292331]">No upcoming events right now</h3>
            <p className="mt-1 text-sm text-[#625078]">
              Check back soon for new hackathons, workshops, and campus meetups.
            </p>
          </div>
        )}

        {/* Empty State: Filter or Search yielded 0 results */}
        {!loading && !error && events.length > 0 && filteredEvents.length === 0 && (
          <div className="rounded-2xl border border-[#E7E2E9] bg-white p-12 text-center shadow-sm max-w-lg mx-auto animate-fade-up">
            {selectedCategory === 'ForYou' ? (
              <>
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#F7F5F0] text-[#625078] border border-[#E7E2E9]">
                  <Target className="h-7 w-7 text-[#625078]" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-[#292331]">No personalized matches found</h3>
                <p className="mt-1.5 text-sm text-[#625078] leading-relaxed">
                  We couldn't find events matching your active interests ({activeInterests.join(', ') || 'None set'}). Try expanding your preferences!
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowInterestsModal(true)}
                    className="btn-primary"
                  >
                    Customize Interests
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('All')}
                    className="btn-ghost"
                  >
                    View All Events
                  </button>
                </div>
              </>
            ) : selectedCategory === 'Favourites' ? (
              <>
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#F7F5F0] text-[#625078] border border-[#E7E2E9]">
                  <Star className="h-7 w-7 text-[#625078]" />
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
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#F7F5F0] text-[#625078] border border-[#E7E2E9]">
                  <Search className="h-7 w-7 text-[#625078]" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-[#292331]">No matching events found</h3>
                <p className="mt-1.5 text-sm text-[#625078] leading-relaxed">
                  We couldn't find any events matching {searchQuery ? `"${searchQuery}"` : ''} in{' '}
                  <span className="font-semibold text-[#292331]">{selectedCategory}</span>.
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
            {filteredEvents.map((event, i) => {
              const isRecommended = activeInterests.includes(event.category);
              const matchReason = isRecommended ? `Matches your ${event.category} interest` : '';

              return (
                <EventCard
                  key={event._id}
                  event={event}
                  index={i}
                  onOpen={setSelected}
                  isFav={isFavourite(event._id)}
                  onToggleFav={toggleFavourite}
                  isRecommended={isRecommended}
                  matchReason={matchReason}
                />
              );
            })}
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

      {/* Interests Personalization Modal */}
      {showInterestsModal && (
        <InterestsModal
          selectedInterests={interests}
          onSave={setStudentInterests}
          onClose={() => setShowInterestsModal(false)}
        />
      )}

      {/* Campus Communication Centre Modal */}
      {showCommunication && (
        <CommunicationCenterModal
          event={null}
          onClose={() => setShowCommunication(false)}
        />
      )}

      {/* Ticket Pass Lookup Modal */}
      {ticketLookupOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#292331]/60 p-4 backdrop-blur-sm"
          onClick={() => setTicketLookupOpen(false)}
        >
          <div
            className="w-full max-w-md animate-pop overflow-hidden rounded-3xl bg-white p-6 shadow-2xl border border-[#E7E2E9]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E7E2E9] pb-3">
              <h3 className="font-bold text-base text-[#292331]">Lookup Digital Pass</h3>
              <button
                type="button"
                onClick={() => setTicketLookupOpen(false)}
                aria-label="Close dialog"
                className="text-slate-400 hover:text-[#292331]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleLookupPass} className="mt-4 space-y-3">
              <p className="text-xs text-[#625078]">
                Enter your unique ticket code to retrieve your QR Digital Pass.
              </p>
              <input
                type="text"
                value={lookupCode}
                onChange={(e) => setLookupCode(e.target.value.toUpperCase())}
                placeholder="e.g. EVT-ABCD-1234"
                className="input font-mono uppercase text-sm"
                autoFocus
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTicketLookupOpen(false)}
                  className="btn-ghost text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={lookupLoading}
                  className="btn-primary text-xs !px-5"
                >
                  {lookupLoading ? 'Looking up...' : 'Retrieve Pass'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Retrieved Pass Modal */}
      {foundRegistration && (
        <DigitalPass
          registration={foundRegistration}
          onClose={() => setFoundRegistration(null)}
        />
      )}
    </>
  );
}
