// src/features/Timer/PomodoroTimer.tsx
import { Card, CardContent } from "@/components/ui/card";
import TimerDisplay from './components/TimerDisplay';
import TimerControls from './components/TimerControls';

interface PomodoroTimerProps {
  timeLeft: number;
  isActive: boolean;
  onPlayPause: () => void;
  onReset: () => void;
  duration: number;
}

export default function PomodoroTimer({ 
  timeLeft, 
  isActive, 
  onPlayPause, 
  onReset,
  duration
}: PomodoroTimerProps) {
  
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center text-center">
      <header className="mb-12">
        <h1 className="text-4xl font-bold">Pomodoro Timer</h1>
        <p className="text-muted-foreground mt-2">
          Focus for a 30-minute session.
        </p>
      </header>

      <Card className="w-full max-w-sm pt-6 pb-5">
        <CardContent className="p-0 flex flex-col items-center gap-6">
          <TimerDisplay timeLeft={timeLeft} duration={duration} />
          <TimerControls 
            isActive={isActive}
            onPlayPause={onPlayPause}
            onReset={onReset}
          />
        </CardContent>
      </Card>
    </div>
  );
}