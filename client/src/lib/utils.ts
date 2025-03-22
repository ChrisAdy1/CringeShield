import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function calculateStreak(sessions: { date: string }[]): number {
  if (!sessions.length) return 0;
  
  const sortedDates = [...sessions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map(s => new Date(s.date));
    
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // If no practice today, streak is 0
  const latestDate = new Date(sortedDates[0]);
  latestDate.setHours(0, 0, 0, 0);
  
  if (latestDate.getTime() !== today.getTime() && 
      latestDate.getTime() !== today.getTime() - 86400000) {
    return 0;
  }
  
  let streak = 1;
  let currentDate = latestDate;
  
  for (let i = 1; i < sortedDates.length; i++) {
    const nextDate = new Date(sortedDates[i]);
    nextDate.setHours(0, 0, 0, 0);
    
    const diff = (currentDate.getTime() - nextDate.getTime()) / 86400000;
    
    if (diff === 1) {
      streak++;
      currentDate = nextDate;
    } else if (diff > 1) {
      break;
    }
  }
  
  return streak;
}

export function getWeekDays(locale: string = 'en-US'): string[] {
  const baseDate = new Date(2022, 0, 2); // Sunday
  const weekDays = [];
  
  for (let i = 0; i < 7; i++) {
    weekDays.push(baseDate.toLocaleDateString(locale, { weekday: 'short' }));
    baseDate.setDate(baseDate.getDate() + 1);
  }
  
  return weekDays;
}

export function getLastSevenDays(): { date: Date, label: string }[] {
  const result = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    result.push({
      date,
      label: date.toLocaleDateString('en-US', { weekday: 'short' })
    });
  }
  
  return result;
}

export const faceFilterOptions = [
  { id: 'blur', name: 'Blur filter', description: 'Blurs your face to reduce anxiety' },
  { id: 'cartoon', name: 'Cartoon filter', description: 'Applies a fun cartoon effect' },
  { id: 'silhouette', name: 'Silhouette', description: 'Shows only your outline' },
  { id: 'none', name: 'No filter', description: 'Raw video feed' }
];

export const promptCategories = [
  { 
    id: 'casual', 
    name: 'Casual Conversation', 
    description: 'Everyday talks and chats',
    icon: 'message-circle'
  },
  { 
    id: 'interview', 
    name: 'Job Interviews', 
    description: 'Professional responses',
    icon: 'briefcase'
  },
  { 
    id: 'storytelling', 
    name: 'Storytelling', 
    description: 'Compelling narratives',
    icon: 'book-open'
  },
  { 
    id: 'presentation', 
    name: 'Presentations', 
    description: 'Public speaking skills',
    icon: 'presentation'
  },
  { 
    id: 'introduction', 
    name: 'Introductions', 
    description: 'Meeting new people',
    icon: 'users'
  },
  { 
    id: 'random', 
    name: 'Random Topics', 
    description: 'Unexpected conversation starters',
    icon: 'shuffle'
  }
];

export function getDailyTip(): { tip: string; category: string } {
  const tips = [
    { 
      tip: "Try focusing on the camera as if it's a friend you're speaking to, rather than a device recording you.", 
      category: "Speaking Technique" 
    },
    { 
      tip: "Take deep breaths before you start recording. This helps reduce anxiety and clears your mind.", 
      category: "Anxiety Management" 
    },
    { 
      tip: "Speak slightly slower than you think you need to - most people speed up when nervous.", 
      category: "Delivery" 
    },
    { 
      tip: "It's okay to pause and collect your thoughts. Silence can be more powerful than filler words.", 
      category: "Speech Quality" 
    },
    { 
      tip: "Smile naturally at the beginning and end of your recording - it helps you appear more confident.", 
      category: "Body Language" 
    }
  ];
  
  // In a real app, we'd cycle through these or randomize properly
  // For now, just use the current date to pick one deterministically 
  const dayOfMonth = new Date().getDate();
  return tips[dayOfMonth % tips.length];
}
