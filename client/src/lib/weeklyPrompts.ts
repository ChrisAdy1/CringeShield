import { WeeklyChallengeTier } from '@shared/schema';

export interface WeeklyPrompt {
  id: string;
  week: number;
  title?: string; // Make title optional to maintain backward compatibility
  text: string;
  tier: WeeklyChallengeTier;
  order: number; // 1, 2, or 3 for the three prompts per week
}

// Shy Starter prompts are shorter and simpler, designed for beginners
export const shyStarterPrompts: WeeklyPrompt[] = [
  // Week 1
  { id: 'shy_w1_p1', week: 1, title: 'Introduce Yourself', text: 'Say your name, where you\'re from, and one fun fact—no pressure, just a chill intro.', tier: 'shy_starter', order: 1 },
  { id: 'shy_w1_p2', week: 1, title: 'Describe What You See', text: 'Look around and describe 3 things near you. This gets you talking without thinking too hard.', tier: 'shy_starter', order: 2 },
  { id: 'shy_w1_p3', week: 1, title: 'My Favorite Thing', text: 'Talk for 30–60 seconds about something you love—music, a show, a snack—whatever feels easy.', tier: 'shy_starter', order: 3 },
  
  // Week 2
  { id: 'shy_w2_p1', week: 2, text: 'Name three things you\'re grateful for and briefly explain why.', tier: 'shy_starter', order: 1 },
  { id: 'shy_w2_p2', week: 2, text: 'Describe the weather today and how it makes you feel.', tier: 'shy_starter', order: 2 },
  { id: 'shy_w2_p3', week: 2, text: 'Talk about a simple meal you enjoy cooking or eating.', tier: 'shy_starter', order: 3 },
  
  // Week 3
  { id: 'shy_w3_p1', week: 3, text: 'Describe a place you visited that you enjoyed. Keep it simple - just the basics.', tier: 'shy_starter', order: 1 },
  { id: 'shy_w3_p2', week: 3, text: 'Talk about one hobby or activity you like to do in your free time.', tier: 'shy_starter', order: 2 },
  { id: 'shy_w3_p3', week: 3, text: 'Describe your morning routine in a few simple steps.', tier: 'shy_starter', order: 3 },
  
  // Week 4
  { id: 'shy_w4_p1', week: 4, text: 'What\'s your favorite season of the year and why?', tier: 'shy_starter', order: 1 },
  { id: 'shy_w4_p2', week: 4, text: 'Talk about a simple goal you have for this week.', tier: 'shy_starter', order: 2 },
  { id: 'shy_w4_p3', week: 4, text: 'Describe your favorite way to relax after a busy day.', tier: 'shy_starter', order: 3 },
  
  // Week 5
  { id: 'shy_w5_p1', week: 5, text: 'Talk about one item you use every day and why it\'s useful to you.', tier: 'shy_starter', order: 1 },
  { id: 'shy_w5_p2', week: 5, text: 'Describe a color you like and why you like it.', tier: 'shy_starter', order: 2 },
  { id: 'shy_w5_p3', week: 5, text: 'Talk about a simple activity that makes you happy.', tier: 'shy_starter', order: 3 },
  
  // Week 6
  { id: 'shy_w6_p1', week: 6, text: 'Describe your favorite piece of clothing and why you like it.', tier: 'shy_starter', order: 1 },
  { id: 'shy_w6_p2', week: 6, text: 'Talk about a beverage you enjoy drinking regularly.', tier: 'shy_starter', order: 2 },
  { id: 'shy_w6_p3', week: 6, text: 'Describe a typical weekend for you in simple terms.', tier: 'shy_starter', order: 3 },
  
  // Week 7
  { id: 'shy_w7_p1', week: 7, text: 'Talk about the last good news you received.', tier: 'shy_starter', order: 1 },
  { id: 'shy_w7_p2', week: 7, text: 'Describe a simple childhood memory.', tier: 'shy_starter', order: 2 },
  { id: 'shy_w7_p3', week: 7, text: 'Name three things you\'d like to do this month.', tier: 'shy_starter', order: 3 },
  
  // Week 8
  { id: 'shy_w8_p1', week: 8, text: 'Describe the most recent photo you took with your phone.', tier: 'shy_starter', order: 1 },
  { id: 'shy_w8_p2', week: 8, text: 'Talk about a sound you find pleasant or relaxing.', tier: 'shy_starter', order: 2 },
  { id: 'shy_w8_p3', week: 8, text: 'Describe what you ate for a recent meal.', tier: 'shy_starter', order: 3 },
  
  // Week 9
  { id: 'shy_w9_p1', week: 9, text: 'Talk about someone who has been helpful to you recently.', tier: 'shy_starter', order: 1 },
  { id: 'shy_w9_p2', week: 9, text: 'Describe something interesting you saw recently.', tier: 'shy_starter', order: 2 },
  { id: 'shy_w9_p3', week: 9, text: 'Talk about a simple decision you made today.', tier: 'shy_starter', order: 3 },
  
  // Week 10
  { id: 'shy_w10_p1', week: 10, text: 'Name three things that make you smile and briefly explain why.', tier: 'shy_starter', order: 1 },
  { id: 'shy_w10_p2', week: 10, text: 'Talk about how your speaking practice is going.', tier: 'shy_starter', order: 2 },
  { id: 'shy_w10_p3', week: 10, text: 'Describe a small accomplishment from the past week.', tier: 'shy_starter', order: 3 },
  
  // Week 11
  { id: 'shy_w11_p1', week: 11, text: 'Talk about a simple skill you\'d like to learn.', tier: 'shy_starter', order: 1 },
  { id: 'shy_w11_p2', week: 11, text: 'Describe your favorite way to spend 30 minutes of free time.', tier: 'shy_starter', order: 2 },
  { id: 'shy_w11_p3', week: 11, text: 'Talk about a small change you\'ve made recently.', tier: 'shy_starter', order: 3 },
  
  // Week 12
  { id: 'shy_w12_p1', week: 12, text: 'Describe an object near you right now in detail.', tier: 'shy_starter', order: 1 },
  { id: 'shy_w12_p2', week: 12, text: 'Talk about the last thing you did just for fun.', tier: 'shy_starter', order: 2 },
  { id: 'shy_w12_p3', week: 12, text: 'Name three good habits you try to maintain.', tier: 'shy_starter', order: 3 },
  
  // Week 13
  { id: 'shy_w13_p1', week: 13, text: 'Talk about a simple task you accomplished today.', tier: 'shy_starter', order: 1 },
  { id: 'shy_w13_p2', week: 13, text: 'Describe your favorite snack and why you enjoy it.', tier: 'shy_starter', order: 2 },
  { id: 'shy_w13_p3', week: 13, text: 'Talk about how your week is going so far.', tier: 'shy_starter', order: 3 },
  
  // Week 14
  { id: 'shy_w14_p1', week: 14, text: 'Describe a simple tradition you enjoy.', tier: 'shy_starter', order: 1 },
  { id: 'shy_w14_p2', week: 14, text: 'Talk about a small improvement you\'ve noticed in your speaking.', tier: 'shy_starter', order: 2 },
  { id: 'shy_w14_p3', week: 14, text: 'Describe your plans for the rest of today.', tier: 'shy_starter', order: 3 },
  
  // Week 15
  { id: 'shy_w15_p1', week: 15, text: 'Talk about your progress through this 15-week challenge.', tier: 'shy_starter', order: 1 },
  { id: 'shy_w15_p2', week: 15, text: 'Describe how you feel about speaking on camera now compared to when you started.', tier: 'shy_starter', order: 2 },
  { id: 'shy_w15_p3', week: 15, text: 'Share one speaking goal you have for the future.', tier: 'shy_starter', order: 3 }
];

