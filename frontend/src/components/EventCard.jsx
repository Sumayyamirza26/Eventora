import { useState } from 'react';
import { Bookmark, Clock, MapPin, Sparkles, Target } from 'lucide-react';
import { formatDate, categoryColors } from '../utils.js';

export default function EventCard({
  event,
  index,
  onOpen,
  isFav,
  onToggleFav,
  isRecommended = false,
  matchReason = '',
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const capacity = Number(event.capacity) || 1;
  const registered = Number(event.registered) || 0;
  const waitlisted = Number(event.waitlisted) || 0;
  const spotsLeft = Math.max(capacity - registered, 0);
  const percentFull = Math.min(Math.round((registered / capacity) * 100), 100);

  const isCancelled = event.status === 'Cancelled';
  const isCompleted = event.status === 'Completed';
  const isSoldOut = spotsLeft === 0;
  const isFewSeats = !isSoldOut && (spotsLeft <= 5 || spotsLeft <= Math.ceil(capacity * 0.15));

  return (
    <article
      className="group flex animate-fade-up flex-col overflow-hidden rounded-2xl bg-white border border-[#E7E2E9] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#625078]/40"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Media Header */}
      <div className="relative h-48 overflow-hidden bg-[#292331]">
        {event.imageUrl && !imgFailed ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[#292331] via-[#625078] to-[#292331] p-6 flex flex-col justify-end">
            <span className="text-white/40 text-xs font-mono uppercase tracking-widest">Eventora Event</span>
            <span className="text-white text-lg font-bold leading-tight line-clamp-2 mt-1">{event.title}</span>
          </div>
        )}

        {/* Category & Recommended Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5 items-start">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-md shadow-sm ${
              categoryColors[event.category] || categoryColors.Other
            }`}
          >
            {event.category}
          </span>

          {isRecommended && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#D6E59A] px-2.5 py-0.5 text-[10px] font-bold text-[#292331] shadow-md backdrop-blur">
              <Sparkles className="h-3 w-3" />
              <span>For You</span>
            </span>
          )}

          {isCancelled && (
            <span className="rounded-full bg-[#A34235] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
              Cancelled
            </span>
          )}
          {isCompleted && (
            <span className="rounded-full bg-[#625078] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
              Concluded
            </span>
          )}
        </div>

        {/* Right Badges: Date & Favourite Bookmark */}
        <div className="absolute right-3 top-3 flex items-center gap-1.5">
          <span className="rounded-xl bg-white/95 px-2.5 py-1 text-xs font-semibold text-[#292331] shadow-sm backdrop-blur">
            {formatDate(event.date)}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFav(event);
            }}
            title={isFav ? 'Remove from favourites' : 'Save to favourites'}
            aria-label={isFav ? `Remove ${event.title} from favourites` : `Save ${event.title} to favourites`}
            className={`grid h-8 w-8 place-items-center rounded-xl shadow-sm backdrop-blur transition active:scale-95 ${
              isFav
                ? 'bg-[#292331] text-[#D6E59A] ring-2 ring-[#D6E59A]/60'
                : 'bg-white/90 text-[#625078] hover:bg-white hover:text-[#292331]'
            }`}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill={isFav ? '#D6E59A' : 'none'}
              stroke="currentColor"
              strokeWidth={isFav ? '1.5' : '2'}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>

        {/* Sold out overlay banner if completely full */}
        {isSoldOut && !isCancelled && !isCompleted && (
          <div className="absolute inset-0 bg-[#292331]/50 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
            <span className="rounded-full bg-[#A34235] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md">
              Sold Out · Waitlist Open
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold leading-snug text-[#292331] group-hover:text-[#625078] transition line-clamp-1">
          {event.title}
        </h3>
        <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs font-medium text-[#625078]">
          <Clock className="h-3.5 w-3.5 inline shrink-0" />
          <span>{event.time}</span>
          <span>·</span>
          <MapPin className="h-3.5 w-3.5 inline shrink-0" />
          <span>{event.venue}</span>
        </p>

        {isRecommended && matchReason && (
          <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[#625078]">
            <Target className="h-3 w-3 inline shrink-0" />
            <span>{matchReason}</span>
          </p>
        )}

        <p className="mt-2 line-clamp-2 text-sm text-[#292331]/80 leading-relaxed">
          {event.description}
        </p>

        {/* Visual Seat Availability */}
        <div className="mt-4 pt-4 border-t border-[#E7E2E9]">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-medium text-[#625078]">
              {registered} of {capacity} seats filled ({percentFull}%)
            </span>
            {isSoldOut ? (
              <span className="inline-flex items-center gap-1 font-bold text-[#875B18]">
                <span className="h-2 w-2 rounded-full bg-[#875B18]" />
                Waitlist ({waitlisted})
              </span>
            ) : isFewSeats ? (
              <span className="inline-flex items-center gap-1 font-bold text-[#875B18]">
                <span className="h-2 w-2 rounded-full bg-[#875B18] animate-pulse" />
                Few seats left ({spotsLeft})
              </span>
            ) : (
              <span className="font-semibold text-[#356548]">
                {spotsLeft} seats available
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#E7E2E9]">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isSoldOut
                  ? 'bg-[#875B18]'
                  : isFewSeats
                  ? 'bg-[#875B18]'
                  : 'bg-[#292331]'
              }`}
              style={{ width: `${percentFull}%` }}
              role="progressbar"
              aria-valuenow={registered}
              aria-valuemin={0}
              aria-valuemax={capacity}
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-5">
          {isCancelled ? (
            <button
              type="button"
              onClick={() => onOpen(event)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#A34235]/40 bg-[#A34235]/5 px-4 py-2.5 text-sm font-semibold text-[#A34235] transition hover:bg-[#A34235]/10"
            >
              <span>Cancelled · View Notice</span>
            </button>
          ) : isCompleted ? (
            <button
              type="button"
              onClick={() => onOpen(event)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#E7E2E9] bg-[#F7F5F0] px-4 py-2.5 text-sm font-semibold text-[#625078] transition hover:bg-slate-100"
            >
              <span>Concluded · View Details</span>
            </button>
          ) : isSoldOut ? (
            <button
              type="button"
              onClick={() => onOpen(event)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#875B18]/40 bg-[#875B18]/10 px-4 py-2.5 text-sm font-bold text-[#875B18] transition hover:bg-[#875B18]/20"
            >
              <span>Sold Out · Join Waitlist</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onOpen(event)}
              className="btn-primary w-full"
            >
              <span>View Details &amp; Register</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
