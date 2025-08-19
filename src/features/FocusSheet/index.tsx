// src/features/FocusSheet/index.tsx
import { useMemo } from 'react';
// import { StudiedDays } from "@/shared/lib/types"; // <- REMOVED THIS LINE
import { SHIFTS, slotToHour } from "@/shared/lib/utils";
import { format } from "date-fns";
import ShiftCard from "./components/ShiftCard";
import { motion, Variants } from "framer-motion";
import { useLogStore } from '@/stores/logStore';

const formatHourDetailed = (hour: number): string => {
  const ampm = hour >= 12 ? "PM" : "AM";
  let displayHour = hour % 12;
  if (displayHour === 0) displayHour = 12;
  return `${String(displayHour).padStart(2, "0")}:00 ${ampm}`;
};

const formatHourSlot = (hour: number): string => {
  const start = formatHourDetailed(hour);
  const end = formatHourDetailed((hour + 1) % 24);
  return `${start} - ${end}`;
};

export default function FocusSheet() {
  const { dailyLogs, toggleSession } = useLogStore();

  const todaysCompletedHours = useMemo(() => {
    const todayKey = format(new Date(), "yyyy-MM-dd");
    const todayData = dailyLogs.find(log => log.id === todayKey);
    return new Set(todayData?.completedSlots.map(slotToHour).filter(h => h !== null) || []);
  }, [dailyLogs]);

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

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto space-y-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.header variants={itemVariants}>
        <h1 className="text-3xl font-bold">Focus Sheet</h1>
        <p className="text-muted-foreground">
          Toggle a switch to log a 30-minute study session for that hour block.
        </p>
      </motion.header>

      {SHIFTS.map((shift) => (
        <motion.div key={shift.name} variants={itemVariants}>
          <ShiftCard
            shift={shift}
            todaysCompletedHours={todaysCompletedHours}
            formatHourSlot={formatHourSlot}
            onToggleSession={toggleSession}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}