// Growing Speaker prompts are moderate in complexity and duration (1-2 minutes)
export const growingSpeakerPrompts: WeeklyPrompt[] = [
  // Week 1
  { id: 'growing_w1_p1', week: 1, text: 'Introduce yourself and talk about what you hope to gain from this speaking challenge. Aim for 1 minute.', tier: 'growing_speaker', order: 1 },
  { id: 'growing_w1_p2', week: 1, text: 'Describe your ideal day from morning to evening. Include details about activities and feelings.', tier: 'growing_speaker', order: 2 },
  { id: 'growing_w1_p3', week: 1, text: 'Talk about a skill you\'ve developed over time. Describe how you started and how you\'ve improved.', tier: 'growing_speaker', order: 3 },
  
  // Week 2
  { id: 'growing_w2_p1', week: 2, text: 'Describe a place that means a lot to you. Include sensory details - what you see, hear, smell, etc.', tier: 'growing_speaker', order: 1 },
  { id: 'growing_w2_p2', week: 2, text: 'Talk about a hobby or interest you have. Explain what you enjoy about it and how you got started.', tier: 'growing_speaker', order: 2 },
  { id: 'growing_w2_p3', week: 2, text: 'Describe a challenging situation you overcame. What happened and what did you learn?', tier: 'growing_speaker', order: 3 },
  
  // Week 3
  { id: 'growing_w3_p1', week: 3, text: 'Talk about a book, movie, or show you enjoyed recently. Give a brief summary and your thoughts.', tier: 'growing_speaker', order: 1 },
  { id: 'growing_w3_p2', week: 3, text: 'Describe a person who has positively influenced your life. What qualities do you admire in them?', tier: 'growing_speaker', order: 2 },
  { id: 'growing_w3_p3', week: 3, text: 'Talk about a goal you\'re working toward. What steps are you taking to achieve it?', tier: 'growing_speaker', order: 3 },
  
  // Week 4
  { id: 'growing_w4_p1', week: 4, text: 'Describe your hometown or neighborhood. What makes it unique or special?', tier: 'growing_speaker', order: 1 },
  { id: 'growing_w4_p2', week: 4, text: 'Talk about a valuable lesson you learned from a mistake or failure.', tier: 'growing_speaker', order: 2 },
  { id: 'growing_w4_p3', week: 4, text: 'Describe a tradition or celebration that\'s important to you. Why is it meaningful?', tier: 'growing_speaker', order: 3 },
  
  // Week 5
  { id: 'growing_w5_p1', week: 5, text: 'Talk about a skill you wish you had. Why is it appealing and how might you learn it?', tier: 'growing_speaker', order: 1 },
  { id: 'growing_w5_p2', week: 5, text: 'Describe how you handle stress or difficult emotions. What strategies work for you?', tier: 'growing_speaker', order: 2 },
  { id: 'growing_w5_p3', week: 5, text: 'Talk about a trip or journey you remember fondly. What made it special?', tier: 'growing_speaker', order: 3 },
  
  // Week 6
  { id: 'growing_w6_p1', week: 6, text: 'Describe a change you\'ve noticed in yourself over the past few years. What caused this change?', tier: 'growing_speaker', order: 1 },
  { id: 'growing_w6_p2', week: 6, text: 'Talk about a time when you helped someone else. What did you do and how did it make you feel?', tier: 'growing_speaker', order: 2 },
  { id: 'growing_w6_p3', week: 6, text: 'Describe something you\'re curious about and would like to understand better. Why does it interest you?', tier: 'growing_speaker', order: 3 },
  
  // Week 7
  { id: 'growing_w7_p1', week: 7, text: 'Talk about a current challenge you\'re facing. How are you approaching it?', tier: 'growing_speaker', order: 1 },
  { id: 'growing_w7_p2', week: 7, text: 'Describe your approach to learning new things. What works best for you?', tier: 'growing_speaker', order: 2 },
  { id: 'growing_w7_p3', week: 7, text: 'Talk about a piece of advice that has been helpful to you. Who gave it and why was it valuable?', tier: 'growing_speaker', order: 3 },
  
  // Week 8
  { id: 'growing_w8_p1', week: 8, text: 'Describe a memory that makes you laugh. Set the scene and explain what happened.', tier: 'growing_speaker', order: 1 },
  { id: 'growing_w8_p2', week: 8, text: 'Talk about something you\'ve changed your mind about over time. What led to this shift?', tier: 'growing_speaker', order: 2 },
  { id: 'growing_w8_p3', week: 8, text: 'Describe a routine or habit that improves your life. How did you develop it?', tier: 'growing_speaker', order: 3 },
  
  // Week 9
  { id: 'growing_w9_p1', week: 9, text: 'Talk about a technology that has impacted your life. How do you use it and what difference has it made?', tier: 'growing_speaker', order: 1 },
  { id: 'growing_w9_p2', week: 9, text: 'Describe a social issue you care about. Why is it important to you?', tier: 'growing_speaker', order: 2 },
  { id: 'growing_w9_p3', week: 9, text: 'Talk about a recent accomplishment you\'re proud of. What made it challenging or significant?', tier: 'growing_speaker', order: 3 },
  
  // Week 10
  { id: 'growing_w10_p1', week: 10, text: 'Describe a time when you had to adapt to an unexpected situation. How did you handle it?', tier: 'growing_speaker', order: 1 },
  { id: 'growing_w10_p2', week: 10, text: 'Talk about a skill you\'ve improved during this speaking challenge. What specific progress have you noticed?', tier: 'growing_speaker', order: 2 },
  { id: 'growing_w10_p3', week: 10, text: 'Describe something you appreciate about your life right now. Why is it meaningful to you?', tier: 'growing_speaker', order: 3 },
  
  // Week 11
  { id: 'growing_w11_p1', week: 11, text: 'Talk about a decision you made that turned out well. What factors did you consider?', tier: 'growing_speaker', order: 1 },
  { id: 'growing_w11_p2', week: 11, text: 'Describe how you prioritize your time and energy. What strategies help you focus on what matters?', tier: 'growing_speaker', order: 2 },
  { id: 'growing_w11_p3', week: 11, text: 'Talk about a personal strength you rely on. How does it help you in different situations?', tier: 'growing_speaker', order: 3 },
  
  // Week 12
  { id: 'growing_w12_p1', week: 12, text: 'Describe a project or activity you\'re working on currently. What are your goals for it?', tier: 'growing_speaker', order: 1 },
  { id: 'growing_w12_p2', week: 12, text: 'Talk about a misconception people might have about you. What\'s the reality?', tier: 'growing_speaker', order: 2 },
  { id: 'growing_w12_p3', week: 12, text: 'Describe a time when you took a risk. What was the outcome and what did you learn?', tier: 'growing_speaker', order: 3 },
  
  // Week 13
  { id: 'growing_w13_p1', week: 13, text: 'Talk about a difference between how you were a year ago and how you are now.', tier: 'growing_speaker', order: 1 },
  { id: 'growing_w13_p2', week: 13, text: 'Describe a time when you received unexpected kindness. How did it affect you?', tier: 'growing_speaker', order: 2 },
  { id: 'growing_w13_p3', week: 13, text: 'Talk about something you\'ve recently discovered about yourself. What led to this insight?', tier: 'growing_speaker', order: 3 },
  
  // Week 14
  { id: 'growing_w14_p1', week: 14, text: 'Describe a quality you value in your relationships with others. Why is this important to you?', tier: 'growing_speaker', order: 1 },
  { id: 'growing_w14_p2', week: 14, text: 'Talk about how your perspective on public speaking has evolved during this challenge.', tier: 'growing_speaker', order: 2 },
  { id: 'growing_w14_p3', week: 14, text: 'Describe a meaningful conversation you had recently. What made it valuable?', tier: 'growing_speaker', order: 3 },
  
  // Week 15
  { id: 'growing_w15_p1', week: 15, text: 'Talk about the most important thing you\'ve learned during this 15-week challenge.', tier: 'growing_speaker', order: 1 },
  { id: 'growing_w15_p2', week: 15, text: 'Describe how you plan to continue developing your speaking skills after this challenge.', tier: 'growing_speaker', order: 2 },
  { id: 'growing_w15_p3', week: 15, text: 'Share advice you would give to someone just starting their speaking practice journey.', tier: 'growing_speaker', order: 3 }
];

