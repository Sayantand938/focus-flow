import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { Flame, Star, Award, Target } from "lucide-react";

interface StreaksAndGoalsProps {
  streaksAndGoals: {
    currentStreak: number;
    longestStreak: number;
    perfectDays: number;
  };
  goalCompletionRate: number;
}

const StatItem = ({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
}) => (
  <div className="flex items-center justify-between">
    <div className="flex flex-col">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
    <Icon className="h-5 w-5 text-muted-foreground" />
  </div>
);

export function StreaksAndGoals({
  streaksAndGoals,
  goalCompletionRate,
}: StreaksAndGoalsProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Flame className="size-5" />
          Streaks & Goals
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <StatItem title="Current Streak" value={`${streaksAndGoals.currentStreak} days`} icon={Flame} />
        <Separator />
        <StatItem title="Longest Streak" value={`${streaksAndGoals.longestStreak} days`} icon={Award} />
        <Separator />
        <StatItem title="Perfect Days" value={String(streaksAndGoals.perfectDays)} icon={Star} />
        <Separator />
        <StatItem title="Goal Completion" value={`${goalCompletionRate.toFixed(1)}%`} icon={Target} />
      </CardContent>
    </Card>
  );
}