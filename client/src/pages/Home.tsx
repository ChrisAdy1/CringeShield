import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, LogIn, Loader2, CheckCircle, Mic, BookOpen } from 'lucide-react';
import { Prompt } from '@/lib/types';
import { getBadgeByPromptId } from '@/lib/promptBadges';

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
          
          // Separate prompts by category
          const practices = data.filter((prompt: Prompt) => prompt.category === 'practice');
          const scripts = data.filter((prompt: Prompt) => prompt.category === 'scripts');
          
          setPracticePrompts(practices);
          setScriptPrompts(scripts);
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
  const startRecording = (prompt: Prompt) => {
    // If this is a practice prompt (not a script) and user is not logged in,
    // redirect to registration page
    if (prompt.category === 'practice' && !user) {
      // Store the selected prompt in localStorage to use after registration
      localStorage.setItem('selected-prompt', JSON.stringify(prompt));
      
      // Store a message in localStorage to show on auth page
      localStorage.setItem('auth-message', 'Please register to be able to practice this prompt');
      
      // Navigate to registration page
      navigate('/auth?mode=register');
      return;
    }
    
    // Store the selected prompt in localStorage to use in recording
    localStorage.setItem('selected-prompt', JSON.stringify(prompt));
    
    // Navigate to recording page with appropriate parameters based on category
    if (prompt.category === 'scripts') {
      // For script prompts, extract the title from the text (it's before the dash)
      const parts = prompt.text.split(' - ');
      const title = parts[0];
      const scriptText = parts.length > 1 ? parts.slice(1).join(' - ') : prompt.text;
      
      navigate(`/recording?type=script&id=${prompt.id}&title=${encodeURIComponent(title)}&text=${encodeURIComponent(scriptText)}`);
    } else {
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
                {(user ? scriptPrompts : scriptPrompts.slice(0, 5)).map((script) => {
                  // Extract title and content from the script text format
                  const parts = script.text.split(' - ');
                  const title = parts[0]; 
                  const content = parts.length > 1 ? parts.slice(1).join(' - ') : '';
                  
                  return (
                    <Card 
                      key={script.id} 
                      className="cursor-pointer hover:bg-gray-50 transition-colors" 
                      onClick={() => startRecording(script)}
                    >
                      <CardContent className="p-3 flex justify-between items-center">
                        <div className="flex-1">
                          <p className="font-medium">{title}</p>
                          <p className="text-sm text-muted-foreground">
                            {content.substring(0, 60)}...
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
        
        {/* App info section */}
        <div className="text-center text-sm text-muted-foreground mt-8">
          {user ? (
            activeTab === "practice" ? (
              <p className="mb-2">
                Complete all 15 practice prompts to earn badges.
              </p>
            ) : (
              <p className="mb-2">
                Use scripted reads to practice with a teleprompter.
              </p>
            )
          ) : (
            <p className="mb-2">
              <span className="text-primary font-medium">Create an account</span> to unlock all 15 practice prompts and track your progress.
            </p>
          )}
          <p>
            Your recordings stay on your device and are not uploaded.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;