// Confident Creator prompts are more complex, thought-provoking and longer (2-3 minutes)
export const confidentCreatorPrompts: WeeklyPrompt[] = [
  // Week 1
  { id: 'confident_w1_p1', week: 1, text: 'Give a comprehensive introduction of yourself including your background, interests, and what you hope to achieve through this speaking challenge. Aim for 2-3 minutes.', tier: 'confident_creator', order: 1 },
  { id: 'confident_w1_p2', week: 1, text: 'Discuss a transformative experience that shaped your perspective or values. Explain the context, the change, and its lasting impact.', tier: 'confident_creator', order: 2 },
  { id: 'confident_w1_p3', week: 1, text: 'Present your thoughts on the importance of effective communication in today\'s world. Include examples from different contexts like professional settings, relationships, and social change.', tier: 'confident_creator', order: 3 },
  
  // Week 2
  { id: 'confident_w2_p1', week: 2, text: 'Analyze a significant trend or change you\'ve observed in society. Discuss potential causes, implications, and your perspective on it.', tier: 'confident_creator', order: 1 },
  { id: 'confident_w2_p2', week: 2, text: 'Present a mini lecture on a topic you\'re knowledgeable about. Structure it with an introduction, key points, and a conclusion.', tier: 'confident_creator', order: 2 },
  { id: 'confident_w2_p3', week: 2, text: 'Discuss a complex problem in your field or area of interest. Explain the various dimensions of the issue and potential approaches to addressing it.', tier: 'confident_creator', order: 3 },
  
  // Week 3
  { id: 'confident_w3_p1', week: 3, text: 'Present a book, film, or artwork that had a profound impact on you. Analyze its themes, techniques, and why it resonated with you personally.', tier: 'confident_creator', order: 1 },
  { id: 'confident_w3_p2', week: 3, text: 'Discuss the role of mentorship in personal and professional development. Draw from your experiences as both a mentor and mentee if applicable.', tier: 'confident_creator', order: 2 },
  { id: 'confident_w3_p3', week: 3, text: 'Present a persuasive argument for a change you believe should be implemented in your workplace, community, or society at large.', tier: 'confident_creator', order: 3 },
  
  // Week 4
  { id: 'confident_w4_p1', week: 4, text: 'Analyze how your cultural background has influenced your worldview, values, and approach to life\'s challenges.', tier: 'confident_creator', order: 1 },
  { id: 'confident_w4_p2', week: 4, text: 'Discuss a time when you had to navigate a complex ethical dilemma. Explain the competing values at stake and how you reached your decision.', tier: 'confident_creator', order: 2 },
  { id: 'confident_w4_p3', week: 4, text: 'Present a vision for your personal or professional development over the next five years. Discuss specific milestones and how you plan to achieve them.', tier: 'confident_creator', order: 3 },
  
  // Week 5
  { id: 'confident_w5_p1', week: 5, text: 'Analyze a historical event or period and its relevance to current issues or challenges we face today.', tier: 'confident_creator', order: 1 },
  { id: 'confident_w5_p2', week: 5, text: 'Present a complex concept from your field of expertise in an accessible way for a general audience.', tier: 'confident_creator', order: 2 },
  { id: 'confident_w5_p3', week: 5, text: 'Discuss how technology has transformed a specific aspect of human experience, considering both benefits and potential concerns.', tier: 'confident_creator', order: 3 },
  
  // Week 6
  { id: 'confident_w6_p1', week: 6, text: 'Present a comparative analysis of two contrasting approaches, systems, or philosophies related to a topic of interest.', tier: 'confident_creator', order: 1 },
  { id: 'confident_w6_p2', week: 6, text: 'Discuss a time when you had to lead during a challenging situation. What leadership principles guided your actions?', tier: 'confident_creator', order: 2 },
  { id: 'confident_w6_p3', week: 6, text: 'Analyze how your perspective on a significant issue has evolved over time, examining the factors that contributed to this change.', tier: 'confident_creator', order: 3 },
  
  // Week 7
  { id: 'confident_w7_p1', week: 7, text: 'Present a case study of a successful innovation or initiative. Analyze the factors that contributed to its success and lessons that can be applied elsewhere.', tier: 'confident_creator', order: 1 },
  { id: 'confident_w7_p2', week: 7, text: 'Discuss the tension between tradition and progress in a specific context. Consider the value of preserving tradition alongside the need for adaptation.', tier: 'confident_creator', order: 2 },
  { id: 'confident_w7_p3', week: 7, text: 'Analyze a system or process that could be improved. Identify specific issues and present a detailed recommendation for change.', tier: 'confident_creator', order: 3 },
  
  // Week 8
  { id: 'confident_w8_p1', week: 8, text: 'Present an analysis of how media influences public perception of a particular issue. Consider different media formats and their varying impacts.', tier: 'confident_creator', order: 1 },
  { id: 'confident_w8_p2', week: 8, text: 'Discuss the concept of resilience through the lens of a challenging experience you\'ve faced. What factors enable people to navigate adversity effectively?', tier: 'confident_creator', order: 2 },
  { id: 'confident_w8_p3', week: 8, text: 'Analyze how global trends are likely to affect your industry or field of interest in the coming decade.', tier: 'confident_creator', order: 3 },
  
  // Week 9
  { id: 'confident_w9_p1', week: 9, text: 'Present a complex ethical issue facing society today. Analyze different perspectives and articulate your own nuanced position.', tier: 'confident_creator', order: 1 },
  { id: 'confident_w9_p2', week: 9, text: 'Discuss the interplay between individual action and systemic change in addressing a social or environmental challenge.', tier: 'confident_creator', order: 2 },
  { id: 'confident_w9_p3', week: 9, text: 'Analyze a failed project or initiative. What went wrong, and what lessons can be derived from this experience?', tier: 'confident_creator', order: 3 },
  
  // Week 10
  { id: 'confident_w10_p1', week: 10, text: 'Present your philosophy on continued learning and growth. How do you approach acquiring new knowledge and skills throughout your life?', tier: 'confident_creator', order: 1 },
  { id: 'confident_w10_p2', week: 10, text: 'Analyze how your communication style has evolved throughout this speaking challenge. What specific improvements have you observed?', tier: 'confident_creator', order: 2 },
  { id: 'confident_w10_p3', week: 10, text: 'Discuss the relationship between vulnerability and authentic leadership. How can leaders effectively balance strength and openness?', tier: 'confident_creator', order: 3 },
  
  // Week 11
  { id: 'confident_w11_p1', week: 11, text: 'Present a strategic analysis of a decision you made that had significant consequences. What factors did you consider, and how did you evaluate alternatives?', tier: 'confident_creator', order: 1 },
  { id: 'confident_w11_p2', week: 11, text: 'Discuss the concept of work-life integration rather than work-life balance. How can these domains complement rather than compete with each other?', tier: 'confident_creator', order: 2 },
  { id: 'confident_w11_p3', week: 11, text: 'Analyze how diversity of perspective contributes to better outcomes in teams, organizations, or communities.', tier: 'confident_creator', order: 3 },
  
  // Week 12
  { id: 'confident_w12_p1', week: 12, text: 'Present a synthesized view of a complex topic by drawing from multiple disciplines or perspectives.', tier: 'confident_creator', order: 1 },
  { id: 'confident_w12_p2', week: 12, text: 'Discuss how you navigate tensions between competing values or priorities in your decision-making process.', tier: 'confident_creator', order: 2 },
  { id: 'confident_w12_p3', week: 12, text: 'Analyze the role of storytelling in effective communication. How can narratives be used to convey complex ideas and inspire action?', tier: 'confident_creator', order: 3 },
  
  // Week 13
  { id: 'confident_w13_p1', week: 13, text: 'Present a critical analysis of a popular assumption or "conventional wisdom" in your field that deserves reconsideration.', tier: 'confident_creator', order: 1 },
  { id: 'confident_w13_p2', week: 13, text: 'Discuss the relationship between short-term actions and long-term vision. How do you balance immediate needs with bigger picture goals?', tier: 'confident_creator', order: 2 },
  { id: 'confident_w13_p3', week: 13, text: 'Analyze how your core values have been tested and reinforced through challenging experiences.', tier: 'confident_creator', order: 3 },
  
  // Week 14
  { id: 'confident_w14_p1', week: 14, text: 'Present an analysis of how power dynamics affect communication in different contexts and how to navigate them effectively.', tier: 'confident_creator', order: 1 },
  { id: 'confident_w14_p2', week: 14, text: 'Discuss how your approach to public speaking has transformed during this challenge. What specific techniques have you developed?', tier: 'confident_creator', order: 2 },
  { id: 'confident_w14_p3', week: 14, text: 'Analyze the interplay between expertise and continuous improvement. How can specialists avoid the trap of complacency?', tier: 'confident_creator', order: 3 },
  
  // Week 15
  { id: 'confident_w15_p1', week: 15, text: 'Present a comprehensive reflection on your growth journey through this 15-week speaking challenge. Discuss specific improvements and breakthrough moments.', tier: 'confident_creator', order: 1 },
  { id: 'confident_w15_p2', week: 15, text: 'Discuss how you plan to apply your enhanced communication skills in various aspects of your personal and professional life.', tier: 'confident_creator', order: 2 },
  { id: 'confident_w15_p3', week: 15, text: 'Deliver an inspirational talk for others seeking to improve their speaking abilities. Share key insights and strategies from your experience.', tier: 'confident_creator', order: 3 }
];

