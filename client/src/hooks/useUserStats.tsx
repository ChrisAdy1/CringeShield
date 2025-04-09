import { useQuery } from '@tanstack/react-query';
import { Session } from '@shared/schema';
import { getQueryFn } from '@/lib/queryClient';
import { formatDate } from '@/lib/utils';

interface UserStats {
  totalPrompts: number;
  totalSessions: number;
  longestStreak: number;
  averageRating: number;
}

export function useUserStats() {
  // Fetch user lifetime stats
  const {
    data: stats,
    isLoading: isStatsLoading,
    error: statsError,
  } = useQuery<UserStats>({
    queryKey: ['/api/user/stats'],
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: true,
  });

  // Fetch user sessions for history
  const {
    data: sessions,
    isLoading: isSessionsLoading,
    error: sessionsError,
  } = useQuery<Session[]>({
    queryKey: ['/api/sessions'],
    staleTime: 1000 * 60 * 5,
    enabled: true,
  });

  // Process sessions to include formatted date
  const processedSessions = sessions?.map(session => ({
    ...session,
    formattedDate: formatDate(new Date(session.date))
  })) || [];

  // Sort sessions by date (most recent first)
  const sortedSessions = [...processedSessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Calculate statistics for timeline visualization
  const sessionsPerMonth: { [key: string]: number } = {};
  processedSessions.forEach(session => {
    const date = new Date(session.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!sessionsPerMonth[monthKey]) {
      sessionsPerMonth[monthKey] = 0;
    }
    sessionsPerMonth[monthKey]++;
  });

  // Format for timeline visualization
  const timelineData = Object.entries(sessionsPerMonth).map(([month, count]) => ({
    month,
    count
  })).sort((a, b) => a.month.localeCompare(b.month));

  return {
    stats,
    sessions: sortedSessions,
    timelineData,
    isLoading: isStatsLoading || isSessionsLoading,
    error: statsError || sessionsError,
  };
}