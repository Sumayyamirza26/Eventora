import { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, X } from 'lucide-react';
import { api } from '../api.js';
import { formatDate } from '../utils.js';

export default function EventStatsModal({ eventId, onClose }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = () => {
    if (!eventId) return;
    setLoading(true);
    setError('');
    api.getStats(eventId)
      .then((data) => setStats(data))
      .catch((err) => setError(err.message || 'Failed to load statistics'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStats();
  }, [eventId]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#292331]/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-pop rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-[#E7E2E9]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#E7E2E9] pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#625078]">
              Lifecycle Analytics
            </span>
            <h3 className="text-2xl font-extrabold text-[#292331]">Post-Event Statistics</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="grid h-8 w-8 place-items-center rounded-xl text-slate-400 hover:bg-[#F7F5F0] hover:text-[#292331] transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-[#625078]">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#292331] border-t-transparent" />
            <p className="mt-3 text-xs font-semibold">Calculating attendance &amp; seat analytics...</p>
          </div>
        ) : error ? (
          <div className="my-6 rounded-2xl bg-[#A34235]/10 p-5 text-center text-xs text-[#A34235] border border-[#A34235]/20">
            <p className="font-bold text-sm mb-1">Could Not Load Statistics</p>
            <p>{error}</p>
            <button
              type="button"
              onClick={loadStats}
              className="btn-ghost mt-3 text-xs !py-1 !px-4"
            >
              Try Again
            </button>
          </div>
        ) : stats ? (
          <div className="mt-6 space-y-6">
            {/* Event Overview Card */}
            <div className="rounded-2xl border border-[#E7E2E9] bg-[#F7F5F0] p-4 text-xs text-[#292331]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-base font-bold text-[#292331]">{stats.event.title}</h4>
                <span className="rounded-full bg-[#292331] px-2.5 py-0.5 text-[10px] font-bold text-white">
                  Status: {stats.event.status}
                </span>
              </div>
              <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[#625078]">
                <Calendar className="h-3.5 w-3.5 inline shrink-0" />
                <span>{formatDate(stats.event.date)}</span>
                <span>·</span>
                <Clock className="h-3.5 w-3.5 inline shrink-0" />
                <span>{stats.event.time}</span>
                <span>·</span>
                <MapPin className="h-3.5 w-3.5 inline shrink-0" />
                <span>{stats.event.venue}</span>
              </p>
            </div>

            {/* Key KPI Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-2xl border border-[#E7E2E9] bg-white p-4 text-center shadow-xs">
                <p className="text-2xl font-extrabold text-[#292331]">{stats.totalCapacity}</p>
                <p className="text-[11px] font-semibold text-[#625078] mt-0.5">Total Capacity</p>
              </div>

              <div className="rounded-2xl border border-[#E7E2E9] bg-white p-4 text-center shadow-xs">
                <p className="text-2xl font-extrabold text-[#625078]">{stats.confirmedCount}</p>
                <p className="text-[11px] font-semibold text-[#625078] mt-0.5">Confirmed Seats</p>
              </div>

              <div className="rounded-2xl border border-[#E7E2E9] bg-white p-4 text-center shadow-xs">
                <p className="text-2xl font-extrabold text-[#356548]">{stats.checkedInCount}</p>
                <p className="text-[11px] font-semibold text-[#625078] mt-0.5">Attendees Checked In</p>
              </div>

              <div className="rounded-2xl border border-[#E7E2E9] bg-white p-4 text-center shadow-xs">
                <p className="text-2xl font-extrabold text-[#875B18]">{stats.waitlistedCount}</p>
                <p className="text-[11px] font-semibold text-[#625078] mt-0.5">Waitlisted Students</p>
              </div>
            </div>

            {/* Attendance & Utilization Rates */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-[#E7E2E9] bg-[#F7F5F0] p-4">
                <div className="flex justify-between items-center mb-1 text-xs">
                  <span className="font-bold text-[#292331]">Actual Attendance Rate</span>
                  <span className="font-extrabold text-[#356548] text-sm">{stats.attendanceRate}%</span>
                </div>
                <div className="h-2 rounded-full bg-[#E7E2E9] overflow-hidden">
                  <div className="h-full bg-[#356548] rounded-full" style={{ width: `${stats.attendanceRate}%` }} />
                </div>
                <p className="mt-1.5 text-[11px] text-[#625078]">
                  {stats.checkedInCount} of {stats.confirmedCount} registered students attended
                </p>
              </div>

              <div className="rounded-2xl border border-[#E7E2E9] bg-[#F7F5F0] p-4">
                <div className="flex justify-between items-center mb-1 text-xs">
                  <span className="font-bold text-[#292331]">Capacity Utilization</span>
                  <span className="font-extrabold text-[#292331] text-sm">{stats.capacityUtilization}%</span>
                </div>
                <div className="h-2 rounded-full bg-[#E7E2E9] overflow-hidden">
                  <div className="h-full bg-[#292331] rounded-full" style={{ width: `${stats.capacityUtilization}%` }} />
                </div>
                <p className="mt-1.5 text-[11px] text-[#625078]">
                  {stats.confirmedCount} of {stats.totalCapacity} total available seats filled
                </p>
              </div>
            </div>

            {/* Department Breakdown */}
            {stats.departmentBreakdown?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#625078] mb-2.5">
                  Attendee Department Breakdown
                </h4>
                <div className="space-y-2">
                  {stats.departmentBreakdown.map((dept) => {
                    const pct = Math.round((dept.count / (stats.confirmedCount || 1)) * 100);
                    return (
                      <div key={dept.name} className="text-xs">
                        <div className="flex justify-between text-[#292331] mb-1">
                          <span className="font-semibold">{dept.name}</span>
                          <span className="text-[#625078]">{dept.count} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-[#E7E2E9] overflow-hidden">
                          <div className="h-full bg-[#625078] rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : null}

        <div className="mt-6 flex justify-end border-t border-[#E7E2E9] pt-4">
          <button type="button" onClick={onClose} className="btn-primary text-xs !py-2 !px-6">
            Close Statistics
          </button>
        </div>
      </div>
    </div>
  );
}