// Combine all prompts into a single array for easy searching
export const allWeeklyPrompts: WeeklyPrompt[] = [
  ...shyStarterPrompts,
  ...growingSpeakerPrompts,
  ...confidentCreatorPrompts
];

// Function to get prompts for a specific week and tier
export function getPrompts(week: number, tier: WeeklyChallengeTier): WeeklyPrompt[] {
  return allWeeklyPrompts.filter(
    prompt => prompt.week === week && prompt.tier === tier
  ).sort((a, b) => a.order - b.order);
}

// Alias for getPrompts function to use in server-side
export function getWeeklyPrompts(week: number, tier: WeeklyChallengeTier): WeeklyPrompt[] {
  return getPrompts(week, tier);
}

// Function to get a prompt by ID
export function getPromptById(promptId: string): WeeklyPrompt | undefined {
  return allWeeklyPrompts.find(prompt => prompt.id === promptId);
}

// Calculate progress percentage based on completed prompts
export function getProgressPercentage(tier: WeeklyChallengeTier, completedPrompts: string[]): number {
  const totalPrompts = 45; // 15 weeks × 3 prompts
  const tierPrompts = allWeeklyPrompts.filter(prompt => prompt.tier === tier);
  
  // Count completed prompts for this tier
  const completedCount = completedPrompts.filter(promptId => 
    tierPrompts.some(prompt => prompt.id === promptId)
  ).length;
  
  return Math.round((completedCount / totalPrompts) * 100);
}

// Check if a week is unlocked based on start date
export function isWeekUnlocked(startDate: Date, weekNumber: number, completedPrompts?: string[]): boolean {
  // Week 1 is always unlocked
  if (weekNumber === 1) return true;
  
  // For Week 2-15, if not providing completed prompts, use time-based unlocking
  if (!completedPrompts) {
    // Calculate days since start (accounting for potential time differences)
    const now = new Date();
    const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Each week unlocks after (weekNumber - 1) * 7 days
    const requiredDays = (weekNumber - 1) * 7;
    
    return daysSinceStart >= requiredDays;
  }
  
  // For testing/development: Allow progressing to next week if previous week is complete
  // Check if all prompts from the previous week are completed
  const previousWeek = weekNumber - 1;
  const tierPrompts = allWeeklyPrompts.filter(p => p.week === previousWeek);
  
  // Get all unique tiers from the previous week's prompts
  const tiers = Array.from(new Set(tierPrompts.map(p => p.tier)));
  
  // For each tier, check if at least one has all prompts completed
  return tiers.some(tier => {
    const tierWeekPrompts = tierPrompts.filter(p => p.tier === tier);
    return tierWeekPrompts.every(prompt => completedPrompts.includes(prompt.id));
  });
}