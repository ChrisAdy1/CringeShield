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
    id: "first_step",
    name: "First Step",
    icon: "🎉",
    check: (userData: any) => userData && userData.totalSessions === 1,
  },
  {
    id: "smooth_reader",
    name: "Smooth Reader",
    icon: "📜",
    check: (session: any) => session && session.scriptUsed === true,
  },
  {
    id: "free_spirit",
    name: "Free Spirit",
    icon: "💬",
    check: (session: any) => session && session.mode === "freeTalk",
  },
  {
    id: "bounce_back",
    name: "Bounce Back",
    icon: "🔁",
    check: (session: any) => session && (session.retries || 0) > 0,
  },
  {
    id: "reflector",
    name: "Reflector",
    icon: "🧠",
    check: (session: any) => session && !!session.note,
  },
];

export function checkEarnedBadges(
  session: Session, 
  userData: UserData, 
  alreadyEarned: string[] = []
): string[] {
  return badges
    .filter((b) => {
      // Check if badge is already earned
      if (alreadyEarned.includes(b.id)) {
        return false;
      }
      
      // Determine which parameter to pass based on the badge
      if (b.id === "first_step") {
        return b.check(userData);
      } else {
        return b.check(session);
      }
    })
    .map((b) => b.id);
}