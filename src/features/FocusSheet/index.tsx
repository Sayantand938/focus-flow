// src/features/FocusSheet/index.tsx
import { useMemo } from 'react';
import { SHIFTS } from "@/shared/lib/utils";
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
  const { dailyLogs, toggleSession, updateSlotTag } = useLogStore();

  const todaysSlots = useMemo(() => {
    const todayKey = format(new Date(), "yyyy-MM-dd");
    const todayData = dailyLogs.find(log => log.id === todayKey);
    return todayData?.slots || {};
  }, [dailyLogs]);

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.05 },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 16, opacity: 0, scale: 0.98 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 120, damping: 18 },
    },
  };

  const gridVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.1, },
    },
  };

  const gridItemVariants: Variants = {
    hidden: { y: 12, opacity: 0, scale: 0.98 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 140, damping: 20 },
    },
  };

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
        <h1 className="text-3xl font-bold">Focus Sheet</h1>
        <p className="text-muted-foreground">
          Toggle a switch to log a 30-minute study session for that hour block.
        </p>
      </motion.header>

      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8"
        variants={gridVariants}
      >
        {SHIFTS.map((shift) => (
          <motion.div 
            key={shift.name} 
            variants={gridItemVariants}
            className="w-full"
          >
            <ShiftCard
              shift={shift}
              todaysSlots={todaysSlots}
              formatHourSlot={formatHourSlot}
              onToggleSession={toggleSession}
              onUpdateTag={updateSlotTag}
            />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}