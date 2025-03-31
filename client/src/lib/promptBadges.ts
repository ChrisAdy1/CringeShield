// 15 prompt badges with their corresponding emojis
export const promptBadges = [
  {
    id: 1,
    title: "Say Hello",
    icon: "🎉",
    description: "Introduced yourself with your name and a fun fact."
  },
  {
    id: 2,
    title: "What's Around You?",
    icon: "👀",
    description: "Described three things in the room you're in."
  },
  {
    id: 3,
    title: "Today Was...",
    icon: "🗓️",
    description: "Talked about how your day has been."
  },
  {
    id: 4,
    title: "Something You Love",
    icon: "💖",
    description: "Shared something you really enjoy."
  },
  {
    id: 5,
    title: "Explain It Like a Friend",
    icon: "🧑‍🤝‍🧑",
    description: "Explained something like you're talking to a friend."
  },
  {
    id: 6,
    title: "Teach Me a Trick",
    icon: "🛠️",
    description: "Shared a tip, shortcut, or life hack."
  },
  {
    id: 7,
    title: "Camera Shy Confession",
    icon: "🎭",
    description: "Talked honestly about how you feel being on camera."
  },
  {
    id: 8,
    title: "Tell a Tiny Story",
    icon: "📖",
    description: "Recalled a short, funny, or awkward moment from your life."
  },
  {
    id: 9,
    title: "What I'd Tell My Younger Self",
    icon: "🧠",
    description: "Reflected on a lesson for your younger self."
  },
  {
    id: 10,
    title: "Describe a Place You Love",
    icon: "🏞️",
    description: "Talked about a place that makes you feel good."
  },
  {
    id: 11,
    title: "Talk Like a YouTuber",
    icon: "📹",
    description: "Gave an energetic intro like a YouTuber."
  },
  {
    id: 12,
    title: "What's on Your Mind?",
    icon: "💬", 
    description: "Free talked for a minute with no script."
  },
  {
    id: 13,
    title: "A Quick Rant",
    icon: "😤",
    description: "Got something off your chest."
  },
  {
    id: 14,
    title: "Behind the Scenes",
    icon: "🎬",
    description: "Talked about something most people don't know about you."
  },
  {
    id: 15,
    title: "Encourage Someone Like You",
    icon: "🤝",
    description: "Encouraged someone else afraid to speak on camera."
  }
];

// Helper function to get badge by prompt ID
export function getBadgeByPromptId(promptId: number) {
  return promptBadges.find(badge => badge.id === promptId);
}