import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LogIn, 
  Loader2, 
  Camera, 
  Video, 
  Calendar, 
  Trophy, 
  Activity, 
  BarChart, 
  Clock, 
  History, 
  Award,
  HelpCircle
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useChallengeProgress } from '@/hooks/useChallengeProgress';
import { useWeeklyChallenge } from '@/hooks/useWeeklyChallenge';
import { useWeeklyBadges } from '@/hooks/useWeeklyBadges';
import { useSelfReflections } from '@/hooks/useSelfReflections';
import { useAuth } from '@/hooks/useAuth';
import { getProgressPercentage } from '@/lib/weeklyPrompts';
import { WeeklyChallengeTier } from '@shared/schema';
import BadgeDisplay from '@/components/BadgeDisplay';

// Progress Dashboard Component
interface ProgressDashboardProps {
  userId: number;
}

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ userId }) => {
  // Use hooks to get progress data
  const { completedDays, progressPercentage: challengePercentage } = useChallengeProgress();
  const { weeklyChallenge } = useWeeklyChallenge();
  const { reflections, getAverageRating } = useSelfReflections();
  const { totalBadges, countBadgesByTier } = useWeeklyBadges();
  
  // Track reference to completedDays to avoid errors
  const progress = completedDays;
  
  // Calculate statistics
  const totalPracticeSessions = completedDays.length + (reflections?.length || 0);
  const averageConfidence = getAverageRating(30);
  const formattedConfidence = averageConfidence ? averageConfidence.toFixed(1) : '0.0';
  
  // Calculate weekly challenge progress
  let weeklyPercentage = 0;
  let selectedTier: WeeklyChallengeTier | null = null;
  if (weeklyChallenge?.status === 'in_progress' && weeklyChallenge.progress) {
    selectedTier = weeklyChallenge.progress.selectedTier as WeeklyChallengeTier;
    const { completedPrompts } = weeklyChallenge.progress;
    // Ensure completedPrompts is an array
    weeklyPercentage = getProgressPercentage(
      selectedTier, 
      Array.isArray(completedPrompts) ? completedPrompts : []
    );
  }
  
  return (
    <div className="space-y-6">
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
              <p className="text-xs text-muted-foreground mt-1">
                {totalPracticeSessions > 0 ? 
                  `You've completed ${totalPracticeSessions} sessions — amazing!` : 
                  `Ready to start your first session?`}
              </p>
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
                {completedDays.length > 0 ? 
                  `${completedDays.length} of 30 days completed - keep showing up!` : 
                  `Start your 30-day journey today`}
              </p>
            </div>
            
            {/* Comfort Progress */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Comfort Progress</span>
                <span className="text-sm font-medium">{formattedConfidence}/5</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart className="h-4 w-4 text-primary" />
                <Progress value={(averageConfidence / 5) * 100} className="h-2" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Based on your last 25 check-ins
              </p>
            </div>
            
            {/* Buttons to access challenges */}
            <div className="pt-2 grid grid-cols-2 gap-3">
              <Button 
                className="w-full"
                onClick={() => window.location.href = '/weekly-challenge'}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Weekly Challenge
              </Button>
              <Button 
                className="w-full"
                onClick={() => window.location.href = '/challenge'}
              >
                <Award className="mr-2 h-4 w-4" />
                30-Day Challenge
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Badges Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Your Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BadgeDisplay compact={true} />
        </CardContent>
      </Card>
    </div>
  );
};

const Home: React.FC = () => {
  const [, navigate] = useLocation();
  const { user, isLoading } = useAuth();
  
  // No longer need the startRecording function since we removed free practice mode
  
  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-1">CringeShield</h1>
          <p className="text-muted-foreground">
            Your safe space to get camera confident — one practice at a time.
          </p>
        </div>
        
        {/* Account section */}
        <Card className="mb-6">
          <CardContent className="p-6">
            {isLoading ? (
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
              <h2 className="text-lg font-bold mb-1">Quick Actions</h2>
              <p className="text-xs text-muted-foreground mb-3">Choose how you'd like to start</p>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  className="h-auto py-3 flex flex-col"
                  onClick={() => window.location.href = '/weekly-challenge'}
                >
                  <Calendar className="h-5 w-5 mb-1" />
                  <span className="text-xs">Weekly Challenge</span>
                </Button>
                <Button 
                  className="h-auto py-3 flex flex-col"
                  onClick={() => window.location.href = '/challenge'}
                >
                  <Trophy className="h-5 w-5 mb-1" />
                  <span className="text-xs">30-Day Challenge</span>
                </Button>
                <Button 
                  variant="outline"
                  className="h-auto py-3 flex flex-col"
                  onClick={() => window.location.href = '/badges'}
                >
                  <Award className="h-5 w-5 mb-1" />
                  <span className="text-xs">View Badges</span>
                </Button>
                <Button 
                  variant="outline"
                  className="h-auto py-3 flex flex-col"
                  onClick={() => window.location.href = '/help'}
                >
                  <HelpCircle className="h-5 w-5 mb-1" />
                  <span className="text-xs">Help</span>
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
                <h4 className="font-medium">Pick How You Want to Practice</h4>
                <p className="text-sm text-muted-foreground">Weekly challenges or a 30-day journey — it's your call.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="font-semibold">2</span>
              </div>
              <div>
                <h4 className="font-medium">Start Talking</h4>
                <p className="text-sm text-muted-foreground">Just hit record. Don't overthink it. Nobody's watching but you.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="font-semibold">3</span>
              </div>
              <div>
                <h4 className="font-medium">Reflect + Rate</h4>
                <p className="text-sm text-muted-foreground">How did that feel? Pick a comfort level, and keep going.</p>
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