import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWeeklyBadges } from '@/hooks/useWeeklyBadges';
import { Redirect } from 'wouter';
import { Award, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BadgeDisplay from '@/components/BadgeDisplay';
import { Link } from 'wouter';

const Badges: React.FC = () => {
  const { user } = useAuth();
  const { badges, isLoading, totalBadges } = useWeeklyBadges();
  
  // If user is not logged in, redirect to login
  if (!user && !isLoading) {
    return <Redirect to="/auth" />;
  }
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Award className="h-6 w-6 text-primary" />
          My Badges
        </h1>
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : badges.length === 0 ? (
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <Award className="h-16 w-16 text-muted mb-4" />
            <h3 className="text-xl font-medium mb-2">No Badges Yet</h3>
            <p className="text-muted-foreground max-w-md">
              Complete weekly challenges to earn badges! Each completed week earns you a badge for that tier.
            </p>
            <Link to="/weekly-challenge" className="mt-6">
              <Button>Start a Weekly Challenge</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Badge Collection</CardTitle>
            </CardHeader>
            <CardContent>
              <BadgeDisplay compact={false} />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">What Badges Mean</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Award className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <h4 className="font-medium">Shy Starter Badges</h4>
                    <p className="text-sm text-muted-foreground">
                      For completing weekly challenges in the beginner tier, focusing on basic comfort on camera.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Award className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-medium">Growing Speaker Badges</h4>
                    <p className="text-sm text-muted-foreground">
                      For completing intermediate-level weekly challenges that develop your speaking skills.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Award className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-medium">Confident Creator Badges</h4>
                    <p className="text-sm text-muted-foreground">
                      For completing advanced weekly challenges that push your speaking to professional levels.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Badges;