import { useState, useEffect, useCallback } from 'react';
import { useToast } from './components/Toast.jsx';

const INTERESTS_KEY = 'eventora_student_interests';

export function getStoredInterests() {
  try {
    const raw = localStorage.getItem(INTERESTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useInterests() {
  const [interests, setInterests] = useState(getStoredInterests);
  const { toast } = useToast();

  useEffect(() => {
    const handleStorage = () => setInterests(getStoredInterests());
    window.addEventListener('storage', handleStorage);
    window.addEventListener('eventora-interests-updated', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('eventora-interests-updated', handleStorage);
    };
  }, []);

  const setStudentInterests = useCallback(
    (newInterests) => {
      setInterests(newInterests);
      try {
        localStorage.setItem(INTERESTS_KEY, JSON.stringify(newInterests));
        window.dispatchEvent(new Event('eventora-interests-updated'));
        toast.success('Your event preferences have been updated!');
      } catch (e) {
        console.error('Failed to save interests:', e);
      }
    },
    [toast]
  );

  const toggleInterest = useCallback(
    (category) => {
      setInterests((prev) => {
        const exists = prev.includes(category);
        const updated = exists ? prev.filter((c) => c !== category) : [...prev, category];
        try {
          localStorage.setItem(INTERESTS_KEY, JSON.stringify(updated));
          window.dispatchEvent(new Event('eventora-interests-updated'));
        } catch (e) {
          console.error('Failed to toggle interest:', e);
        }
        return updated;
      });
    },
    []
  );

  return {
    interests,
    setStudentInterests,
    toggleInterest,
    hasPreferences: interests.length > 0,
  };
}

