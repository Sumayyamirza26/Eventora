import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, studentStorage } from '../api.js';
import { formatDate, categoryColors } from '../utils.js';
import { useToast } from '../components/Toast.jsx';
import DigitalPass from '../components/DigitalPass.jsx';
import CertificateModal from '../components/CertificateModal.jsx';
import StudentProfileModal from '../components/StudentProfileModal.jsx';
import CommunicationCenterModal from '../components/CommunicationCenterModal.jsx';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [student, setStudent] = useState(studentStorage.getStudent() || null);
  const [registrations, setRegistrations] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Active Tab: 'events' | 'certificates' | 'notifications'
  const [activeTab, setActiveTab] = useState('events');

  // Search & Filter for My Events
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [selectedPass, setSelectedPass] = useState(null); // Registration object for DigitalPass
  const [selectedCert, setSelectedCert] = useState(null); // Certificate object for CertificateModal
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCommsEvent, setShowCommsEvent] = useState(null);

  const loadData = useCallback(async () => {
    if (!studentStorage.isAuthenticated()) {
      navigate('/student/login', { replace: true });
      return;
    }

    setLoading(true);
    try {
      const [profileData, regData, notifData, certData] = await Promise.all([
        api.getStudentProfile().catch(() => null),
        api.getMyRegistrations().catch(() => []),
        api.getNotifications().catch(() => ({ notifications: [], unreadCount: 0 })),
        api.getMyCertificates().catch(() => []),
      ]);

      if (profileData) {
        setStudent(profileData);
        studentStorage.setStudent(profileData);
      }
      setRegistrations(regData || []);
      setNotifications(notifData?.notifications || []);
      setUnreadCount(notifData?.unreadCount || 0);
      setCertificates(certData || []);
    } catch (err) {
      toast.error('Failed to load dashboard data: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Cancel Registration
  const handleCancelRegistration = async (reg) => {
    const eventTitle = reg.event?.title || 'this event';
    const confirmMessage = `Cancel your registration for "${eventTitle}"? Your seat will be released to the next waitlisted student.`;
    if (!window.confirm(confirmMessage)) return;

    try {
      await api.cancelMyRegistration(reg._id);
      toast.success(`Registration cancelled for "${eventTitle}". Seat released.`);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel registration');
    }
  };

  // Mark all notifications read
  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to update notifications');
    }
  };

  // Mark single notification read
  const handleMarkRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // ignore error
    }
  };

  const handleLogout = () => {
    api.studentLogout();
    toast.info('Signed out of student portal');
    navigate('/', { replace: true });
  };

  // Filtered registrations
  const filteredRegistrations = registrations.filter((r) => {
    const matchesSearch =
      !searchQuery.trim() ||
      (r.event?.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.event?.venue || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.ticketCode || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Confirmed' && r.status === 'Confirmed' && !r.checkedIn) ||
      (statusFilter === 'CheckedIn' && r.checkedIn) ||
      (statusFilter === 'Waitlisted' && r.status === 'Waitlisted') ||
      (statusFilter === 'Cancelled' && r.status === 'Cancelled');

    return matchesSearch && matchesStatus;
  });

  // Metrics
  const totalRegistrations = registrations.length;
  const confirmedCount = registrations.filter((r) => r.status === 'Confirmed').length;
  const waitlistedCount = registrations.filter((r) => r.status === 'Waitlisted').length;
  const totalCertificates = certificates.length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Top Banner / Student Profile Card */}
      <div className="relative overflow-hidden rounded-3xl bg-[#292331] p-6 sm:p-8 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border border-white/5" />
        <div className="pointer-events-none absolute right-12 -bottom-12 h-44 w-44 rounded-full bg-[#625078]/20 blur-2xl" />

        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#D6E59A] text-2xl font-black text-[#292331] shadow-md">
              {student?.name?.charAt(0)?.toUpperCase() || 'S'}
              <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-[#356548] ring-2 ring-[#292331]" title="Student Verified" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  {student?.name || 'Student Portal'}
                </h1>
                <span className="rounded-full bg-white/10 px-3 py-0.5 text-xs font-semibold text-[#D6E59A] border border-[#D6E59A]/30">
                  {student?.department || 'College Student'}
                </span>
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-[#E7E2E9]/80 font-mono">
                <span>Pass ID: <strong className="text-white">{student?.studentId || 'STU-PENDING'}</strong></span>
                <span>·</span>
                <span>{student?.email}</span>
                <span>·</span>
                <span>{student?.year || '1st Year'}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowProfileModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/20"
            >
              <span>✏️ Edit Profile</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#A34235]/40 bg-[#A34235]/20 px-4 py-2.5 text-xs font-bold text-[#E7E2E9] transition hover:bg-[#A34235]/30 hover:text-white"
            >
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* KPI Metric Strip */}
        <div className="relative z-10 mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-white/10 pt-6">
          <div className="rounded-2xl bg-white/5 p-3.5 border border-white/5 text-center">
            <p className="text-2xl font-extrabold text-white">{totalRegistrations}</p>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#D6E59A] mt-0.5">Total Registered</p>
          </div>

          <div className="rounded-2xl bg-white/5 p-3.5 border border-white/5 text-center">
            <p className="text-2xl font-extrabold text-[#D6E59A]">{confirmedCount}</p>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#E7E2E9]/80 mt-0.5">Confirmed Passes</p>
          </div>

          <div className="rounded-2xl bg-white/5 p-3.5 border border-white/5 text-center">
            <p className="text-2xl font-extrabold text-[#E7E2E9]">{waitlistedCount}</p>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#E7E2E9]/80 mt-0.5">Waitlisted Events</p>
          </div>

          <div className="rounded-2xl bg-white/5 p-3.5 border border-white/5 text-center">
            <p className="text-2xl font-extrabold text-white">{totalCertificates}</p>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#D6E59A] mt-0.5">Certificates Earned</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-b border-[#E7E2E9] pb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('events')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'events'
                ? 'bg-[#292331] text-white shadow-sm'
                : 'text-[#625078] hover:bg-[#F7F5F0] hover:text-[#292331]'
            }`}
          >
            🎟️ My Registered Events ({registrations.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('certificates')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'certificates'
                ? 'bg-[#292331] text-white shadow-sm'
                : 'text-[#625078] hover:bg-[#F7F5F0] hover:text-[#292331]'
            }`}
          >
            🎓 My Certificates ({certificates.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`relative rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'notifications'
                ? 'bg-[#292331] text-white shadow-sm'
                : 'text-[#625078] hover:bg-[#F7F5F0] hover:text-[#292331]'
            }`}
          >
            <span>🔔 Notifications</span>
            {unreadCount > 0 && (
              <span className="ml-1.5 rounded-full bg-[#A34235] px-1.5 py-0.2 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-xs font-semibold text-[#625078] hover:text-[#292331] flex items-center gap-1"
        >
          <span>Explore All Campus Events →</span>
        </button>
      </div>

      {/* TAB CONTENT: MY REGISTERED EVENTS */}
      {activeTab === 'events' && (
        <section className="mt-6">
          {/* Search and Filters Bar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E7E2E9] bg-white p-3.5 shadow-sm">
            <div className="relative flex-1 min-w-[200px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search registered events by title, venue, or ticket code..."
                className="input !py-2 text-xs w-full"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {['All', 'Confirmed', 'CheckedIn', 'Waitlisted', 'Cancelled'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                    statusFilter === st
                      ? 'bg-[#625078] text-white'
                      : 'bg-[#F7F5F0] text-[#625078] hover:bg-[#E7E2E9]'
                  }`}
                >
                  {st === 'CheckedIn' ? 'Checked In' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Registrations List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 animate-pulse rounded-2xl bg-[#E7E2E9]/60" />
              ))}
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="rounded-3xl border border-[#E7E2E9] bg-white p-12 text-center text-[#625078]">
              <span className="text-4xl">🎫</span>
              <h3 className="mt-3 font-bold text-base text-[#292331]">No registered events found</h3>
              <p className="mt-1 text-xs">
                {searchQuery || statusFilter !== 'All'
                  ? 'Try clearing your search query or filter.'
                  : "You haven't registered for any campus events yet. Explore events to get your digital pass!"}
              </p>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn-primary mt-4 text-xs !py-2 !px-5"
              >
                Browse Campus Events
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRegistrations.map((reg) => {
                const event = reg.event || {};
                const isCancelled = reg.status === 'Cancelled';
                const isWaitlisted = reg.status === 'Waitlisted';
                const isCheckedIn = Boolean(reg.checkedIn);
                const isConfirmed = reg.status === 'Confirmed';

                return (
                  <div
                    key={reg._id}
                    className={`flex flex-col gap-4 rounded-3xl border bg-white p-5 shadow-sm transition sm:flex-row sm:items-center ${
                      isCancelled
                        ? 'border-[#A34235]/30 opacity-70 bg-gray-50/50'
                        : 'border-[#E7E2E9] hover:border-[#625078]/40'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="h-24 w-full shrink-0 overflow-hidden rounded-2xl bg-[#292331] sm:w-36">
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

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-[#292331]">{event.title || 'Campus Event'}</h3>
                        {event.category && (
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              categoryColors[event.category] || categoryColors.Other
                            }`}
                          >
                            {event.category}
                          </span>
                        )}

                        {/* Registration Status Badges */}
                        {isCheckedIn ? (
                          <span className="rounded-full bg-[#356548] px-2.5 py-0.5 text-xs font-bold text-white shadow-xs">
                            ✓ Checked In
                          </span>
                        ) : isWaitlisted ? (
                          <span className="rounded-full bg-[#875B18]/15 text-[#875B18] px-2.5 py-0.5 text-xs font-bold border border-[#875B18]/30">
                            Waitlist #{reg.waitlistPosition}
                          </span>
                        ) : isCancelled ? (
                          <span className="rounded-full bg-[#A34235]/15 text-[#A34235] px-2.5 py-0.5 text-xs font-bold border border-[#A34235]/30">
                            Registration Cancelled
                          </span>
                        ) : (
                          <span className="rounded-full bg-[#356548]/15 text-[#356548] px-2.5 py-0.5 text-xs font-bold border border-[#356548]/30">
                            Confirmed Seat
                          </span>
                        )}
                      </div>

                      <p className="mt-1.5 text-xs text-[#625078]">
                        📅 {formatDate(event.date)} · 🕒 {event.time} · 📍 {event.venue}
                      </p>

                      <div className="mt-2.5 flex flex-wrap items-center gap-3 font-mono text-xs text-[#292331]">
                        <span className="rounded-lg bg-[#F7F5F0] border border-[#E7E2E9] px-2 py-0.5">
                          Ticket: <strong>{reg.ticketCode}</strong>
                        </span>
                        <span className="rounded-lg bg-[#F7F5F0] border border-[#E7E2E9] px-2 py-0.5">
                          Student ID: <strong>{reg.studentId || student?.studentId}</strong>
                        </span>
                        {isCheckedIn && reg.checkedInAt && (
                          <span className="text-[#356548] font-sans font-semibold text-[11px]">
                            Checked in: {new Date(reg.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      {!isCancelled && (
                        <button
                          type="button"
                          onClick={() => setSelectedPass(reg)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#292331] px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#3d3349] transition"
                        >
                          <span>🎟️ Digital Pass</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setShowCommsEvent(event)}
                        className="btn-ghost !px-3 !py-2 text-xs"
                      >
                        📢 Updates
                      </button>

                      {!isCancelled && (
                        <button
                          type="button"
                          onClick={() => handleCancelRegistration(reg)}
                          className="rounded-xl border border-[#A34235]/30 bg-white px-3 py-2 text-xs font-semibold text-[#A34235] hover:bg-red-50 transition"
                        >
                          Cancel Seat
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* TAB CONTENT: MY CERTIFICATES */}
      {activeTab === 'certificates' && (
        <section className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#292331]">Participation Certificates</h2>
              <p className="text-xs text-[#625078]">
                Official verified certificates for completed events you attended
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-44 animate-pulse rounded-3xl bg-[#E7E2E9]/60" />
              ))}
            </div>
          ) : certificates.length === 0 ? (
            <div className="rounded-3xl border border-[#E7E2E9] bg-white p-12 text-center text-[#625078]">
              <span className="text-4xl">🎓</span>
              <h3 className="mt-3 font-bold text-base text-[#292331]">No certificates available yet</h3>
              <p className="mt-1 text-xs">
                Certificates are generated once registered campus events conclude or upon event check-in!
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {certificates.map((cert) => (
                <div
                  key={cert.certificateId}
                  className="rounded-3xl border border-[#E7E2E9] bg-white p-6 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <span className="rounded-full bg-[#D6E59A] px-2.5 py-0.5 text-[10px] font-bold text-[#292331] uppercase tracking-wider">
                      ★ Verified Certificate
                    </span>
                    <span className="font-mono text-[10px] text-[#625078]">{cert.certificateId}</span>
                  </div>

                  <h3 className="mt-3 text-lg font-bold text-[#292331] leading-snug">
                    {cert.event?.title}
                  </h3>

                  <p className="mt-1 text-xs text-[#625078]">
                    📅 {formatDate(cert.event?.date)} · 📍 {cert.event?.venue}
                  </p>

                  <div className="mt-4 rounded-xl border border-[#E7E2E9] bg-[#F7F5F0] p-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#625078]">Issued To:</span>
                      <strong className="text-[#292331]">{cert.studentName}</strong>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[#625078]">Student ID:</span>
                      <span className="font-mono text-[#292331]">{cert.studentId}</span>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-end gap-2 border-t border-[#E7E2E9] pt-4">
                    <button
                      type="button"
                      onClick={() => setSelectedCert(cert)}
                      className="btn-ghost text-xs !py-2 !px-3"
                    >
                      👁️ Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCert(cert);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#292331] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#3d3349] transition"
                    >
                      <span>📥 Download PDF</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB CONTENT: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <section className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#292331]">Registration &amp; Event Notifications</h2>
              <p className="text-xs text-[#625078]">
                Real-time updates regarding seat confirmations, waitlists, and schedule changes
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs font-semibold text-[#625078] hover:text-[#292331] underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-2xl bg-[#E7E2E9]/60" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="rounded-3xl border border-[#E7E2E9] bg-white p-12 text-center text-[#625078]">
              <span className="text-4xl">🔔</span>
              <h3 className="mt-3 font-bold text-base text-[#292331]">No notifications yet</h3>
              <p className="mt-1 text-xs">
                Registration confirmations, waitlist promotions, and event updates will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => !notif.read && handleMarkRead(notif._id)}
                  className={`rounded-2xl border p-4 transition cursor-pointer ${
                    !notif.read
                      ? 'border-[#625078]/40 bg-[#F7F5F0] shadow-xs'
                      : 'border-[#E7E2E9] bg-white opacity-85'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          notif.type === 'RegistrationConfirmation'
                            ? 'bg-[#356548]/15 text-[#356548]'
                            : notif.type === 'SeatAllocation'
                            ? 'bg-[#D6E59A] text-[#292331]'
                            : notif.type === 'Cancellation'
                            ? 'bg-[#A34235]/15 text-[#A34235]'
                            : 'bg-[#625078]/15 text-[#625078]'
                        }`}
                      >
                        {notif.type || 'Notice'}
                      </span>
                      {!notif.read && (
                        <span className="h-2 w-2 rounded-full bg-[#356548]" title="Unread" />
                      )}
                    </div>
                    <span className="text-[11px] text-[#625078]">
                      {new Date(notif.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <h4 className="mt-1.5 font-bold text-sm text-[#292331]">{notif.title}</h4>
                  <p className="mt-1 text-xs text-[#292331]/80 leading-relaxed">{notif.message}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Modals ── */}

      {/* QR Digital Pass Modal */}
      {selectedPass && (
        <DigitalPass
          registration={selectedPass}
          event={selectedPass.event}
          onClose={() => setSelectedPass(null)}
        />
      )}

      {/* Certificate Modal */}
      {selectedCert && (
        <CertificateModal
          certificate={selectedCert}
          onClose={() => setSelectedCert(null)}
        />
      )}

      {/* Edit Profile Modal */}
      {showProfileModal && (
        <StudentProfileModal
          student={student}
          onClose={() => setShowProfileModal(false)}
          onUpdated={(updated) => {
            setStudent(updated);
            studentStorage.setStudent(updated);
          }}
        />
      )}

      {/* Event Communication Centre */}
      {showCommsEvent && (
        <CommunicationCenterModal
          event={showCommsEvent}
          onClose={() => setShowCommsEvent(null)}
        />
      )}
    </div>
  );
}

