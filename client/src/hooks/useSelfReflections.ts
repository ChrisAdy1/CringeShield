import { SelfReflectionRating } from '@/lib/types';
import useLocalStorage from './useLocalStorage';

interface SelfReflection {
  date: string;
  rating: SelfReflectionRating;
  note?: string;
}

export function useSelfReflections() {
  const [reflections, setReflections] = useLocalStorage<SelfReflection[]>('self-reflections', []);

  const addReflection = (rating: SelfReflectionRating, note?: string) => {
    const newReflection: SelfReflection = {
      date: new Date().toISOString(),
      rating,
      note
    };
    
    setReflections([...reflections, newReflection]);
    return newReflection;
  };

  const getReflectionsByDate = (startDate: Date, endDate: Date): SelfReflection[] => {
    return reflections.filter(reflection => {
      const reflectionDate = new Date(reflection.date);
      return reflectionDate >= startDate && reflectionDate <= endDate;
    });
  };

  const getAverageRating = (days: number = 7): number | null => {
    const now = new Date();
    const cutoffDate = new Date(now);
    cutoffDate.setDate(now.getDate() - days);
    
    const recentReflections = reflections.filter(reflection => {
      const reflectionDate = new Date(reflection.date);
      return reflectionDate >= cutoffDate;
    });
    
    if (recentReflections.length === 0) {
      return null;
    }
    
    const sum = recentReflections.reduce((total, reflection) => total + reflection.rating, 0);
    return sum / recentReflections.length;
  };

  const getRatingTrend = (): 'up' | 'down' | 'stable' | null => {
    if (reflections.length < 2) return null;
    
    // Sort reflections by date (oldest first)
    const sortedReflections = [...reflections].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Get first and last ratings
    const firstRating = sortedReflections[0].rating;
    const lastRating = sortedReflections[sortedReflections.length - 1].rating;
    
    if (lastRating > firstRating) return 'up';
    if (lastRating < firstRating) return 'down';
    return 'stable';
  };

  const getReflectionsCount = (): number => {
    return reflections.length;
  };

  const getReflectionData = (days: number = 7): { date: string; rating: number }[] => {
    const now = new Date();
    const result: { date: string; rating: number }[] = [];
    
    // Generate data for each day
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      // Filter reflections for this day
      const dayReflections = reflections.filter(reflection => {
        const reflectionDate = new Date(reflection.date);
        return reflectionDate >= date && reflectionDate <= endDate;
      });
      
      // Calculate average rating for the day
      let averageRating = 0;
      if (dayReflections.length > 0) {
        const sum = dayReflections.reduce((total, reflection) => total + reflection.rating, 0);
        averageRating = sum / dayReflections.length;
      }
      
      // Format date as YYYY-MM-DD
      const formattedDate = date.toISOString().split('T')[0];
      
      result.push({
        date: formattedDate,
        rating: averageRating
      });
    }
    
    return result;
  };

  return {
    reflections,
    addReflection,
    getReflectionsByDate,
    getAverageRating,
    getRatingTrend,
    getReflectionsCount,
    getReflectionData
  };
}