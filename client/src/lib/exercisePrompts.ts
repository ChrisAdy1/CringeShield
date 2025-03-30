import { Prompt } from './types';

export const exercisePrompts: Record<string, Prompt[]> = {
  shy_starter: [
    {
      id: 1,
      category: 'shy_starter',
      text: 'Introduce Yourself: Say your name, where you\'re from, and one fun fact.'
    },
    {
      id: 2,
      category: 'shy_starter',
      text: 'Describe What You See: Look around you and describe three things in the room.'
    },
    {
      id: 3,
      category: 'shy_starter',
      text: 'My Favorite Thing: Talk for 30 seconds about something you love (a show, pet, food, etc.)'
    }
  ],
  growing_speaker: [
    {
      id: 4,
      category: 'growing_speaker',
      text: 'Tell a Tiny Story: Share a 1-minute story about something funny or embarrassing.'
    },
    {
      id: 5,
      category: 'growing_speaker',
      text: 'Teach Me Something: Pick one tip or hack you know well and explain it.'
    },
    {
      id: 6,
      category: 'growing_speaker',
      text: 'What I\'d Tell My Younger Self: Reflect for 1–2 minutes as if giving advice to yourself from a few years ago.'
    }
  ],
  confident_creator: [
    {
      id: 7,
      category: 'confident_creator',
      text: 'Hot Take Time: Share an opinion or insight on something you care about (even if it\'s unpopular).'
    },
    {
      id: 8,
      category: 'confident_creator',
      text: 'This Is Who I Am: Talk about your personal mission, brand, or purpose.'
    },
    {
      id: 9,
      category: 'confident_creator',
      text: 'Behind the Scenes: Take the viewer behind the curtain of your day or project—what most people don\'t see.'
    }
  ]
};