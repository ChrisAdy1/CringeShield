import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LogIn, Loader2, Camera, Video, Calendar, Trophy } from 'lucide-react';

const Home: React.FC = () => {
  const [, navigate] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);
  
  // Fetch current user
  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/current-user');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error checking current user:', error);
      } finally {
        setUserLoading(false);
      }
    };
    
    checkCurrentUser();
  }, []);
  
  // Start free recording session
  const startRecording = () => {
    // If user is not logged in, redirect to registration page
    if (!user) {
      localStorage.setItem('auth-message', 'Please register to use the recording feature');
      navigate('/auth?mode=register');
      return;
    }
    
    // Navigate to recording page with free talk mode
    navigate('/recording?type=free');
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
                  Welcome back! Ready to practice?
                </p>
              </div>
            ) : (
              <div>
                <h3 className="font-medium mb-2">Create an account to save your recordings</h3>
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
        
        {/* Main practice cards */}
        <div className="grid grid-cols-1 gap-6 mb-6">
          {/* Free talk card */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-b from-primary/10 to-primary/5 p-6 text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-white p-3 shadow-md">
                  <Camera className="h-10 w-10 text-primary" />
                </div>
              </div>
              <h2 className="text-lg font-bold mb-2">Free Talk Practice</h2>
              <p className="text-muted-foreground mb-4 text-sm">
                Record yourself speaking freely without any specific prompts. Perfect for practicing your natural speaking style.
              </p>
              <Button 
                className="w-full"
                onClick={startRecording}
              >
                <Video className="mr-2 h-4 w-4" />
                Start Recording
              </Button>
            </div>
          </Card>
          
          {/* Weekly Challenge card */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-b from-purple-100 to-purple-50 dark:from-purple-900/20 dark:to-purple-800/10 p-6 text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-white p-3 shadow-md">
                  <Calendar className="h-10 w-10 text-primary" />
                </div>
              </div>
              <h2 className="text-lg font-bold mb-2">Weekly Challenge</h2>
              <p className="text-muted-foreground mb-4 text-sm">
                Structured 15-week speaking program with weekly prompts tailored to your comfort level. Track your progress and build skills systematically.
              </p>
              <Button 
                className="w-full"
                onClick={() => navigate('/weekly-challenge')}
              >
                <Trophy className="mr-2 h-4 w-4" />
                Join Challenge
              </Button>
            </div>
          </Card>
        </div>
        
        {/* How it works section */}
        <div className="space-y-6 mt-10">
          <h3 className="text-lg font-medium text-center mb-4">How It Works</h3>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="font-semibold">1</span>
              </div>
              <div>
                <h4 className="font-medium">Record Yourself</h4>
                <p className="text-sm text-muted-foreground">Start a recording session to practice speaking on camera</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="font-semibold">2</span>
              </div>
              <div>
                <h4 className="font-medium">Review Your Recording</h4>
                <p className="text-sm text-muted-foreground">Watch your practice session and notice areas for improvement</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="font-semibold">3</span>
              </div>
              <div>
                <h4 className="font-medium">Improve Over Time</h4>
                <p className="text-sm text-muted-foreground">The more you practice, the more comfortable you'll become on camera</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Create account CTA - only for non-authenticated users */}
        {!user && (
          <div className="mt-10 text-center">
            <div className="h-px bg-border w-1/3 mx-auto mb-8"></div>
            <h3 className="text-lg font-medium mb-3">
              Create an account to save your recordings
            </h3>
            <p className="text-muted-foreground mb-4">
              Sign up for free to keep track of your speaking progress
            </p>
            <Button
              onClick={() => navigate('/auth?mode=register')}
              className="w-full"
            >
              Sign Up Now
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;