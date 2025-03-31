import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { promptBadges } from '../lib/promptBadges';

export default function Badges() {
  const [_, navigate] = useLocation();

  // Fetch current user
  const { data: user, isLoading: isUserLoading } = useQuery<any>({
    queryKey: ['/api/auth/current-user'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Redirect to auth page if not authenticated
  useEffect(() => {
    if (!isUserLoading && !user) {
      // Store a message in localStorage to show on auth page
      localStorage.setItem('auth-message', 'Please register to view badges');
      
      // Navigate to registration page
      navigate('/auth?mode=register');
    }
  }, [user, isUserLoading, navigate]);

  // Fetch prompt completions (badges earned)
  const { data: completions, isLoading: isCompletionsLoading } = useQuery<any[]>({
    queryKey: ['/api/prompt-completions'],
    enabled: !!user,
  });

  const isLoading = isUserLoading || isCompletionsLoading;
  const completedPromptIds = completions?.map(c => c.promptId) || [];

  return (
    <div className="container max-w-xl mx-auto py-6 px-4">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost"
          size="icon"
          onClick={() => navigate('/account')}
          className="mr-2"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">My Badges</h1>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-60">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : !user ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="mb-4">Please log in to view your badges.</p>
            <Button onClick={() => navigate('/auth')}>Login</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <p className="text-center text-muted-foreground mb-6">
            Earn badges by completing speaking prompts and scripted reads
          </p>
          
          {/* Practice Prompt Badges (IDs 1-15) */}
          <h2 className="font-semibold text-lg mb-3">Practice Prompt Badges</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            {promptBadges.filter(badge => badge.id <= 15).map((badge) => {
              const isCompleted = completedPromptIds.includes(badge.id);
              
              return (
                <Card 
                  key={badge.id}
                  className={`hover:shadow-md transition-shadow ${isCompleted ? 'border-primary/20 bg-primary/5' : 'bg-gray-50'}`}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl mb-2">
                      {isCompleted ? (
                        badge.icon
                      ) : (
                        <span className="text-gray-300">?</span>
                      )}
                    </div>
                    <h3 className="font-medium text-sm mb-1">
                      {isCompleted ? badge.title : 'Locked Badge'}
                    </h3>
                    {isCompleted && (
                      <p className="text-xs text-muted-foreground">
                        {badge.description}
                      </p>
                    )}
                    <Badge 
                      variant={isCompleted ? "default" : "outline"} 
                      className="mt-2"
                    >
                      {isCompleted ? 'Completed' : 'Incomplete'}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Scripted Read Badges (IDs 101-110) */}
          <h2 className="font-semibold text-lg mb-3">Scripted Read Badges</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            {promptBadges.filter(badge => badge.id >= 101).map((badge) => {
              const isCompleted = completedPromptIds.includes(badge.id);
              
              return (
                <Card 
                  key={badge.id}
                  className={`hover:shadow-md transition-shadow ${isCompleted ? 'border-primary/20 bg-primary/5' : 'bg-gray-50'}`}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl mb-2">
                      {isCompleted ? (
                        badge.icon
                      ) : (
                        <span className="text-gray-300">?</span>
                      )}
                    </div>
                    <h3 className="font-medium text-sm mb-1">
                      {isCompleted ? badge.title : 'Locked Badge'}
                    </h3>
                    {isCompleted && (
                      <p className="text-xs text-muted-foreground">
                        {badge.description}
                      </p>
                    )}
                    <Badge 
                      variant={isCompleted ? "default" : "outline"} 
                      className="mt-2"
                    >
                      {isCompleted ? 'Completed' : 'Incomplete'}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Completed {completedPromptIds.length} of 25 badges
            </p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/')} 
              className="w-full"
            >
              Practice More Prompts
            </Button>
          </div>
        </>
      )}
    </div>
  );
}