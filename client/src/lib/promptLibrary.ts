import { Prompt } from './types';
import { exercisePrompts } from './exercisePrompts';

// Casual Conversation Prompts
export const casualPrompts: Prompt[] = [
  {
    id: 101,
    category: 'casual',
    text: "Talk about your favorite hobby and why you enjoy it."
  },
  {
    id: 102,
    category: 'casual',
    text: "Describe your ideal weekend."
  },
  {
    id: 103,
    category: 'casual',
    text: "Share a recent movie or book that you enjoyed and why."
  },
  {
    id: 104,
    category: 'casual',
    text: "Discuss a place you'd like to visit and what draws you there."
  },
  {
    id: 105,
    category: 'casual',
    text: "Talk about a recipe or dish you love to make or eat."
  }
];

// Interview Prompts
export const interviewPrompts: Prompt[] = [
  {
    id: 201,
    category: 'interview',
    text: "Tell me about yourself and your professional background."
  },
  {
    id: 202,
    category: 'interview',
    text: "What are your greatest strengths and how do they help you in a professional setting?"
  },
  {
    id: 203,
    category: 'interview',
    text: "Describe a challenging situation at work and how you handled it."
  },
  {
    id: 204,
    category: 'interview',
    text: "Why are you interested in this position and what can you bring to the role?"
  },
  {
    id: 205,
    category: 'interview',
    text: "Where do you see yourself in five years?"
  }
];

// Storytelling Prompts
export const storytellingPrompts: Prompt[] = [
  {
    id: 301,
    category: 'storytelling',
    text: "Share a memorable childhood experience that shaped who you are today."
  },
  {
    id: 302,
    category: 'storytelling',
    text: "Tell a story about a time when you faced a fear or overcame a challenge."
  },
  {
    id: 303,
    category: 'storytelling',
    text: "Describe a moment when you felt truly proud of yourself or someone else."
  },
  {
    id: 304,
    category: 'storytelling',
    text: "Share a funny or embarrassing situation that happened to you."
  },
  {
    id: 305,
    category: 'storytelling',
    text: "Tell a story about a significant turning point in your life."
  }
];

// Presentation Prompts
export const presentationPrompts: Prompt[] = [
  {
    id: 401,
    category: 'presentation',
    text: "Introduce a new product or service to potential customers."
  },
  {
    id: 402,
    category: 'presentation',
    text: "Present a brief overview of a project you recently completed."
  },
  {
    id: 403,
    category: 'presentation',
    text: "Explain a concept or process as if teaching it to someone new."
  },
  {
    id: 404,
    category: 'presentation',
    text: "Give a brief presentation about a trend in your industry or field of interest."
  },
  {
    id: 405,
    category: 'presentation',
    text: "Deliver a project status update to stakeholders."
  }
];

// Introduction Prompts
export const introductionPrompts: Prompt[] = [
  {
    id: 501,
    category: 'introduction',
    text: "Introduce yourself to a new group of colleagues at work."
  },
  {
    id: 502,
    category: 'introduction',
    text: "Present yourself at a networking event in your industry."
  },
  {
    id: 503,
    category: 'introduction',
    text: "Introduce yourself to neighbors after moving to a new area."
  },
  {
    id: 504,
    category: 'introduction',
    text: "Share a brief introduction about yourself for a social club or hobby group."
  },
  {
    id: 505,
    category: 'introduction',
    text: "Introduce yourself on the first day of a class or workshop."
  }
];

// Social Media Prompts
export const socialMediaPrompts: Prompt[] = [
  {
    id: 601,
    category: 'social_media',
    text: "Create a 30-second TikTok introducing a day in your life."
  },
  {
    id: 602,
    category: 'social_media',
    text: "Record a YouTube intro for a channel about a topic you are passionate about."
  },
  {
    id: 603,
    category: 'social_media',
    text: "Film an Instagram Reel sharing a quick tip or hack in your area of expertise."
  },
  {
    id: 604,
    category: 'social_media',
    text: "Create an engaging hook for a video about a recent experience."
  },
  {
    id: 605,
    category: 'social_media',
    text: "Record a product review or unboxing video for social media."
  }
];

// Persuasion Prompts
export const persuasionPrompts: Prompt[] = [
  {
    id: 701,
    category: 'persuasion',
    text: "Convince someone to try a hobby or activity you enjoy."
  },
  {
    id: 702,
    category: 'persuasion',
    text: "Make a case for a policy or rule change at work or school."
  },
  {
    id: 703,
    category: 'persuasion',
    text: "Persuade an audience to adopt a new habit that has improved your life."
  },
  {
    id: 704,
    category: 'persuasion',
    text: "Pitch a creative idea or solution to a common problem."
  },
  {
    id: 705,
    category: 'persuasion',
    text: "Convince someone to visit a place you love."
  }
];

// Feedback Prompts
export const feedbackPrompts: Prompt[] = [
  {
    id: 801,
    category: 'feedback',
    text: "Provide constructive feedback on a hypothetical project that needs improvement."
  },
  {
    id: 802,
    category: 'feedback',
    text: "Give balanced feedback to a team member who has been missing deadlines."
  },
  {
    id: 803,
    category: 'feedback',
    text: "Share appreciation feedback highlighting the specific strengths of a colleague."
  },
  {
    id: 804,
    category: 'feedback',
    text: "Deliver feedback about a service experience (restaurant, store, etc.)."
  },
  {
    id: 805,
    category: 'feedback',
    text: "Provide feedback to a friend asking for your honest opinion on their work."
  }
];

