import { useState, useEffect, useCallback } from 'react';
import { useToast } from './components/Toast.jsx';

const FAVOURITES_KEY = 'eventora_favourites';

function getStoredFavourites() {
  try {
    const raw = localStorage.getItem(FAVOURITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useFavourites() {
  const [favourites, setFavourites] = useState(getStoredFavourites);
  const { toast } = useToast();

  useEffect(() => {
    const handleStorage = () => {
      setFavourites(getStoredFavourites());
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('eventora-favourites-updated', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('eventora-favourites-updated', handleStorage);
    };
  }, []);

  const isFavourite = useCallback(
    (id) => {
      if (!id) return false;
      return favourites.includes(String(id));
    },
    [favourites]
  );

  const toggleFavourite = useCallback(
    (event) => {
      if (!event || !event._id) return;
      const id = String(event._id);

      setFavourites((prev) => {
        let updated;
        const exists = prev.includes(id);

        if (exists) {
          updated = prev.filter((item) => item !== id);
          toast.info(`Removed "${event.title}" from favourites`);
        } else {
          updated = [...prev, id];
          toast.success(`Saved "${event.title}" to favourites`);
        }

        try {
          localStorage.setItem(FAVOURITES_KEY, JSON.stringify(updated));
          window.dispatchEvent(new Event('eventora-favourites-updated'));
        } catch (e) {
          console.error('Failed to update favourites:', e);
        }

        return updated;
      });
    },
    [toast]
  );

  return {
    favourites,
    isFavourite,
    toggleFavourite,
    favouritesCount: favourites.length,
  };
}

