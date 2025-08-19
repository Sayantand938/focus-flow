// src/features/Dashboard/index.tsx
import { useMemo } from "react";
import { motion, Variants } from "framer-motion";
import { useIsMobile } from "@/shared/hooks/useIsMobile";
import { format, subDays } from "date-fns";
import {
  calculateShiftStats, getPast7DaysProgress, calculateStreaksAndGoals,
  calculateOverallStats, calculateProgression,
} from "@/shared/lib/utils";
import { CustomHeatmap } from "@/shared/components/ui/custom-heatmap";
import { ShiftReport } from "./components/ShiftReport";
import { StreaksAndGoals } from "./components/StreaksAndGoals";
import { OverallStats } from "./components/OverallStats";
import { ProgressionStatus } from "./components/ProgressionStatus";
import { WeeklyProgressChart } from "./components/WeeklyProgressChart";
import { StudyTimeTrend } from "./components/StudyTimeTrend";
import { useAuthStore } from "@/stores/authStore";
import { useLogStore, selectStudiedDays } from "@/stores/logStore";
import { useProgressionStore } from "@/stores/progressionStore";
// --- UPDATED: Import StudiedDays type for casting ---
import { StudiedDays } from "@/shared/lib/types";

interface OverallStatsData {
  totalMinutes: number;
  totalDays: number;
  avgDailyMinutes: number;
  avgShiftMinutes: number;
}

export function Dashboard() {
  const isMobile = useIsMobile();
  const user = useAuthStore((state) => state.user);
  const totalXp = useProgressionStore((state) => state.totalXp);
  
  // --- FIX: Explicitly cast the return type of the selector to fix all 'unknown' errors ---
  const studiedDays = useLogStore(selectStudiedDays) as StudiedDays;

  const todayShiftStats = useMemo(() => calculateShiftStats(studiedDays, new Date()), [studiedDays]);
  const past7DaysProgress = useMemo(() => getPast7DaysProgress(studiedDays), [studiedDays]);
  const streaksAndGoals = useMemo(() => calculateStreaksAndGoals(studiedDays), [studiedDays]);
  const progressionInfo = useMemo(() => calculateProgression(totalXp), [totalXp]);

  const overallStats: OverallStatsData = useMemo(
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

  const goalCompletionRate = overallStats.totalDays > 0 ? (streaksAndGoals.perfectDays / overallStats.totalDays) * 100 : 0;

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.08, 
        delayChildren: 0.05 
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { 
      y: 16, 
      opacity: 0 
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 120, 
        damping: 18 
      },
    },
  };

  const gridItemVariants: Variants = {
    hidden: { 
      y: 12, 
      opacity: 0,
      scale: 0.98
    },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 140, 
        damping: 20 
      },
    },
  };

  const gridVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.1,
      },
    },
  };

  if (Object.keys(studiedDays).length === 0) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
      >
        <p className="text-lg font-medium">No Data Yet!</p>
        <p className="text-sm sm:text-base">Complete a study session to start seeing your stats.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="w-full space-y-8 scroll-enhanced"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.header 
        className="space-y-1 mb-6"
        variants={itemVariants}
      >
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.displayName || "User"}!</p>
      </motion.header>

      <motion.div variants={itemVariants}>
        <ShiftReport todayShiftStats={todayShiftStats} />
      </motion.div>

      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        variants={gridVariants}
      >
        <motion.div variants={gridItemVariants}>
          <ProgressionStatus progressionInfo={progressionInfo} />
        </motion.div>
        <motion.div variants={gridItemVariants}>
          <StreaksAndGoals streaksAndGoals={streaksAndGoals} goalCompletionRate={goalCompletionRate} />
        </motion.div>
        <motion.div variants={gridItemVariants}>
          <OverallStats overallStats={overallStats} />
        </motion.div>
      </motion.div>

      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        variants={gridVariants}
      >
        <motion.div variants={gridItemVariants}>
          <WeeklyProgressChart past7DaysProgress={past7DaysProgress} isMobile={isMobile} />
        </motion.div>
        <motion.div variants={gridItemVariants}>
          <StudyTimeTrend past30DaysProgress={past30DaysProgress} isMobile={isMobile} />
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <CustomHeatmap studiedDays={studiedDays} />
      </motion.div>
    </motion.div>
  );
}

export default Dashboard;