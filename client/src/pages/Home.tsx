import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LogIn, Loader2, Camera, Video, Calendar, Trophy, Activity, BarChart, Clock, History } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useChallengeProgress } from '@/hooks/useChallengeProgress';
import { useWeeklyChallenge } from '@/hooks/useWeeklyChallenge';
import { useSelfReflections } from '@/hooks/useSelfReflections';
import { getProgressPercentage } from '@/lib/weeklyPrompts';
import { WeeklyChallengeTier } from '@shared/schema';

// Progress Dashboard Component
interface ProgressDashboardProps {
  userId: number;
}

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ userId }) => {
  // Use hooks to get progress data
  const { progress, progressPercentage: challengePercentage } = useChallengeProgress();
  const { weeklyChallenge } = useWeeklyChallenge();
  const { reflections, getAverageRating } = useSelfReflections();
  
  // Calculate statistics
  const totalPracticeSessions = progress.length + (reflections?.length || 0);
  const averageConfidence = getAverageRating(30);
  const formattedConfidence = averageConfidence ? averageConfidence.toFixed(1) : '0.0';
  
  // Calculate weekly challenge progress
  let weeklyPercentage = 0;
  if (weeklyChallenge?.status === 'in_progress' && weeklyChallenge.progress) {
    const { selectedTier, completedPrompts } = weeklyChallenge.progress;
    // Cast to WeeklyChallengeTier type and ensure completedPrompts is an array
    weeklyPercentage = getProgressPercentage(
      selectedTier as WeeklyChallengeTier, 
      Array.isArray(completedPrompts) ? completedPrompts : []
    );
  }
  
  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-lg font-bold mb-4">Your Progress</h2>
        
        <div className="space-y-5">
          {/* Total Practice Sessions */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Practice Sessions</span>
              <span className="text-sm font-medium">{totalPracticeSessions}</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <Progress value={Math.min(totalPracticeSessions * 10, 100)} className="h-2" />
            </div>
          </div>
          
          {/* Weekly Challenge */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Weekly Challenge</span>
              <span className="text-sm font-medium">{weeklyPercentage}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <Progress value={weeklyPercentage} className="h-2" />
            </div>
            {weeklyChallenge?.status === 'in_progress' && weeklyChallenge.progress && (
              <p className="text-xs text-muted-foreground mt-1">
                {weeklyChallenge.progress.selectedTier.split('_').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')} Tier
              </p>
            )}
          </div>
          
          {/* 30-Day Challenge */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">30-Day Challenge</span>
              <span className="text-sm font-medium">{challengePercentage}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              <Progress value={challengePercentage} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {progress.length} of 30 days completed
            </p>
          </div>
          
          {/* Confidence Score */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Average Confidence</span>
              <span className="text-sm font-medium">{formattedConfidence}/5</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart className="h-4 w-4 text-primary" />
              <Progress value={(averageConfidence / 5) * 100} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on your last {reflections?.length || 0} self-reflections
            </p>
          </div>
          
          {/* Start button */}
          <div className="pt-2">
            <Button 
              className="w-full"
              onClick={() => document.location.href = '/recording?type=free'}
            >
              <Video className="mr-2 h-4 w-4" />
              Start New Practice Session
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

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
        
        {/* User Progress Section (Only for logged in users) */}
        {user && (
          <div className="grid grid-cols-1 gap-6 mb-6">
            {/* Your Progress Dashboard */}
            <ProgressDashboard userId={user.id} />
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6 mb-6">
          <Card className="overflow-hidden">
            <CardContent className="p-4">
              <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  className="h-auto py-3 flex flex-col"
                  onClick={startRecording}
                >
                  <Video className="h-5 w-5 mb-1" />
                  <span className="text-xs">Free Talk</span>
                </Button>
                <Button 
                  className="h-auto py-3 flex flex-col"
                  onClick={() => navigate('/weekly-challenge')}
                >
                  <Calendar className="h-5 w-5 mb-1" />
                  <span className="text-xs">Weekly Challenge</span>
                </Button>
                <Button 
                  variant="outline"
                  className="h-auto py-3 flex flex-col"
                  onClick={() => navigate('/challenge')}
                >
                  <Trophy className="h-5 w-5 mb-1" />
                  <span className="text-xs">30-Day Challenge</span>
                </Button>
                <Button 
                  variant="outline"
                  className="h-auto py-3 flex flex-col"
                  onClick={() => navigate('/settings')}
                >
                  <History className="h-5 w-5 mb-1" />
                  <span className="text-xs">History</span>
                </Button>
              </div>
            </CardContent>
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