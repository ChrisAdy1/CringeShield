import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, LogIn, Loader2, CheckCircle, Mic, BookOpen } from 'lucide-react';
import { Prompt } from '@/lib/types';
import { getBadgeByPromptId } from '@/lib/promptBadges';

// Custom scripted reads from the attached file
const customScriptedReads: Prompt[] = [
  {
    id: 101,
    category: 'scripts',
    text: "Self-Intro Starter - Hi! I'm [Name], and I'm here to get more comfortable speaking on camera.",
    // Custom properties for our script formatting
    title: "Self-Intro Starter",
    content: "Hi! I'm [Name], and I'm here to get more comfortable speaking on camera.",
    fullText: "Hi! I'm [Name], and I'm here to get more comfortable speaking on camera.\nI've always felt a little awkward doing this, but I know the only way to improve is to start.\nRight now, I'm just showing up—and that's already a win.\nThanks for being part of this journey with me, even if it's just me and this screen."
  },
  {
    id: 102,
    category: 'scripts',
    text: "Small Win Today - Today, something small but great happened: [insert small win].",
    // Custom properties
    title: "Small Win Today",
    content: "Today, something small but great happened: [insert small win].",
    fullText: "Today, something small but great happened: [insert small win].\nIt might not seem like a big deal to anyone else, but it made me smile.\nSometimes, those tiny victories are the ones that really keep us going.\nProgress doesn't have to be loud—it just has to be yours."
  },
  {
    id: 103,
    category: 'scripts',
    text: "A Favorite Thing - One thing I absolutely love is [topic].",
    title: "A Favorite Thing",
    content: "One thing I absolutely love is [topic].",
    fullText: "One thing I absolutely love is [topic].\nIt helps me recharge, brings me joy, and makes me feel more like myself.\nWhen I'm doing it, I feel focused and present.\nI think everyone needs something like that—something that reminds you that you're allowed to enjoy life."
  },
  {
    id: 104,
    category: 'scripts',
    text: "My Camera Goal - So, why am I doing this?",
    title: "My Camera Goal",
    content: "So, why am I doing this?",
    fullText: "So, why am I doing this?\nBecause I want to feel more natural being seen and heard.\nNot because I want to be perfect on camera—but because I want to stop shrinking away from opportunities to express myself.\nI want to feel confident sharing what matters to me."
  },
  {
    id: 105,
    category: 'scripts',
    text: "A Note to Myself - Dear me: I'm proud of you for showing up.",
    title: "A Note to Myself",
    content: "Dear me: I'm proud of you for showing up.",
    fullText: "Dear me: I'm proud of you for showing up.\nYou didn't need to be perfect today—you just needed to try.\nYour voice matters. Your words matter.\nAnd this recording is just one more step toward being fully yourself without fear."
  },
  {
    id: 106,
    category: 'scripts',
    text: "What I Was Afraid Of - I used to hate being on camera.",
    title: "What I Was Afraid Of",
    content: "I used to hate being on camera.",
    fullText: "I used to hate being on camera.\nThe sound of my voice made me cringe. I didn't know what to say.\nBut over time, I realized the fear wasn't about the camera—it was about judgment.\nAnd the truth is, most people are way too busy judging themselves to be judging me."
  },
  {
    id: 107,
    category: 'scripts',
    text: "Showing Up Unpolished - Here I am, unscripted, unfiltered, and a little unsure.",
    title: "Showing Up Unpolished",
    content: "Here I am, unscripted, unfiltered, and a little unsure.",
    fullText: "Here I am, unscripted, unfiltered, and a little unsure.\nAnd that's okay.\nConfidence doesn't mean I always know what I'm doing—it just means I'm willing to try.\nEvery time I press record, I'm rewriting the story I tell myself."
  },
  {
    id: 108,
    category: 'scripts',
    text: "If This Were a Mirror - If this camera were a mirror, I'd smile and try to remind myself that I'm allowed to take up space.",
    title: "If This Were a Mirror",
    content: "If this camera were a mirror, I'd smile and try to remind myself that I'm allowed to take up space.",
    fullText: "If this camera were a mirror, I'd smile and try to remind myself that I'm allowed to take up space.\nI'm allowed to make mistakes.\nI'm allowed to be visible.\nThis app isn't about performance—it's about practice. And practice means progress."
  },
  {
    id: 109,
    category: 'scripts',
    text: "If You're Watching This... - If you're watching this later—or even just listening—I hope you know that you're not alone.",
    title: "If You're Watching This...",
    content: "If you're watching this later—or even just listening—I hope you know that you're not alone.",
    fullText: "If you're watching this later—or even just listening—I hope you know that you're not alone.\nIf speaking on camera feels hard for you too, that's okay.\nWe're all figuring this out.\nJust by recording this, I'm proving that fear doesn't get the final say."
  },
  {
    id: 110,
    category: 'scripts',
    text: "Why I'm Doing This - There's a reason I'm doing this.",
    title: "Why I'm Doing This",
    content: "There's a reason I'm doing this.",
    fullText: "There's a reason I'm doing this.\nMaybe I want to make content, maybe I want to speak more clearly at work, or maybe I just want to stop avoiding FaceTime.\nWhatever the reason—it matters.\nBecause I matter.\nAnd the more I show up, the more I believe in that."
  },
];

