import { useCallback } from 'react';
import useLocalStorage from './useLocalStorage';
import { SelfReflectionRating } from '@/lib/types';

interface SelfReflection {
  date: string;
  rating: SelfReflectionRating;
  note?: string;
}

export function useSelfReflections() {
  const [reflections, setReflections] = useLocalStorage<SelfReflection[]>('self-reflections', []);

  // Add a new reflection
  const addReflection = useCallback((rating: SelfReflectionRating, note?: string) => {
    const newReflection: SelfReflection = {
      date: new Date().toISOString(),
      rating,
      note
    };
    
    setReflections(prev => [...prev, newReflection]);
  }, [setReflections]);

  // Get reflections within a date range
  const getReflectionsByDate = useCallback((startDate: Date, endDate: Date): SelfReflection[] => {
    return reflections.filter(reflection => {
      const reflectionDate = new Date(reflection.date);
      return reflectionDate >= startDate && reflectionDate <= endDate;
    });
  }, [reflections]);

  // Get average rating for time period
  const getAverageRating = useCallback((days: number = 30): number => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentReflections = reflections.filter(reflection => 
      new Date(reflection.date) >= cutoffDate
    );
    
    if (recentReflections.length === 0) {
      return 0;
    }
    
    const sum = recentReflections.reduce((total, reflection) => 
      total + reflection.rating, 0
    );
    
    return sum / recentReflections.length;
  }, [reflections]);

  return {
    reflections,
    addReflection,
    getReflectionsByDate,
    getAverageRating
  };
}