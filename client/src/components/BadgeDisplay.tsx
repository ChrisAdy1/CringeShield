import React from 'react';
import { useWeeklyBadges } from '@/hooks/useWeeklyBadges';
import { useChallengeBadges, BadgeMilestone } from '@/hooks/useChallengeBadges';
import { Award, Medal, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge as UIBadge } from '@/components/ui/badge';
import { WeeklyBadge, ChallengeBadge } from '@shared/schema';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface BadgeDisplayProps {
  compact?: boolean;
  defaultTab?: 'weekly' | 'challenge';
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

const BadgeDisplay: React.FC<BadgeDisplayProps> = ({ 
  compact = false, 
  defaultTab = 'weekly' 
}) => {
  const { 
    badges: weeklyBadges, 
    isLoading: isWeeklyLoading, 
    totalBadges: totalWeeklyBadges 
  } = useWeeklyBadges();
  
  const { 
    badges: challengeBadges, 
    isLoading: isChallengeLoading, 
    getBadgeInfo 
  } = useChallengeBadges();
  
  const isLoading = isWeeklyLoading || isChallengeLoading;
  const hasWeeklyBadges = weeklyBadges.length > 0;
  const hasChallengeBadges = challengeBadges.length > 0;
  const hasBadges = hasWeeklyBadges || hasChallengeBadges;
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!hasBadges) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-4">
        <Award className="h-8 w-8 text-muted mb-2" />
        <p className="text-sm text-muted-foreground">No badges earned yet. Complete challenges to earn badges!</p>
      </div>
    );
  }
  
  // For compact view, we'll show a mix of both badge types
  if (compact) {
    // Sort weekly badges by tier and week number
    const sortedWeeklyBadges = [...weeklyBadges].sort((a, b) => {
      // First sort by tier priority
      const tierPriority = { shy_starter: 0, growing_speaker: 1, confident_creator: 2 };
      const tierDiff = tierPriority[a.tier as keyof typeof tierPriority] - tierPriority[b.tier as keyof typeof tierPriority];
      
      if (tierDiff !== 0) return tierDiff;
      
      // Then sort by week number
      return a.weekNumber - b.weekNumber;
    });
    
    // Get total badges
    const totalBadges = totalWeeklyBadges + challengeBadges.length;
    
    // Take a mix of recent badges from both types (prioritize challenge badges)
    const recentBadges = [];
    let remainingSlots = 3;
    
    // Add challenge badges first (they're more significant achievements)
    for (let i = 0; i < challengeBadges.length && remainingSlots > 0; i++) {
      recentBadges.push({ type: 'challenge', badge: challengeBadges[i] });
      remainingSlots--;
    }
    
    // Fill remaining slots with weekly badges
    for (let i = 0; i < sortedWeeklyBadges.length && remainingSlots > 0; i++) {
      recentBadges.push({ type: 'weekly', badge: sortedWeeklyBadges[i] });
      remainingSlots--;
    }
    
    return (
      <div>
        <div className="flex flex-wrap gap-3">
          {recentBadges.map((item, index) => 
            item.type === 'weekly' ? (
              <WeeklyBadgeItem 
                key={`weekly-${index}`} 
                badge={item.badge as WeeklyBadge} 
                compact={true} 
              />
            ) : (
              <ChallengeBadgeItem
                key={`challenge-${index}`}
                badge={item.badge as ChallengeBadge}
                compact={true}
                getBadgeInfo={getBadgeInfo}
              />
            )
          )}
          
          {totalBadges > 3 && (
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 border border-gray-200">
              <span className="text-xs font-medium text-gray-600">+{totalBadges - 3}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Full view uses tabs for different badge types
  return (
    <Tabs defaultValue={hasWeeklyBadges ? defaultTab : 'challenge'} className="space-y-4">
      <TabsList className="grid grid-cols-2">
        <TabsTrigger value="weekly" disabled={!hasWeeklyBadges}>
          Weekly Badges
        </TabsTrigger>
        <TabsTrigger value="challenge" disabled={!hasChallengeBadges}>
          Challenge Badges
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="weekly" className="space-y-4">
        {hasWeeklyBadges ? (
          <WeeklyBadgesDisplay badges={weeklyBadges} />
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">Complete weekly challenges to earn badges!</p>
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="challenge" className="space-y-4">
        {hasChallengeBadges ? (
          <ChallengeBadgesDisplay badges={challengeBadges} getBadgeInfo={getBadgeInfo} />
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">Complete challenge milestones to earn badges!</p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

// Weekly badges section
const WeeklyBadgesDisplay: React.FC<{ badges: WeeklyBadge[] }> = ({ badges }) => {
  // Sort badges by tier and week number
  const sortedBadges = [...badges].sort((a, b) => {
    // First sort by tier priority
    const tierPriority = { shy_starter: 0, growing_speaker: 1, confident_creator: 2 };
    const tierDiff = tierPriority[a.tier as keyof typeof tierPriority] - tierPriority[b.tier as keyof typeof tierPriority];
    
    if (tierDiff !== 0) return tierDiff;
    
    // Then sort by week number
    return a.weekNumber - b.weekNumber;
  });
  
  // Group badges by tier
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
              <WeeklyBadgeItem 
                key={`${badge.tier}-${badge.weekNumber}`} 
                badge={badge} 
                compact={false} 
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Get appropriate emoji based on tier
const getTierEmoji = (tier: string): string => {
  switch (tier) {
    case 'shy_starter':
      return '🌱';
    case 'growing_speaker':
      return '🌿';
    case 'confident_creator':
      return '🌳';
    default:
      return '🏆';
  }
};

// Weekly badge item
interface WeeklyBadgeItemProps {
  badge: WeeklyBadge;
  compact: boolean;
}

const WeeklyBadgeItem: React.FC<WeeklyBadgeItemProps> = ({ badge, compact }) => {
  const formattedDate = new Date(badge.earnedAt).toLocaleDateString();
  const tierEmoji = getTierEmoji(badge.tier);
  
  // Generate a proper badge name based on tier and week number
  const getBadgeName = () => {
    const tierName = formatTierName(badge.tier);
    return `${tierName} Week ${badge.weekNumber} Badge`;
  };
  
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
            <p className="font-medium">{getBadgeName()} {tierEmoji}</p>
            <p className="text-xs">Completed all Week {badge.weekNumber} challenges</p>
            <p className="text-xs text-muted-foreground">Earned on {formattedDate}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Challenge badges section
const ChallengeBadgesDisplay: React.FC<{ 
  badges: ChallengeBadge[],
  getBadgeInfo: (milestone: BadgeMilestone) => { name: string; description: string; emoji: string; }
}> = ({ badges, getBadgeInfo }) => {
  // Sort badges by milestone
  const sortedBadges = [...badges].sort((a, b) => a.milestone - b.milestone);
  
  return (
    <div className="space-y-6">
      <UIBadge variant="outline" className="font-normal px-3 py-1 bg-amber-100 text-amber-600 border-amber-200">
        Challenge Milestones
      </UIBadge>
      
      <div className="flex flex-wrap gap-4">
        {sortedBadges.map((badge) => (
          <ChallengeBadgeItem 
            key={`milestone-${badge.milestone}`} 
            badge={badge} 
            compact={false}
            getBadgeInfo={getBadgeInfo}
          />
        ))}
      </div>
    </div>
  );
};

// Challenge badge item
interface ChallengeBadgeItemProps {
  badge: ChallengeBadge;
  compact: boolean;
  getBadgeInfo: (milestone: BadgeMilestone) => { name: string; description: string; emoji: string; };
}

const ChallengeBadgeItem: React.FC<ChallengeBadgeItemProps> = ({ 
  badge, 
  compact,
  getBadgeInfo
}) => {
  const formattedDate = new Date(badge.earnedAt).toLocaleDateString();
  const badgeInfo = getBadgeInfo(badge.milestone as BadgeMilestone);
  
  // Use different icons based on milestone
  const renderIcon = () => {
    if (badge.milestone === 30) return <Trophy className={cn("text-current", compact ? "h-6 w-6" : "h-8 w-8")} />;
    if (badge.milestone === 15) return <Medal className={cn("text-current", compact ? "h-6 w-6" : "h-8 w-8")} />;
    return <Award className={cn("text-current", compact ? "h-6 w-6" : "h-8 w-8")} />;
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={cn(
              "flex items-center justify-center rounded-full border",
              "bg-amber-100 text-amber-600 border-amber-200",
              compact ? "w-12 h-12" : "w-16 h-16"
            )}
          >
            <div className="flex flex-col items-center justify-center">
              {renderIcon()}
              {!compact && (
                <span className="text-xs font-medium mt-1">{badge.milestone} Days</span>
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p className="font-medium">{badgeInfo.name} {badgeInfo.emoji}</p>
            <p className="text-xs">{badgeInfo.description}</p>
            <p className="text-xs text-muted-foreground mt-1">Earned on {formattedDate}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default BadgeDisplay;