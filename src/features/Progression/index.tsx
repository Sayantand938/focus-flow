// src/features/Progression/index.tsx
import { useEffect, useState, useRef } from 'react';
import { motion, Variants } from "framer-motion";
import { useProgressionStore } from '@/stores/progressionStore';
import { calculateProgression, ProgressionInfo } from './lib/progressionSystem';
import { ProgressionCard } from './components/ProgressionCard';
import toast from 'react-hot-toast';

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

function Progression() {
  const { totalXp } = useProgressionStore();
  const [progression, setProgression] = useState<ProgressionInfo>(calculateProgression(totalXp));
  const prevLevelInfo = useRef({ level: progression.currentLevel, rank: progression.rankName });

  useEffect(() => {
    const newProgression = calculateProgression(totalXp);
    setProgression(newProgression);

    const hasLeveledUp = newProgression.currentLevel > prevLevelInfo.current.level;
    const hasRankedUp = newProgression.rankName !== prevLevelInfo.current.rank;

    if (hasRankedUp) {
      toast.success(`Rank Up! You are now a ${newProgression.rankName}!`, {
        duration: 5000,
        icon: '🚀',
      });
    } else if (hasLeveledUp) {
      toast.success(`Level Up! New title: ${newProgression.levelTitle}!`, {
        icon: '⭐',
      });
    }

    prevLevelInfo.current = { level: newProgression.currentLevel, rank: newProgression.rankName };
  }, [totalXp]);

  return (
    <motion.div
      className="w-full max-w-3xl mx-auto space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.header variants={itemVariants}>
        <h1 className="text-3xl font-bold">The Hero's Journey</h1>
        <p className="text-muted-foreground">
          Your progress from a fresh Recruit to a legendary Warlord.
        </p>
      </motion.header>

      <motion.div variants={itemVariants}>
        <ProgressionCard progression={progression} totalXp={totalXp} />
      </motion.div>
    </motion.div>
  );
}

export default Progression;