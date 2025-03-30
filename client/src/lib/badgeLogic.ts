interface UserData {
  totalSessions: number;
  [key: string]: any;
}

interface Session {
  scriptUsed?: boolean;
  mode?: string;
  retries?: number;
  note?: string;
  [key: string]: any;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  check: (arg1: any, arg2?: any) => boolean;
}

export const badges: Badge[] = [
  {
    id: 'first_step',
    name: 'First Step',
    icon: '🎯',
    check: (session: Session, userData: UserData) => {
      return userData.totalSessions === 1;
    }
  },
  {
    id: 'smooth_reader',
    name: 'Smooth Reader',
    icon: '📝',
    check: (session: Session) => {
      return !!session.scriptUsed || session.mode === 'script';
    }
  },
  {
    id: 'free_spirit',
    name: 'Free Spirit',
    icon: '🦅',
    check: (session: Session) => {
      return session.mode === 'free';
    }
  },
  {
    id: 'bounce_back',
    name: 'Bounce Back',
    icon: '🔄',
    check: (session: Session) => {
      return !!session.retries && session.retries > 0;
    }
  },
  {
    id: 'reflector',
    name: 'Reflector',
    icon: '🤔',
    check: (session: Session) => {
      return !!session.note && session.note.length > 0;
    }
  },
  {
    id: 'regular',
    name: 'Regular',
    icon: '⭐',
    check: (session: Session, userData: UserData) => {
      return userData.totalSessions >= 5;
    }
  },
  {
    id: 'dedicated',
    name: 'Dedicated',
    icon: '🌟',
    check: (session: Session, userData: UserData) => {
      return userData.totalSessions >= 10;
    }
  },
  {
    id: 'master',
    name: 'Master',
    icon: '👑',
    check: (session: Session, userData: UserData) => {
      return userData.totalSessions >= 25;
    }
  }
];

export function checkEarnedBadges(
  session: Session, 
  userData: UserData, 
): string[] {
  return badges
    .filter(badge => badge.check(session, userData))
    .map(badge => badge.name);
}