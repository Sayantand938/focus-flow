// src/features/Dashboard/index.tsx
import { useMemo } from "react";
import { motion, Variants } from "framer-motion";
import { useIsMobile } from "@/shared/hooks/useIsMobile";
import { format, subDays } from "date-fns";
import {
  calculateShiftStats, getPast7DaysProgress, calculateStreaksAndGoals,
  calculateOverallStats,
} from "@/shared/lib/utils";
import { CustomHeatmap } from "@/shared/components/ui/custom-heatmap";
import { ShiftReport } from "./components/ShiftReport";
import { StreaksAndGoals } from "./components/StreaksAndGoals";
import { OverallStats } from "./components/OverallStats";
import { WeeklyProgressChart } from "./components/WeeklyProgressChart";
import { StudyTimeTrend } from "./components/StudyTimeTrend";
import { useAuthStore } from "@/stores/authStore";
import { useLogStore } from "@/stores/logStore";
import { StudiedDays, DailyLog } from "@/shared/lib/types";

// Transformation function can be a local utility or imported
function transformLogsToStudiedDays(dailyLogs: DailyLog[]): StudiedDays {
  const studiedDays: StudiedDays = {};
  for (const log of dailyLogs) {
    const parts = log.id.split('-').map(Number);
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    studiedDays[log.id] = {
      date: date,
      completedSlots: log.completedSlots,
      totalMinutes: log.completedSlots.length * 30,
    };
  }
  return studiedDays;
}

// --- FIX START ---
// Explicitly define the type for the stats object to ensure type safety.
interface OverallStatsData {
  totalMinutes: number;
  totalDays: number;
  avgDailyMinutes: number;
  avgShiftMinutes: number;
}
// --- FIX END ---


export function Dashboard() {
  const isMobile = useIsMobile();
  const user = useAuthStore((state) => state.user);
  const dailyLogs = useLogStore((state) => state.dailyLogs);

  const studiedDays = useMemo(() => transformLogsToStudiedDays(dailyLogs), [dailyLogs]);

  const todayShiftStats = useMemo(() => calculateShiftStats(studiedDays, new Date()), [studiedDays]);
  const past7DaysProgress = useMemo(() => getPast7DaysProgress(studiedDays), [studiedDays]);
  const streaksAndGoals = useMemo(() => calculateStreaksAndGoals(studiedDays), [studiedDays]);

  // --- FIX START ---
  // Apply the explicit type to the useMemo hook.
  const overallStats: OverallStatsData = useMemo(
    () => calculateOverallStats(studiedDays), 
    [studiedDays]
  );
  // --- FIX END ---

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

  const goalCompletionRate = overallStats.totalDays > 0 ? (streaksAndGoals.perfectDays / overallStats.totalDays) * 100 : 0;

  // --- FIX START ---
  // Added the missing variant definitions for Framer Motion.
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };
  // --- FIX END ---

  if (Object.keys(studiedDays).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
        <p className="text-lg font-medium">No Data Yet!</p>
        <p className="text-sm sm:text-base">Complete a study session to start seeing your stats.</p>
      </div>
    );
  }

  return (
    <motion.div
      className="w-full max-w-7xl mx-auto space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.header variants={itemVariants}>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.displayName || "User"}!</p>
      </motion.header>
      <motion.div variants={itemVariants}>
        <ShiftReport todayShiftStats={todayShiftStats} />
      </motion.div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div variants={itemVariants}>
          <StreaksAndGoals streaksAndGoals={streaksAndGoals} goalCompletionRate={goalCompletionRate} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <OverallStats overallStats={overallStats} />
        </motion.div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div variants={itemVariants}>
          <WeeklyProgressChart past7DaysProgress={past7DaysProgress} isMobile={isMobile} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StudyTimeTrend past30DaysProgress={past30DaysProgress} isMobile={isMobile} />
        </motion.div>
      </div>
      <motion.div variants={itemVariants}>
        <CustomHeatmap studiedDays={studiedDays} />
      </motion.div>
    </motion.div>
  );
}

export default Dashboard;