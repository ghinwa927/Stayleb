"use client";
import { useEffect, useState } from 'react';
import { getPublicAmenities } from '@/services/properties';
import type { Amenity } from '@/services/owner';

export function useAmenities() {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{ items: Amenity[]; loading: boolean; error: boolean }>({ items: [], loading: true, error: false });
  useEffect(() => {
    let active = true;
    getPublicAmenities().then(items => {
      if (active) setState({ items, loading: false, error: false });
    }).catch(() => {
      if (active) setState({ items: [], loading: false, error: true });
    });
    return () => { active = false; };
  }, [attempt]);
  return { ...state, retry: () => { setState({ items: [], loading: true, error: false }); setAttempt(value => value + 1); } };
}
