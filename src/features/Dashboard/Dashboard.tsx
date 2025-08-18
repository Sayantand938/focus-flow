import { useMemo } from "react";
import { StudiedDays } from "@/utils/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  calculateShiftStats,
  getPast7DaysProgress,
  calculateStreaksAndGoals,
  calculateOverallStats,
  SHIFTS,
  SHIFT_GOAL_MINUTES
} from "@/utils/utils";
import {
  Flame,
  Star,
  Calendar,
  BarChart2,
  TrendingUp,
  Clock,
  Award,
  ClipboardList,
  LineChart as LineChartIcon,
  Target,
} from "lucide-react";
import { CustomHeatmap } from "../../components/CustomHeatmap";
import { Separator } from "../../components/ui/separator";
import { useIsMobile } from "@/hooks/useIsMobile";
import { format, subDays } from "date-fns";

interface DashboardProps {
  user: {
    displayName: string | null;
  };
  studiedDays: StudiedDays;
}

const StatItem = ({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  description?: string;
}) => (
  <div className="flex items-center justify-between">
    <div className="flex flex-col">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
      {description && (
        <p className="text-xs text-muted-foreground pt-1">{description}</p>
      )}
    </div>
    <Icon className="h-5 w-5 text-muted-foreground" />
  </div>
);

function Dashboard({ user, studiedDays }: DashboardProps) {
  const isMobile = useIsMobile();

  const todayShiftStats = useMemo(
    () => calculateShiftStats(studiedDays, new Date()),
    [studiedDays]
  );
  const past7DaysProgress = useMemo(
    () => getPast7DaysProgress(studiedDays),
    [studiedDays]
  );
  const streaksAndGoals = useMemo(
    () => calculateStreaksAndGoals(studiedDays),
    [studiedDays]
  );
  const overallStats = useMemo(
    () => calculateOverallStats(studiedDays),
    [studiedDays]
  );

  const goalCompletionRate =
    overallStats.totalDays > 0
      ? (streaksAndGoals.perfectDays / overallStats.totalDays) * 100
      : 0;

  const past30DaysProgress = useMemo(() => {
    const data = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = subDays(today, i);
      const dateKey = format(date, "yyyy-MM-dd");
      const dayData = studiedDays[dateKey];
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        minutes: dayData?.totalMinutes || 0,
        fullDate: dateKey,
      });
    }
    return data;
  }, [studiedDays]);

  if (Object.keys(studiedDays).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
        <p className="text-lg font-medium">No Data Yet!</p>
        <p className="text-sm sm:text-base">
          Complete a study session to start seeing your stats.
        </p>
      </div>
    );
  }
  
  const chartTickStyle = {
    fill: "var(--muted-foreground)",
    fontSize: isMobile ? 10 : 12,
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.displayName || "User"}!
        </p>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-4">Today&apos;s Shift Report</h2>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {SHIFTS.map((shift, index) => {
            const durationInMinutes = todayShiftStats[index];
            const progress = (durationInMinutes / SHIFT_GOAL_MINUTES) * 100;
            return (
              <Card key={shift.name}>
                <CardHeader>
                  <CardTitle className="text-base">{shift.name}</CardTitle>
                  <CardDescription>{`${shift.startHour}:00 - ${shift.endHour}:00`}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-2xl font-bold">
                    {durationInMinutes.toFixed(1)} mins
                  </p>
                  <Progress value={progress} />
                  <p className="text-xs text-muted-foreground">
                    {progress.toFixed(0)}% of {SHIFT_GOAL_MINUTES}-min goal
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5" />
              Overall Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <StatItem title="Total Studied Time" value={`${overallStats.totalMinutes.toFixed(2)} mins`} icon={Clock} />
            <Separator />
            <StatItem title="Total Tracked Days" value={String(overallStats.totalDays)} icon={Calendar} />
            <Separator />
            <StatItem title="Avg. Daily Study" value={`${overallStats.avgDailyMinutes.toFixed(2)} mins`} icon={BarChart2} />
            <Separator />
            <StatItem title="Avg. per Shift" value={`${overallStats.avgShiftMinutes.toFixed(2)} mins`} icon={ClipboardList} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="size-5" />
              Past 7 Days Progress
            </CardTitle>
            <CardDescription>
              Total minutes studied each day this week.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <ResponsiveContainer width="100%" height="100%" minHeight={300}>
              <BarChart data={past7DaysProgress} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={chartTickStyle} />
                <YAxis axisLine={false} tickLine={false} tick={chartTickStyle} />
                <Tooltip
                  cursor={{ fill: "var(--accent)" }}
                  contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                />
                <Bar dataKey="minutes" name="Minutes Studied" fill="var(--foreground)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <LineChartIcon className="size-5" />
              Study Time Trend (Last 30 Days)
            </CardTitle>
            <CardDescription>
              Daily study time progression over the past month.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <ResponsiveContainer width="100%" height="100%" minHeight={300}>
              <LineChart data={past30DaysProgress} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false}
                  interval={isMobile ? 9 : 6}
                  tick={chartTickStyle}
                />
                <YAxis axisLine={false} tickLine={false} tick={chartTickStyle} />
                <Tooltip
                  labelFormatter={(_, payload) => `Date: ${payload?.[0]?.payload.fullDate || ''}`}
                  formatter={(value: number) => [`${value} mins`, 'Study Time']}
                  contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                />
                <Line
                  type="monotone"
                  dataKey="minutes"
                  stroke="var(--foreground)"
                  strokeWidth={2}
                  dot={{ fill: "var(--foreground)", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "var(--foreground)", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div>
        <CustomHeatmap studiedDays={studiedDays} />
      </div>
    </div>
  );
}

export default Dashboard;