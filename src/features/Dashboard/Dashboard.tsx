import { useMemo } from "react";
import { StudiedDays } from "@/utils/types";
import { useIsMobile } from "@/hooks/useIsMobile";
import { format, subDays } from "date-fns";
import {
  calculateShiftStats,
  getPast7DaysProgress,
  calculateStreaksAndGoals,
  calculateOverallStats,
} from "@/utils/utils";
import { CustomHeatmap } from "@/components/ui/custom-heatmap";
import { ShiftReport } from "./components/ShiftReport";
import { StreaksAndGoals } from "./components/StreaksAndGoals";
import { OverallStats } from "./components/OverallStats";
import { WeeklyProgressChart } from "./components/WeeklyProgressChart";
import { StudyTimeTrend } from "./components/StudyTimeTrend";

interface DashboardProps {
  user: {
    displayName: string | null;
  };
  studiedDays: StudiedDays;
}

export function Dashboard({ user, studiedDays }: DashboardProps) {
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

  const past30DaysProgress = useMemo(() => {
    const data = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = subDays(today, i);
      const dateKey = format(date, "yyyy-MM-dd");
      const dayData = studiedDays[dateKey];

      data.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        minutes: dayData?.totalMinutes || 0,
        fullDate: dateKey,
      });
    }
    return data;
  }, [studiedDays]);

  const goalCompletionRate =
    overallStats.totalDays > 0
      ? (streaksAndGoals.perfectDays / overallStats.totalDays) * 100
      : 0;

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

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.displayName || "User"}!
        </p>
      </header>
      <ShiftReport todayShiftStats={todayShiftStats} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <StreaksAndGoals
          streaksAndGoals={streaksAndGoals}
          goalCompletionRate={goalCompletionRate}
        />
        <OverallStats overallStats={overallStats} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <WeeklyProgressChart past7DaysProgress={past7DaysProgress} isMobile={isMobile} />
        <StudyTimeTrend past30DaysProgress={past30DaysProgress} isMobile={isMobile} />
      </div>
      <div>
        <CustomHeatmap studiedDays={studiedDays} />
      </div>
    </div>
  );
}

export default Dashboard;