const Home: React.FC = () => {
  const [, navigate] = useLocation();
  const [practicePrompts, setPracticePrompts] = useState<Prompt[]>([]);
  const [scriptPrompts, setScriptPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [completedPrompts, setCompletedPrompts] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState("practice");
  
  // Fetch current user and completed prompts if logged in
  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/current-user');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          
          // Fetch completed prompts for the user
          try {
            const completionsResponse = await fetch('/api/prompt-completions');
            if (completionsResponse.ok) {
              const completionsData = await completionsResponse.json();
              // Extract just the prompt IDs from completions
              const completedPromptIds = completionsData.map((completion: any) => completion.promptId);
              setCompletedPrompts(completedPromptIds);
            }
          } catch (completionsError) {
            console.error('Error fetching completed prompts:', completionsError);
          }
        }
      } catch (error) {
        console.error('Error checking current user:', error);
      } finally {
        setUserLoading(false);
      }
    };
    
    checkCurrentUser();
  }, []);
  
  // Fetch prompts when component mounts
  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const response = await fetch('/api/prompts');
        if (response.ok) {
          const data = await response.json();
          
          // For practice prompts, use: casual, interview, storytelling, presentation, introduction
          const practiceCategories = [
            'casual', 'interview', 'storytelling', 'presentation', 'introduction'
          ];
          
          // For scripted reads, use: social_media, random
          const scriptCategories = ['social_media', 'random'];
          
          // Filter prompts by category
          const practices = data.filter((prompt: Prompt) => 
            practiceCategories.includes(prompt.category)
          );
          
          const scripts = data.filter((prompt: Prompt) => 
            scriptCategories.includes(prompt.category)
          );
          
          // Limit to 15 practice prompts
          setPracticePrompts(practices.slice(0, 15));
          
          // Limit to 10 scripted reads
          setScriptPrompts(scripts.slice(0, 10));
        } else {
          console.error('Failed to fetch prompts');
        }
      } catch (error) {
        console.error('Error fetching prompts:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPrompts();
  }, []);
  
  // Start recording with the selected prompt or script
  const startRecording = (prompt: any) => {
    // Check if this is from the scripts tab based on the active tab
    const isScript = activeTab === 'scripts';
    
    // If user is not logged in, redirect to registration page for any type of prompt
    if (!user) {
      // Store the selected prompt in localStorage to use after registration
      localStorage.setItem('selected-prompt', JSON.stringify(prompt));
      
      // Store a message in localStorage to show on auth page
      const message = isScript 
        ? 'Please register to access scripted reads' 
        : 'Please register to be able to practice this prompt';
      localStorage.setItem('auth-message', message);
      
      // Navigate to registration page
      navigate('/auth?mode=register');
      return;
    }
    
    // Store the selected prompt in localStorage to use in recording
    localStorage.setItem('selected-prompt', JSON.stringify(prompt));
    
    // Navigate to recording page with appropriate parameters
    if (isScript) {
      // Check if this is one of our custom scripted reads
      if (prompt.title && prompt.fullText) {
        // This is a custom scripted read
        navigate(`/recording?type=script&id=${prompt.id}&title=${encodeURIComponent(prompt.title)}&text=${encodeURIComponent(prompt.fullText)}`);
      } else {
        // This is a database script prompt
        const parts = prompt.text.split(' - ');
        const title = parts[0];
        const scriptText = prompt.text.replace(' - ', '\n\n');
        navigate(`/recording?type=script&id=${prompt.id}&title=${encodeURIComponent(title)}&text=${encodeURIComponent(scriptText)}`);
      }
    } else {
      // This is a practice prompt
      navigate(`/recording?type=prompt&id=${prompt.id}&text=${encodeURIComponent(prompt.text)}`);
    }
  };
  
  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-1">CringeShield</h1>
          <p className="text-muted-foreground">
            Practice your speaking skills without the cringe
          </p>
        </div>
        
        {/* Account section */}
        <Card className="mb-6">
          <CardContent className="p-6">
            {userLoading ? (
              <div className="flex justify-center py-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : user ? (
              <div>
                <h3 className="font-medium">{user.email}</h3>
                <p className="text-sm text-muted-foreground">
                  Track your progress on completed prompts
                </p>
              </div>
            ) : (
              <div>
                <h3 className="font-medium mb-2">Create an account to track progress</h3>
                <div className="flex gap-3">
                  <Button 
                    variant="default" 
                    className="flex-1"
                    onClick={() => navigate('/auth?mode=register')}
                  >
                    Register
                    <LogIn className="ml-2 h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => navigate('/auth')}
                  >
                    Login
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Free Talk Practice heading */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Free Talk Practice</h2>
          <div className="text-sm text-muted-foreground">
            {user && (
              <div className="px-2 py-1 bg-primary/10 rounded-full text-primary">
                {completedPrompts.length}/15 completed
              </div>
            )}
          </div>
        </div>
        
        {/* Practice Categories */}
        <Tabs defaultValue="practice" className="mb-6" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 w-full mb-4">
            <TabsTrigger value="practice" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              <span>Practice Prompts</span>
            </TabsTrigger>
            <TabsTrigger value="scripts" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>Scripted Reads</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="practice">
            
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-3">
                {/* Show only first 5 prompts for non-registered users */}
                {(user ? practicePrompts : practicePrompts.slice(0, 5)).map((prompt) => (
                  <Card 
                    key={prompt.id} 
                    className="cursor-pointer hover:bg-gray-50 transition-colors" 
                    onClick={() => startRecording(prompt)}
                  >
                    <CardContent className="p-3 flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {(() => {
                            // Get badge icon for this prompt
                            const badge = getBadgeByPromptId(prompt.id);
                            return user && completedPrompts.includes(prompt.id) && badge ? (
                              <span className="text-lg">{badge.icon}</span>
                            ) : null;
                          })()}
                          <p className="font-medium">{prompt.text.split(' - ')[0]}</p>
                        </div>
                        {prompt.text.includes(' - ') && (
                          <p className="text-sm text-muted-foreground">{prompt.text.split(' - ')[1]}</p>
                        )}
                      </div>
                      {user && completedPrompts.includes(prompt.id) ? (
                        <div className="flex items-center">
                          <span className="text-xs text-primary font-medium mr-2">Completed</span>
                          <CheckCircle className="h-5 w-5 text-primary" />
                        </div>
                      ) : (
                        <Button variant="ghost" size="icon">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="scripts">
            
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-3">
                {/* Show only first 5 scripted reads for non-registered users */}
                {/* Use our custom scripted reads instead of the database ones */}
                {/* These are formatted exactly as provided by the user */}
                {(user ? customScriptedReads : customScriptedReads.slice(0, 5)).map((script) => {
                  // Extract title from the formatted script
                  const title = script.title;
                  
                  // Use the content for display
                  const content = script.content || '';
                  
                  // Create a teleprompter-friendly format with the proper line breaks
                  script.teleprompterText = `${title || ''}\n\n${script.fullText || ''}`;
                  
                  return (
                    <Card 
                      key={script.id} 
                      className="cursor-pointer hover:bg-gray-50 transition-colors" 
                      onClick={() => startRecording(script)}
                    >
                      <CardContent className="p-3 flex justify-between items-center">
                        <div className="flex-1">
                          <p className="font-medium">{title || 'Script'}</p>
                          <p className="text-sm text-muted-foreground">
                            {content.length > 60 ? `${content.substring(0, 60)}...` : content}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
        

      </div>
    </div>
  );
};

export default Home;