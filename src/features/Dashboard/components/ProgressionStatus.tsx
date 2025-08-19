// src/features/Dashboard/components/ProgressionStatus.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import { Shield } from "lucide-react";
import { motion } from "framer-motion";
import { ProgressionInfo } from "@/shared/lib/utils";

interface ProgressionStatusProps {
  progressionInfo: ProgressionInfo;
}

export function ProgressionStatus({ progressionInfo }: ProgressionStatusProps) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Shield className="size-5" />
          Progression
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 justify-center space-y-4">
        {/* Rank and Title Display */}
        <div className="text-center">
          <motion.h3
            key={progressionInfo.rankName}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold tracking-tight text-foreground"
          >
            {progressionInfo.rankName}
          </motion.h3>
          <motion.p
            key={progressionInfo.levelTitle}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg text-muted-foreground"
          >
            {progressionInfo.levelTitle}
          </motion.p>
        </div>
        
        {/* XP Progress Bar */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between items-center text-xs font-mono text-muted-foreground">
            <span>Level {progressionInfo.currentLevel}</span>
            <span className="font-semibold text-foreground/80">
              {progressionInfo.isMaxLevel 
                ? "MAX LEVEL" 
                : `${Math.floor(progressionInfo.xpProgress)} / ${progressionInfo.xpNeeded} XP`
              }
            </span>
          </div>
          <Progress value={progressionInfo.progressPercentage} />
        </div>
      </CardContent>
    </Card>
  );
}