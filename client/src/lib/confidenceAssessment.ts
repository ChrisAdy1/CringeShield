export const confidenceQuestions = [
  {
    id: "q1",
    question: "How often do you record yourself speaking on camera?",
    options: ["Never", "A few times a year", "A few times a month", "Weekly or more"],
  },
  {
    id: "q2",
    question: "How do you feel right before hitting record?",
    options: [
      "Extremely nervous or avoid it altogether",
      "A bit anxious, but I do it anyway",
      "Mostly comfortable",
      "Totally confident and energized",
    ],
  },
  {
    id: "q3",
    question: "What best describes your experience with speaking on camera?",
    options: [
      "I avoid it whenever possible",
      "I've tried but often feel awkward or freeze",
      "I do okay with some prep",
      "I enjoy it and do it regularly",
    ],
  },
  {
    id: "q4",
    question: "When you watch yourself back on camera, how do you usually feel?",
    options: [
      "I cringe and turn it off",
      "I notice a lot I want to fix",
      "I'm okay with it",
      "I like how I come across",
    ],
  },
  {
    id: "q5",
    question: "What's your main goal for using this app?",
    options: [
      "To get over my fear of speaking on camera",
      "To become more natural and confident",
      "To refine and polish my delivery",
      "To master on-camera presence",
    ],
  },
];

export function getConfidenceTier(answers: number[]): "shy_starter" | "growing_speaker" | "confident_creator" {
  const total = answers.reduce((sum, val) => sum + val, 0);

  if (total <= 10) return "shy_starter";
  if (total <= 15) return "growing_speaker";
  return "confident_creator";
}

export const confidenceTierDescriptions = {
  shy_starter: {
    title: "Shy Starter",
    description: "You're taking a brave first step into the world of on-camera speaking. Everyone starts somewhere! We'll help you build confidence gradually with supportive tools and simple exercises.",
    tips: [
      "Start with shorter, 30-second practice sessions",
      "Try the blur filter to reduce self-consciousness",
      "Focus on casual conversation topics first",
      "Practice without watching yourself initially"
    ]
  },
  growing_speaker: {
    title: "Growing Speaker",
    description: "You've got some experience with on-camera speaking and are ready to refine your skills. We'll help you build consistency and develop a more natural presence.",
    tips: [
      "Practice regularly with 1-2 minute sessions",
      "Try different face filters to find what works best",
      "Experiment with more structured content",
      "Review your recordings to identify patterns"
    ]
  },
  confident_creator: {
    title: "Confident Creator",
    description: "You're comfortable on camera and ready to master the finer points of engaging presentation. We'll help you polish your delivery and develop a distinctive style.",
    tips: [
      "Challenge yourself with longer, more complex content",
      "Try recording without filters occasionally",
      "Practice with the social media frames for platform-specific skills",
      "Focus on advanced techniques like pacing and emphasis"
    ]
  }
};

// Save assessment results to localStorage
export function saveAssessmentResults(answers: number[], tier: "shy_starter" | "growing_speaker" | "confident_creator") {
  const results = {
    answers,
    tier,
    date: new Date().toISOString(),
  };
  localStorage.setItem('confidenceAssessment', JSON.stringify(results));
}

// Get saved assessment results from localStorage
export function getAssessmentResults() {
  const storedResults = localStorage.getItem('confidenceAssessment');
  return storedResults ? JSON.parse(storedResults) : null;
}