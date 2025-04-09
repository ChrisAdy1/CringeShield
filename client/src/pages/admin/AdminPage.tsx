import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { WeeklyChallengeTier } from '@shared/schema';
import { Redirect } from 'wouter';
import { getQueryFn } from '@/lib/queryClient';

// Define types for the API responses
interface GlobalStats {
  totalUsers: number;
  totalSessions: number;
  totalPromptCompletions: number;
  avgPromptsPerUser: number;
  challengeCompletion: {
    day7Percentage: number;
    day15Percentage: number;
    day30Percentage: number;
  };
}

interface UserListItem {
  id: number;
  email: string;
  createdAt: string;
  isAdmin: boolean;
  [key: string]: any; // Allow string indexing for sorting
}

interface UserDetails {
  user: {
    id: number;
    email: string;
    createdAt: string;
    isAdmin: boolean;
  };
  stats: {
    totalCompletions: number;
    challengeDaysCompleted: number;
    weeklyPrompts: number;
    weeklyBadgesEarned: number;
    challengeBadgesEarned: number;
    lastSessionDate: string | null;
  };
  badges: {
    weekly: WeeklyBadge[];
    challenge: ChallengeBadge[];
  };
}

interface WeeklyBadge {
  id: number;
  userId: number;
  tier: WeeklyChallengeTier;
  weekNumber: number;
  earnedAt: string;
}

interface ChallengeBadge {
  id: number;
  userId: number;
  milestone: number;
  earnedAt: string;
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronDown, ChevronUp, Users, CheckCircle, Calendar, Award, Clock, ShieldCheck } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

// Role Badge Component that matches solid blue button design
interface RoleBadgeProps {
  label: string;
  icon?: React.ReactNode;
}

function RoleBadge({ label, icon }: RoleBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 text-white text-sm font-medium bg-primary rounded-md shadow-sm">
      {icon || <ShieldCheck className="w-4 h-4" />}
      {label}
    </span>
  );
}

