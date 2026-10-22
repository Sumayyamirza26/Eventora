import { useState } from 'react';
import { Check, Target, X } from 'lucide-react';
import { CATEGORIES } from '../utils.js';

export default function InterestsModal({ selectedInterests, onSave, onClose }) {
  const [selected, setSelected] = useState(selectedInterests || []);

  const toggle = (cat) => {
    setSelected((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSave = () => {
    onSave(selected);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#292331]/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md animate-pop overflow-hidden rounded-3xl bg-white p-6 shadow-2xl border border-[#E7E2E9]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#E7E2E9] pb-4">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#D6E59A] text-sm font-bold text-[#292331]">
              <Target className="h-4 w-4 text-[#292331]" />
            </span>
            <div>
              <h3 className="font-bold text-base text-[#292331]">Your Campus Interests</h3>
              <p className="text-xs text-[#625078]">Personalize your event recommendations</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-[#F7F5F0] hover:text-[#292331] transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-4 text-xs text-[#625078] leading-relaxed">
          Select the event categories you care about most. We will prioritize these in your <strong>"Recommended for You"</strong> feed.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {CATEGORIES.map((cat) => {
            const isChecked = selected.includes(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggle(cat)}
                className={`flex items-center justify-between rounded-xl border p-3 text-xs font-semibold transition ${
                  isChecked
                    ? 'border-[#625078] bg-[#625078] text-white shadow-sm'
                    : 'border-[#E7E2E9] bg-white text-[#292331] hover:bg-[#F7F5F0]'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`grid h-5 w-5 place-items-center rounded-md text-[10px] ${
                    isChecked ? 'bg-[#D6E59A] text-[#292331]' : 'border border-[#E7E2E9] bg-[#F7F5F0]'
                  }`}
                >
                  {isChecked ? <Check className="h-3 w-3 stroke-[3]" /> : null}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end gap-2 border-t border-[#E7E2E9] pt-4">
          <button type="button" onClick={onClose} className="btn-ghost text-xs !py-2">
            Cancel
          </button>
          <button type="button" onClick={handleSave} className="btn-primary text-xs !py-2 !px-5">
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}

