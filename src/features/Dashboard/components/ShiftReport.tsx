import {
  Card,
  CardContent,
  CardTitle,
} from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import { SHIFTS, SHIFT_GOAL_MINUTES } from "@/shared/lib/utils";
import { motion } from "framer-motion";
import { Sunrise, Sunset, Moon, CloudSun } from "lucide-react";

interface ShiftReportProps {
  todayShiftStats: number[];
}

const shiftIcons = [Sunrise, CloudSun, Sunset, Moon];

export function ShiftReport({ todayShiftStats }: ShiftReportProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
  };

  return (
    <section>
      <motion.div
        className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {SHIFTS.map((shift, index) => {
          const durationInMinutes = todayShiftStats[index] || 0;
          const progress = (durationInMinutes / SHIFT_GOAL_MINUTES) * 100;
          const Icon = shiftIcons[index % shiftIcons.length];

          return (
            <motion.div key={shift.name} variants={itemVariants}>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Icon className="h-6 w-6 text-primary" />
                      <CardTitle className="text-lg font-semibold">
                        {shift.name}
                      </CardTitle>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {`${shift.startHour}:00 - ${shift.endHour}:00`}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <Progress value={progress} className="h-2 rounded-full" />
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{progress.toFixed(0)}%</span>
                      <span className="text-muted-foreground">{durationInMinutes} mins</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}