// Admin Dashboard Page
export default function AdminPage() {
  const { user } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // Redirect if user is not logged in
  if (!user) {
    return <Redirect to="/auth" />;
  }

  // Redirect if user is not an admin
  if (!user.isAdmin) {
    return <Redirect to="/" />;
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6 text-center">CringeShield Admin Dashboard</h1>
      
      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="w-full grid grid-cols-3 mb-6">
          <TabsTrigger value="stats">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="details">User Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stats">
          <GlobalStats />
        </TabsContent>
        
        <TabsContent value="users">
          <UserList onSelectUser={setSelectedUserId} />
        </TabsContent>
        
        <TabsContent value="details">
          {selectedUserId ? (
            <UserDetails userId={selectedUserId} />
          ) : (
            <Alert className="my-4">
              <AlertTitle>No User Selected</AlertTitle>
              <AlertDescription>
                Please select a user from the Users tab to view detailed statistics.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Global Stats Component
function GlobalStats() {
  const { data: stats, isLoading, error } = useQuery<GlobalStats>({
    queryKey: ['/api/admin/stats'],
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  // Default empty stats object to handle undefined data safely
  const safeStats: GlobalStats = stats || {
    totalUsers: 0,
    totalSessions: 0,
    totalPromptCompletions: 0,
    avgPromptsPerUser: 0,
    challengeCompletion: {
      day7Percentage: 0,
      day15Percentage: 0,
      day30Percentage: 0
    }
  };

  if (isLoading) {
    return <StatsSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load global statistics. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Total Users" 
          value={safeStats.totalUsers} 
          icon={<Users className="h-5 w-5" />} 
        />
        <StatCard 
          title="Total Sessions" 
          value={safeStats.totalSessions} 
          icon={<Clock className="h-5 w-5" />} 
        />
        <StatCard 
          title="Prompts Completed" 
          value={safeStats.totalPromptCompletions} 
          icon={<CheckCircle className="h-5 w-5" />} 
        />
        <StatCard 
          title="Average Prompts/User" 
          value={safeStats.avgPromptsPerUser} 
          icon={<Calendar className="h-5 w-5" />} 
        />
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Challenge Completion</CardTitle>
          <CardDescription>Percentage of users who completed challenge milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-1">
                <span>7-Day Challenge (Week One Warrior)</span>
                <span>{safeStats.challengeCompletion.day7Percentage}%</span>
              </div>
              <Progress 
                value={safeStats.challengeCompletion.day7Percentage} 
                className={`h-2 ${
                  safeStats.challengeCompletion.day7Percentage < 30 
                    ? "bg-red-200 [&>div]:bg-red-500" 
                    : safeStats.challengeCompletion.day7Percentage < 70 
                      ? "bg-amber-200 [&>div]:bg-amber-500"
                      : "bg-green-200 [&>div]:bg-green-500"
                }`} 
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span>15-Day Challenge (Halfway Hero)</span>
                <span>{safeStats.challengeCompletion.day15Percentage}%</span>
              </div>
              <Progress 
                value={safeStats.challengeCompletion.day15Percentage} 
                className={`h-2 ${
                  safeStats.challengeCompletion.day15Percentage < 30 
                    ? "bg-red-200 [&>div]:bg-red-500" 
                    : safeStats.challengeCompletion.day15Percentage < 70 
                      ? "bg-amber-200 [&>div]:bg-amber-500"
                      : "bg-green-200 [&>div]:bg-green-500"
                }`} 
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span>30-Day Challenge (Challenge Conqueror)</span>
                <span>{safeStats.challengeCompletion.day30Percentage}%</span>
              </div>
              <Progress 
                value={safeStats.challengeCompletion.day30Percentage} 
                className={`h-2 ${
                  safeStats.challengeCompletion.day30Percentage < 30 
                    ? "bg-red-200 [&>div]:bg-red-500" 
                    : safeStats.challengeCompletion.day30Percentage < 70 
                      ? "bg-amber-200 [&>div]:bg-amber-500"
                      : "bg-green-200 [&>div]:bg-green-500"
                }`} 
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Skeleton loading state for stats
function StatsSkeleton() {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-8">
        <CardHeader>
          <Skeleton className="h-5 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-10" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
}

function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className="p-1 bg-primary/10 rounded-md text-primary-foreground">
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

// User List Component
interface UserListProps {
  onSelectUser: (userId: number) => void;
}

function UserList({ onSelectUser }: UserListProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof UserListItem | string;
    direction: 'asc' | 'desc';
  }>({
    key: 'createdAt',
    direction: 'desc',
  });

  const { data: users, isLoading, error } = useQuery<UserListItem[]>({
    queryKey: ['/api/admin/users'],
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const sortedUsers = React.useMemo(() => {
    if (!users) return [];
    
    const sortableUsers = [...users];
    
    sortableUsers.sort((a, b) => {
      if (sortConfig.key === 'createdAt') {
        return sortConfig.direction === 'asc'
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      
      const aValue = a[sortConfig.key as keyof UserListItem];
      const bValue = b[sortConfig.key as keyof UserListItem];
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    return sortableUsers;
  }, [users, sortConfig]);

  const requestSort = (key: string) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getSortDirection = (key: string) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp className="inline-block ml-1 h-4 w-4" /> : <ChevronDown className="inline-block ml-1 h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <div className="my-6 w-full">
        <Skeleton className="h-10 w-full mb-2" />
        <Skeleton className="h-12 w-full mb-1" />
        <Skeleton className="h-12 w-full mb-1" />
        <Skeleton className="h-12 w-full mb-1" />
        <Skeleton className="h-12 w-full mb-1" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load user data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableCaption>A list of all registered users</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">ID</TableHead>
            <TableHead className="cursor-pointer" onClick={() => requestSort('email')}>
              Email {getSortDirection('email')}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => requestSort('createdAt')}>
              Signup Date {getSortDirection('createdAt')}
            </TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedUsers.map(user => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.id}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onSelectUser(user.id)}
                >
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// User Details Component
interface UserDetailsProps {
  userId: number;
}

function UserDetails({ userId }: UserDetailsProps) {
  const { data: userDetails, isLoading, error } = useQuery<UserDetails>({
    queryKey: [`/api/admin/users/${userId}`],
    enabled: !!userId,
    queryFn: getQueryFn({ on401: "throw" }),
  });

  if (isLoading) {
    return (
      <div className="space-y-4 my-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load user details. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!userDetails) {
    return (
      <Alert className="my-4">
        <AlertTitle>No Data</AlertTitle>
        <AlertDescription>
          User details not found. The user may have been deleted.
        </AlertDescription>
      </Alert>
    );
  }

  const { user, stats, badges } = userDetails;
  const hasWeeklyBadges = badges.weekly && badges.weekly.length > 0;
  const hasChallengeBadges = badges.challenge && badges.challenge.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{user.email}</h2>
        {user.isAdmin ? (
          <RoleBadge label="Admin" />
        ) : (
          <Badge variant="outline">User</Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="font-medium">User ID</dt>
              <dd>{user.id}</dd>
            </div>
            <div>
              <dt className="font-medium">Signup Date</dt>
              <dd>{new Date(user.createdAt).toLocaleDateString()}</dd>
            </div>
            <div>
              <dt className="font-medium">Last Practice Session</dt>
              <dd>{stats.lastSessionDate ? new Date(stats.lastSessionDate).toLocaleDateString() : 'None'}</dd>
            </div>
            <div>
              <dt className="font-medium">Total Prompts Completed</dt>
              <dd>{stats.totalCompletions}</dd>
            </div>
            <div>
              <dt className="font-medium">Challenge Days Completed</dt>
              <dd>{stats.challengeDaysCompleted} / 30</dd>
            </div>
            <div>
              <dt className="font-medium">Weekly Prompts Completed</dt>
              <dd>{stats.weeklyPrompts}</dd>
            </div>
            <div>
              <dt className="font-medium">Weekly Badges Earned</dt>
              <dd>{stats.weeklyBadgesEarned}</dd>
            </div>
            <div>
              <dt className="font-medium">Challenge Badges Earned</dt>
              <dd>{stats.challengeBadgesEarned}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Challenge Badges</CardTitle>
          </CardHeader>
          <CardContent>
            {hasChallengeBadges ? (
              <div className="space-y-4">
                {badges.challenge.map((badge: ChallengeBadge) => (
                  <div key={badge.id} className="flex items-center gap-2 border rounded-md p-3">
                    <div className="text-2xl">
                      {badge.milestone === 7 ? '🗓️' : badge.milestone === 15 ? '🧱' : '🏆'}
                    </div>
                    <div>
                      <div className="font-medium">
                        {badge.milestone === 7 ? 'Week One Warrior' : 
                         badge.milestone === 15 ? 'Halfway Hero' : 'Challenge Conqueror'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Earned on {new Date(badge.earnedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-4">
                No challenge badges earned yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Badges</CardTitle>
          </CardHeader>
          <CardContent>
            {hasWeeklyBadges ? (
              <div className="space-y-4">
                {badges.weekly.map((badge: WeeklyBadge) => (
                  <div key={badge.id} className="flex items-center gap-2 border rounded-md p-3">
                    <div className="text-2xl">
                      {badge.tier === 'shy_starter' ? '🌱' : 
                       badge.tier === 'growing_speaker' ? '🌿' : '🌳'}
                    </div>
                    <div>
                      <div className="font-medium">
                        {badge.tier === 'shy_starter' ? 'Shy Starter' : 
                         badge.tier === 'growing_speaker' ? 'Growing Speaker' : 'Confident Creator'} - Week {badge.weekNumber}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Earned on {new Date(badge.earnedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-4">
                No weekly badges earned yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}