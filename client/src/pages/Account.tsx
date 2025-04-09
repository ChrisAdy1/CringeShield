import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { apiRequest, queryClient } from '../lib/queryClient';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardDescription,
  CardFooter 
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  LogOut, 
  User, 
  Calendar, 
  Award, 
  Trash2, 
  BarChart4, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import { formatDate } from '../lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { useUserStats } from '@/hooks/useUserStats';
import LifetimeStats from '@/components/LifetimeStats';
import SessionHistory from '@/components/SessionHistory';
import ProgressChart from '@/components/ProgressChart';
import DataExport from '@/components/DataExport';

interface User {
  id: number;
  email: string;
  createdAt: string;
}

export default function Account() {
  const [_, setLocation] = useLocation();
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showProgress, setShowProgress] = useState(true);
  const { toast } = useToast();

  // Fetch current user
  const { data: user, isLoading: isUserLoading } = useQuery<User>({
    queryKey: ['/api/auth/current-user'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch prompt completions count
  const { data: completions, isLoading: isCompletionsLoading } = useQuery<any[]>({
    queryKey: ['/api/prompt-completions'],
    enabled: !!user,
  });
  
  // Fetch user stats for My Progress section
  const { 
    stats, 
    sessions, 
    timelineData, 
    isLoading: isStatsLoading 
  } = useUserStats();

  // Handle logout
  const handleLogout = async () => {
    try {
      setIsLogoutLoading(true);
      await apiRequest({
        url: '/api/auth/logout',
        method: 'POST',
      });
      // Clear all cached data
      queryClient.clear();
      // Redirect to home
      setLocation('/');
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account."
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLogoutLoading(false);
    }
  };

  // Handle account deletion
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      return apiRequest({
        url: '/api/auth/account',
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.clear();
      setLocation('/');
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccountMutation.mutateAsync();
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const isLoading = isUserLoading || isCompletionsLoading;

  return (
    <div className="container max-w-4xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">My Account</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-60">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : user ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div className="font-medium">{user.email}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Account Created</div>
                  <div className="font-medium">{formatDate(new Date(user.createdAt))}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  <span>Stats Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Total Prompts Completed</div>
                    <div className="flex items-center mt-1">
                      <Badge variant="outline" className="text-base px-3 py-1">
                        {completions?.length || 0}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground">Practice Sessions</div>
                    <div className="flex items-center mt-1">
                      <Badge variant="outline" className="text-base px-3 py-1">
                        {sessions?.length || 0}
                      </Badge>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="mt-2 md:mt-0"
                    onClick={() => setLocation('/badges')}
                  >
                    <Award className="h-4 w-4 mr-2" />
                    View My Badges
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* My Progress Section with Toggle */}
          <div className="mb-6">
            <button
              onClick={() => setShowProgress(!showProgress)}
              className="flex w-full items-center justify-between rounded-lg border p-4 font-medium"
            >
              <div className="flex items-center">
                <BarChart4 className="mr-2 h-5 w-5 text-primary" />
                <span>My Progress</span>
              </div>
              {showProgress ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
            
            {showProgress && (
              <div className="mt-4">
                <Tabs defaultValue="stats" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="stats">Stats</TabsTrigger>
                    <TabsTrigger value="history">Session History</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    <TabsTrigger value="export">Export Data</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="stats" className="mt-4">
                    <LifetimeStats stats={stats} isLoading={isStatsLoading} />
                  </TabsContent>
                  
                  <TabsContent value="history" className="mt-4">
                    <SessionHistory sessions={sessions} isLoading={isStatsLoading} />
                  </TabsContent>
                  
                  <TabsContent value="timeline" className="mt-4">
                    <ProgressChart data={timelineData} isLoading={isStatsLoading} />
                  </TabsContent>
                  
                  <TabsContent value="export" className="mt-4">
                    <DataExport sessions={sessions} isLoading={isStatsLoading} />
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              variant="outline" 
              onClick={handleLogout} 
              disabled={isLogoutLoading}
              className="w-full"
            >
              {isLogoutLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="mr-2 h-4 w-4" />
              )}
              Log Out
            </Button>
            
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="w-full"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Account</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDeleteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    Delete Account
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Not Logged In</CardTitle>
            <CardDescription>You need to log in to view your account.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => setLocation('/')}>Go to Login</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}