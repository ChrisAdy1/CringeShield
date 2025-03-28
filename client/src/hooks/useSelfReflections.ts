import { useState, useEffect } from 'react';
import { SelfReflectionRating } from '@/lib/types';

const STORAGE_KEY = 'cringe-shield-self-reflections';

interface SelfReflection {
  date: string;
  rating: SelfReflectionRating;
  note?: string;
}

export function useSelfReflections() {
  const [reflections, setReflections] = useState<SelfReflection[]>([]);
  
  // Load reflections from localStorage on mount
  useEffect(() => {
    const storedReflections = localStorage.getItem(STORAGE_KEY);
    if (storedReflections) {
      try {
        setReflections(JSON.parse(storedReflections));
      } catch (error) {
        console.error('Failed to parse reflections from localStorage', error);
        setReflections([]);
      }
    }
  }, []);
  
  // Save reflections to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reflections));
  }, [reflections]);
  
  // Add a new reflection
  const addReflection = (rating: SelfReflectionRating, note?: string) => {
    const newReflection: SelfReflection = {
      date: new Date().toISOString(),
      rating,
      note
    };
    
    setReflections(prevReflections => [newReflection, ...prevReflections]);
    return newReflection;
  };
  
  // Get recent reflections (default to last 7 days)
  const getRecentReflections = (days = 7) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return reflections.filter(reflection => {
      const reflectionDate = new Date(reflection.date);
      return reflectionDate >= cutoffDate;
    });
  };
  
  // Get average rating
  const getAverageRating = () => {
    if (reflections.length === 0) return 0;
    
    const sum = reflections.reduce((total, reflection) => total + reflection.rating, 0);
    return sum / reflections.length;
  };
  
  return {
    reflections,
    addReflection,
    getRecentReflections,
    getAverageRating
  };
}