// 15 prompt badges with their corresponding emojis
// Plus script badges for the scripted reads
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
  },
  
  // Script badges (IDs 101-110 to match script IDs)
  {
    id: 101,
    title: "First Voice",
    icon: "🎤",
    description: "Completed the 'Self-Intro Starter' script."
  },
  {
    id: 102,
    title: "Mini Win",
    icon: "☀️",
    description: "Completed the 'Small Win Today' script."
  },
  {
    id: 103,
    title: "Heart Share",
    icon: "💞",
    description: "Completed the 'A Favorite Thing' script."
  },
  {
    id: 104,
    title: "On Purpose",
    icon: "🎯",
    description: "Completed the 'My Camera Goal' script."
  },
  {
    id: 105,
    title: "Self-Talker",
    icon: "📝",
    description: "Completed the 'A Note to Myself' script."
  },
  {
    id: 106,
    title: "Fearless Try",
    icon: "🤪",
    description: "Completed the 'What I Was Afraid Of' script."
  },
  {
    id: 107,
    title: "Unpolished Power",
    icon: "🌸",
    description: "Completed the 'Showing Up Unpolished' script."
  },
  {
    id: 108,
    title: "Mirror Moment",
    icon: "💎",
    description: "Completed the 'If This Were a Mirror' script."
  },
  {
    id: 109,
    title: "Not Alone",
    icon: "👓",
    description: "Completed the 'If You're Watching This...' script."
  },
  {
    id: 110,
    title: "My Why",
    icon: "🔥",
    description: "Completed the 'Why I'm Doing This' script."
  }
];

// Helper function to get badge by prompt ID
export function getBadgeByPromptId(promptId: number) {
  return promptBadges.find(badge => badge.id === promptId);
}