// src/features/Dashboard/components/ProgressionStatus.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import { Shield, Star, Zap } from "lucide-react";
import { motion } from "framer-motion";
// --- UPDATED: Import formatXp utility ---
import { ProgressionInfo, formatXp } from "@/shared/lib/utils";

interface ProgressionStatusProps {
  progressionInfo: ProgressionInfo;
}

export function ProgressionStatus({ progressionInfo }: ProgressionStatusProps) {
  const isNearNextLevel = progressionInfo.progressPercentage > 80;
  const isMaxLevel = progressionInfo.isMaxLevel;

  return (
    <Card className="relative overflow-hidden h-full">
      <CardHeader className="relative pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              {isMaxLevel ? <Star className="size-5" /> : 
               isNearNextLevel ? <Zap className="size-5" /> : 
               <Shield className="size-5" />}
            </div>
            <span className="text-lg font-semibold">Progression</span>
          </div>
          {isMaxLevel && (
            <div className="flex items-center gap-1 px-2 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium">
              <Star className="size-3" />
              MAX
            </div>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 pt-0">
        <div className="flex justify-center">
          <motion.div
            key={progressionInfo.currentLevel}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative px-8 py-4 rounded-2xl border-2"
            style={{
              backgroundColor: "rgb(16 18 20)",
              border: "2px solid white",
            }}
          >
            <div className="text-center">
              <div className="text-xs uppercase tracking-wider font-medium text-muted-foreground mb-1">
                Level
              </div>
              <div className="text-4xl font-bold text-foreground">
                {progressionInfo.currentLevel}
              </div>
            </div>
            {isMaxLevel && (
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-foreground rounded-full flex items-center justify-center">
                <Star className="size-3 text-background" />
              </div>
            )}
          </motion.div>
        </div>

        <div className="text-center space-y-3">
          <motion.div
            key={progressionInfo.rankName}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-2"
          >
            <h3 className="text-2xl font-bold tracking-tight text-foreground">
              {progressionInfo.rankName}
            </h3>
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-border to-transparent mx-auto"></div>
          </motion.div>
          
          <motion.p
            key={progressionInfo.levelTitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-base text-muted-foreground font-medium"
          >
            {progressionInfo.levelTitle}
          </motion.p>
        </div>

        <div className="space-y-5">
          {!isMaxLevel ? (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-4 bg-muted/50 rounded-lg border">
                  <div className="text-xl font-bold text-foreground mb-1">
                    {/* --- UPDATED: Apply XP formatting --- */}
                    {formatXp(progressionInfo.xpProgress)}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">
                    Current XP
                  </div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg border">
                  <div className="text-xl font-bold text-foreground mb-1">
                    {/* --- UPDATED: Apply XP formatting --- */}
                    {formatXp(progressionInfo.xpNeeded - progressionInfo.xpProgress)}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">
                    Needed
                  </div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg border">
                  <div className="text-xl font-bold text-foreground mb-1">
                    {Math.round(progressionInfo.progressPercentage)}%
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">
                    Progress
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">
                    Level {progressionInfo.currentLevel} → {progressionInfo.currentLevel + 1}
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {/* --- UPDATED: Apply XP formatting --- */}
                    {formatXp(progressionInfo.xpNeeded)} XP Total
                  </span>
                </div>
                
                <div className="relative">
                  <Progress 
                    value={progressionInfo.progressPercentage} 
                    className="h-3"
                  />
                  {isNearNextLevel && (
                    <motion.div
                      className="absolute -top-1 h-5 w-1 bg-foreground rounded-full"
                      style={{ 
                        left: `${progressionInfo.progressPercentage}%`,
                        transform: 'translateX(-50%)'
                      }}
                      animate={{ 
                        y: [-2, 2, -2],
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}
                </div>
                
                <div className="text-center">
                  <span className="text-xs text-muted-foreground">
                    {isNearNextLevel ? "Almost there! Keep it up!" : "Keep working towards your next level"}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center p-6 bg-muted/30 rounded-xl border-2 border-dashed border-border">
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 2, -2, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="inline-flex items-center gap-3 text-foreground mb-2"
              >
                <Star className="size-6" />
                <span className="text-xl font-bold">MAXIMUM LEVEL</span>
                <Star className="size-6" />
              </motion.div>
              <p className="text-sm text-muted-foreground">
                Congratulations! You&apos;ve reached the highest level possible.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}