// Technical Explanation Prompts
export const technicalPrompts: Prompt[] = [
  {
    id: 901,
    category: 'technical',
    text: "Explain a technical concept from your field to someone with no background knowledge."
  },
  {
    id: 902,
    category: 'technical',
    text: "Walk through the steps of a technical process you are familiar with."
  },
  {
    id: 903,
    category: 'technical',
    text: "Describe how a common technology works in simple terms."
  },
  {
    id: 904,
    category: 'technical',
    text: "Explain the benefits and limitations of a technical tool or approach."
  },
  {
    id: 905,
    category: 'technical',
    text: "Give a brief tutorial on how to use a specific software feature or app."
  }
];

// Debate Prompts
export const debatePrompts: Prompt[] = [
  {
    id: 1001,
    category: 'debate',
    text: "Present arguments for or against remote work versus office work."
  },
  {
    id: 1002,
    category: 'debate',
    text: "Debate the pros and cons of social media in today's society."
  },
  {
    id: 1003,
    category: 'debate',
    text: "Discuss whether artificial intelligence will have a mostly positive or negative impact."
  },
  {
    id: 1004,
    category: 'debate',
    text: "Argue for or against a four-day workweek."
  },
  {
    id: 1005,
    category: 'debate',
    text: "Present a case for or against requiring specific education for certain career paths."
  }
];

// Networking Prompts
export const networkingPrompts: Prompt[] = [
  {
    id: 1101,
    category: 'networking',
    text: "Introduce yourself and what you do in a memorable elevator pitch (30 seconds)."
  },
  {
    id: 1102,
    category: 'networking',
    text: "Practice asking thoughtful questions to a new professional contact."
  },
  {
    id: 1103,
    category: 'networking',
    text: "Describe your professional background and what you are looking for in new connections."
  },
  {
    id: 1104,
    category: 'networking',
    text: "Follow up after meeting someone at an event, mentioning specific points from your conversation."
  },
  {
    id: 1105,
    category: 'networking',
    text: "Request a brief informational interview with someone in your desired field."
  }
];

// Crisis Communication Prompts
export const crisisPrompts: Prompt[] = [
  {
    id: 1201,
    category: 'crisis',
    text: "Address concerns about a hypothetical product issue or recall."
  },
  {
    id: 1202,
    category: 'crisis',
    text: "Communicate about unexpected delays or changes to a project timeline."
  },
  {
    id: 1203,
    category: 'crisis',
    text: "Deliver difficult news to a team or group."
  },
  {
    id: 1204,
    category: 'crisis',
    text: "Respond to criticism or negative feedback in a professional manner."
  },
  {
    id: 1205,
    category: 'crisis',
    text: "Navigate a misunderstanding or conflict in a calm, solution-focused way."
  }
];

// Impromptu Speaking Prompts
export const improvPrompts: Prompt[] = [
  {
    id: 1301,
    category: 'improv',
    text: "Speak for one minute about the last photo you took on your phone."
  },
  {
    id: 1302,
    category: 'improv',
    text: "Give an impromptu toast at a celebration for a friend or colleague."
  },
  {
    id: 1303,
    category: 'improv',
    text: "Share your thoughts on a random object in your room right now."
  },
  {
    id: 1304,
    category: 'improv',
    text: "If you could have dinner with anyone, living or dead, who would it be and why?"
  },
  {
    id: 1305,
    category: 'improv',
    text: "What is something you have changed your mind about recently and why?"
  }
];

// Random Prompts
export const randomPrompts: Prompt[] = [
  {
    id: 1401,
    category: 'random',
    text: "If you could have any superpower, what would it be and how would you use it?"
  },
  {
    id: 1402,
    category: 'random',
    text: "Describe your perfect day from morning to night."
  },
  {
    id: 1403,
    category: 'random',
    text: "If you could instantly master any skill, what would you choose and why?"
  },
  {
    id: 1404,
    category: 'random',
    text: "What piece of technology or invention has had the biggest impact on your life?"
  },
  {
    id: 1405,
    category: 'random',
    text: "If you could live in any fictional world (from a book, movie, etc.), which would you choose?"
  }
];

// Combine all prompts into a single library
export const allPrompts: Record<string, Prompt[]> = {
  casual: casualPrompts,
  interview: interviewPrompts,
  storytelling: storytellingPrompts,
  presentation: presentationPrompts,
  introduction: introductionPrompts,
  social_media: socialMediaPrompts,
  persuasion: persuasionPrompts,
  feedback: feedbackPrompts,
  technical: technicalPrompts,
  debate: debatePrompts,
  networking: networkingPrompts,
  crisis: crisisPrompts,
  improv: improvPrompts,
  random: randomPrompts,
  exercise: exercisePrompts.shy_starter,
  shy_starter: exercisePrompts.shy_starter,
  growing_speaker: exercisePrompts.growing_speaker,
  confident_creator: exercisePrompts.confident_creator
};

// Helper function to get prompts by category
export function getPromptsByCategory(category: string): Prompt[] {
  return allPrompts[category] || [];
}

// Helper function to get a random prompt from a category
export function getRandomPrompt(category: string): Prompt | undefined {
  const prompts = getPromptsByCategory(category);
  if (prompts.length === 0) return undefined;
  
  const randomIndex = Math.floor(Math.random() * prompts.length);
  return prompts[randomIndex];
}