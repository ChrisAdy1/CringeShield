import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Award, Video, FileText, Flame } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface LifetimeStatsProps {
  stats?: {
    totalPrompts: number;
    totalSessions: number;
    longestStreak: number;
    averageRating: number;
  };
  isLoading: boolean;
}

export default function LifetimeStats({ stats, isLoading }: LifetimeStatsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lifetime Stats</CardTitle>
          <CardDescription>Your overall achievements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lifetime Stats</CardTitle>
          <CardDescription>Your overall achievements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <div className="mb-3">
              <Award className="h-12 w-12 mx-auto text-gray-300" />
            </div>
            <p>Stats not available.</p>
            <p className="mt-1 text-sm">Complete some sessions to see your stats.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lifetime Stats</CardTitle>
        <CardDescription>Your overall achievements</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard 
            title="Total Prompts" 
            value={stats.totalPrompts.toString()} 
            icon={<FileText className="h-5 w-5 text-blue-500" />} 
          />
          
          <StatCard 
            title="Total Sessions" 
            value={stats.totalSessions.toString()} 
            icon={<Video className="h-5 w-5 text-green-500" />} 
          />
          
          <StatCard 
            title="Longest Streak" 
            value={`${stats.longestStreak} days`} 
            icon={<Flame className="h-5 w-5 text-orange-500" />} 
          />
          
          <StatCard 
            title="Average Rating" 
            value={stats.averageRating.toString()} 
            icon={<Award className="h-5 w-5 text-yellow-500" />} 
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Individual stat card component
function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="mr-4 rounded-full p-2 bg-background">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <h4 className="text-2xl font-bold">{value}</h4>
      </div>
    </div>
  );
}

// Skeleton for loading state
function StatSkeleton() {
  return (
    <div className="flex items-center p-4 rounded-lg border">
      <Skeleton className="h-10 w-10 rounded-full mr-4" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-12" />
      </div>
    </div>
  );
}