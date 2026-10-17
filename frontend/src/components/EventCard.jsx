import { useState } from 'react';
import { formatDate, categoryColors } from '../utils.js';

export default function EventCard({ event, index, onOpen }) {
  const [imgFailed, setImgFailed] = useState(false);
  const spotsLeft = Math.max(event.capacity - event.registered, 0);
  const percentFull = Math.min((event.registered / event.capacity) * 100, 100);

  return (
    <article
      className="group flex animate-fade-up flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition duration-300 hover:-translate-y-1.5 hover:shadow-xl"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-indigo-500 to-fuchsia-500">
        {event.imageUrl && !imgFailed && (
          <img
            src={event.imageUrl}
            alt={event.title}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        )}
        <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${categoryColors[event.category]}`}>
          {event.category}
        </span>
        <span className="absolute right-3 top-3 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-800 shadow">
          {formatDate(event.date)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold leading-snug text-slate-900">{event.title}</h3>
        <p className="mt-1 text-sm text-slate-500">🕒 {event.time} &nbsp;·&nbsp; 📍 {event.venue}</p>
        <p className="mt-3 line-clamp-2 text-sm text-slate-600">{event.description}</p>

        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs font-medium text-slate-500">
            <span>{event.registered} registered</span>
            <span>{spotsLeft === 0 ? 'Full' : `${spotsLeft} spots left`}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${percentFull >= 90 ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-500 to-fuchsia-500'}`}
              style={{ width: `${percentFull}%` }}
            />
          </div>
        </div>

        <button onClick={() => onOpen(event)} className="btn-primary mt-5 w-full">
          View Details &amp; Register
        </button>
      </div>
    </article>
  );
}
