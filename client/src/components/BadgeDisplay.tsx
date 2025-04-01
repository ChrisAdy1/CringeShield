import React from 'react';
import { useWeeklyBadges } from '@/hooks/useWeeklyBadges';
import { Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge as UIBadge } from '@/components/ui/badge';
import { WeeklyBadge } from '@shared/schema';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BadgeDisplayProps {
  compact?: boolean;
}

const getTierColor = (tier: string) => {
  switch (tier) {
    case 'shy_starter':
      return 'bg-purple-100 text-purple-500 border-purple-200';
    case 'growing_speaker':
      return 'bg-blue-100 text-blue-500 border-blue-200';
    case 'confident_creator':
      return 'bg-green-100 text-green-500 border-green-200';
    default:
      return 'bg-gray-100 text-gray-500 border-gray-200';
  }
};

const formatTierName = (tier: string) => {
  return tier
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const BadgeDisplay: React.FC<BadgeDisplayProps> = ({ compact = false }) => {
  const { badges, isLoading, totalBadges } = useWeeklyBadges();
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (badges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-4">
        <Award className="h-8 w-8 text-muted mb-2" />
        <p className="text-sm text-muted-foreground">No badges earned yet. Complete weekly challenges to earn badges!</p>
      </div>
    );
  }
  
  // Sort badges by tier and week number
  const sortedBadges = [...badges].sort((a, b) => {
    // First sort by tier priority
    const tierPriority = { shy_starter: 0, growing_speaker: 1, confident_creator: 2 };
    const tierDiff = tierPriority[a.tier as keyof typeof tierPriority] - tierPriority[b.tier as keyof typeof tierPriority];
    
    if (tierDiff !== 0) return tierDiff;
    
    // Then sort by week number
    return a.weekNumber - b.weekNumber;
  });
  
  if (compact) {
    // Compact view shows recent badges
    const recentBadges = sortedBadges.slice(0, 3);
    
    return (
      <div>
        <div className="flex flex-wrap gap-3">
          {recentBadges.map((badge) => (
            <BadgeItem key={`${badge.tier}-${badge.weekNumber}`} badge={badge} compact={true} />
          ))}
          
          {totalBadges > 3 && (
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 border border-gray-200">
              <span className="text-xs font-medium text-gray-600">+{totalBadges - 3}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Full view groups badges by tier
  const badgesByTier: Record<string, WeeklyBadge[]> = {};
  
  sortedBadges.forEach(badge => {
    if (!badgesByTier[badge.tier]) {
      badgesByTier[badge.tier] = [];
    }
    badgesByTier[badge.tier].push(badge);
  });
  
  return (
    <div className="space-y-6">
      {Object.entries(badgesByTier).map(([tier, tierBadges]) => (
        <div key={tier} className="space-y-3">
          <UIBadge variant="outline" className={cn("font-normal px-3 py-1", getTierColor(tier))}>
            {formatTierName(tier)}
          </UIBadge>
          
          <div className="flex flex-wrap gap-4">
            {tierBadges.map((badge) => (
              <BadgeItem key={`${badge.tier}-${badge.weekNumber}`} badge={badge} compact={false} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

interface BadgeItemProps {
  badge: WeeklyBadge;
  compact: boolean;
}

const BadgeItem: React.FC<BadgeItemProps> = ({ badge, compact }) => {
  const formattedDate = new Date(badge.earnedAt).toLocaleDateString();
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={cn(
              "flex items-center justify-center rounded-full border",
              getTierColor(badge.tier),
              compact ? "w-12 h-12" : "w-16 h-16"
            )}
          >
            <div className="flex flex-col items-center justify-center">
              <Award className={cn("text-current", compact ? "h-6 w-6" : "h-8 w-8")} />
              {!compact && (
                <span className="text-xs font-medium mt-1">Week {badge.weekNumber}</span>
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p className="font-medium">{formatTierName(badge.tier)}: Week {badge.weekNumber}</p>
            <p className="text-xs text-muted-foreground">Earned on {formattedDate}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default BadgeDisplay;