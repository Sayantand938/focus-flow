// src/features/Dashboard/components/OverallStats.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { TrendingUp, Clock, Calendar, BarChart2, ClipboardList } from "lucide-react";

interface OverallStatsProps {
  overallStats: {
    totalMinutes: number;
    totalDays: number;
    avgDailyMinutes: number;
    avgShiftMinutes: number;
  };
}

// --- 1. NEW HELPER FUNCTION ---
/**
 * Converts a total number of minutes into a human-readable format.
 * Example: 125 -> "2 hr 5 min"
 * Example: 120 -> "2 hr"
 * Example: 59  -> "59 mins"
 */
const formatMinutesToHours = (totalMinutes: number): string => {
  if (totalMinutes < 1) {
    return "0 mins";
  }
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);

  if (hours === 0) {
    return `${minutes} mins`;
  }
  if (minutes === 0) {
    return `${hours} hr`;
  }
  
  return `${hours} hr ${minutes} min`;
};

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

export function OverallStats({ overallStats }: OverallStatsProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="size-5" />
          Overall Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* --- 2. UPDATED StatItem TO USE THE FORMATTING FUNCTION --- */}
        <StatItem 
          title="Total Studied Time" 
          value={formatMinutesToHours(overallStats.totalMinutes)} 
          icon={Clock} 
        />
        <Separator />
        <StatItem 
          title="Total Tracked Days" 
          value={String(overallStats.totalDays)} 
          icon={Calendar} 
        />
        <Separator />
        <StatItem 
          title="Avg. Daily Study" 
          value={`${overallStats.avgDailyMinutes.toFixed(1)} mins`} 
          icon={BarChart2} 
        />
        <Separator />
        <StatItem 
          title="Avg. per Shift" 
          value={`${overallStats.avgShiftMinutes.toFixed(1)} mins`} 
          icon={ClipboardList} 
        />
      </CardContent>
    </Card>
  );
}