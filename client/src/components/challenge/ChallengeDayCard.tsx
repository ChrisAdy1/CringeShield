import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, PlayCircle } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface ChallengeDay {
  day: number;
  title: string;
  description: string;
}

interface ChallengeDayCardProps {
  challenge: ChallengeDay;
  isCompleted: boolean;
  onComplete: (dayNumber: number) => void;
  isCompleting: boolean;
}

export const ChallengeDayCard: React.FC<ChallengeDayCardProps> = ({
  challenge,
  isCompleted,
  onComplete,
  isCompleting,
}) => {
  const { day, title, description } = challenge;

  return (
    <Card className={cn(
      "transition-all duration-200", 
      isCompleted ? "border-green-200 bg-green-50" : ""
    )}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className="bg-primary/10 text-primary mb-2">
            Day {day}
          </Badge>
          {isCompleted && (
            <Badge className="bg-green-500">
              <Check className="h-3 w-3 mr-1" /> Completed
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between pt-2">
        <Button
          variant="outline"
          size="sm"
          asChild
        >
          <Link href={`/recording?challenge=${day}`}>
            <PlayCircle className="mr-2 h-4 w-4" />
            Practice Now
          </Link>
        </Button>
        
        {!isCompleted && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onComplete(day)}
            disabled={isCompleting}
          >
            Mark Complete
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};