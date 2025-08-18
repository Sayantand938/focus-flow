// D:/Coding/tauri-projects/focus-flow/src/features/Dashboard/components/ShiftReport.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SHIFTS, SHIFT_GOAL_MINUTES } from "@/utils/utils";
import { motion } from "framer-motion";

interface ShiftReportProps {
  todayShiftStats: { [key: number]: number };
}

export function ShiftReport({ todayShiftStats }: ShiftReportProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Today&apos;s Shift Report</h2>
      <motion.div
        className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {SHIFTS.map((shift, index) => {
          const durationInMinutes = todayShiftStats[index];
          const progress = (durationInMinutes / SHIFT_GOAL_MINUTES) * 100;
          return (
            <motion.div key={shift.name} variants={itemVariants}>
              <Card>
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
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}