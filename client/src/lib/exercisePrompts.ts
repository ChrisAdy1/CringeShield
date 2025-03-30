import { Prompt } from './types';

export const exercisePrompts: Record<string, Prompt[]> = {
  shy_starter: [
    {
      id: 1,
      category: 'casual',
      text: 'Introduce yourself in 30 seconds, mentioning your name and one hobby you enjoy.'
    },
    {
      id: 2,
      category: 'casual',
      text: 'Describe your favorite place to relax, focusing on what makes it special to you.'
    },
    {
      id: 3,
      category: 'casual',
      text: 'Talk about your morning routine, highlighting one part you enjoy most.'
    }
  ],
  growing_speaker: [
    {
      id: 4,
      category: 'intermediate',
      text: 'Explain something you are passionate about to someone who knows nothing about it.'
    },
    {
      id: 5,
      category: 'intermediate',
      text: 'Tell a short personal story about a time you overcame a challenge.'
    },
    {
      id: 6,
      category: 'intermediate',
      text: 'Give a 1-minute review of the last show, movie, or book you enjoyed.'
    }
  ],
  confident_creator: [
    {
      id: 7,
      category: 'advanced',
      text: 'Deliver a persuasive 1-minute pitch about why a skill you have is valuable in the world.'
    },
    {
      id: 8,
      category: 'advanced',
      text: 'Explain a complex topic in simple terms that anyone could understand.'
    },
    {
      id: 9,
      category: 'advanced',
      text: 'Give an impromptu 1-minute speech on why public speaking skills matter.'
    }
  ]
};