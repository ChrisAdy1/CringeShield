import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, LogIn, Loader2, CheckCircle } from 'lucide-react';
import { Prompt } from '@/lib/types';
import { getBadgeByPromptId } from '@/lib/promptBadges';

const Home: React.FC = () => {
  const [, navigate] = useLocation();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [completedPrompts, setCompletedPrompts] = useState<number[]>([]);
  
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
          setPrompts(data);
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
  
  // Start recording with the selected prompt
  const startRecording = (prompt: Prompt) => {
    // If user is not logged in, show toast message and redirect to registration page
    if (!user) {
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
    // Navigate to recording page with prompt ID and text in the URL
    navigate(`/recording?type=prompt&id=${prompt.id}&text=${encodeURIComponent(prompt.text)}`);
  };
  
  return (
    <div className="min-h-screen p-4 pb-24">
      {/* Top navigation bar */}
      <div className="flex items-center justify-between max-w-md mx-auto mb-4">
        <div className="flex items-center">
          <div className="text-primary mr-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 14C8.5 15.5 10 17 12 17C14 17 15.5 15.5 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="9" cy="9" r="1" fill="currentColor"/>
              <circle cx="15" cy="9" r="1" fill="currentColor"/>
            </svg>
          </div>
          <span className="font-bold">CringeShield</span>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/')}
            className="text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Home
          </Button>
          {user && (
            <>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/badges')}
                className="text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
                Badges
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/account')}
                className="text-sm"
              >
                My Account
              </Button>
            </>
          )}
        </div>
      </div>
      
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
        
        {/* Prompts list */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Practice Prompts</h2>
            <div className="text-sm text-muted-foreground">
              {user ? (
                <div className="px-2 py-1 bg-primary/10 rounded-full text-primary">
                  {completedPrompts.length}/20 completed
                </div>
              ) : (
                <div className="text-xs italic">10/20 prompts available</div>
              )}
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-3">
              {/* Show only first 10 prompts for non-registered users */}
              {(user ? prompts : prompts.slice(0, 10)).map((prompt) => (
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
        </div>
        
        {/* App info section */}
        <div className="text-center text-sm text-muted-foreground mt-8">
          {user ? (
            <p className="mb-2">
              Complete all 20 prompts to practice your speaking skills.
            </p>
          ) : (
            <p className="mb-2">
              <span className="text-primary font-medium">Create an account</span> to unlock all 20 prompts and track your progress.
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