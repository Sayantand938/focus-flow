// src/features/Progression/components/ProgressionCard.tsx
import { Card, CardContent } from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import { Separator } from "@/shared/components/ui/separator";
import { motion } from "framer-motion";
import { ProgressionInfo } from "../lib/progressionSystem";

interface ProgressionCardProps {
  progression: ProgressionInfo;
  totalXp: number;
}

export function ProgressionCard({ progression }: ProgressionCardProps) {
  return (
    <Card className="max-w-xl mx-auto border-2 border-border/60 shadow-lg">
      <CardContent className="p-6 sm:p-8 space-y-6">

        {/* Header Section with Rank */}
        <div className="space-y-1">
          <motion.h2 
            key={progression.rankName}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold tracking-tight text-foreground"
          >
            {progression.rankName}
          </motion.h2>
          <motion.p 
            key={progression.levelTitle}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl text-muted-foreground"
          >
            {progression.levelTitle}
          </motion.p>
        </div>

        <Separator />

        {/* Progress Bar Section */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-mono text-muted-foreground">
            <span>Level {progression.currentLevel}</span>
            <span className="font-semibold text-foreground/80">
              {progression.isMaxLevel ? 
                "MAX LEVEL" : 
                `${Math.floor(progression.xpProgress)} / ${progression.xpNeeded} XP`
              }
            </span>
          </div>
          <Progress value={progression.progressPercentage} />
        </div>

      </CardContent>
    </Card>
  );
}