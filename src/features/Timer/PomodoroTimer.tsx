// src/features/Timer/PomodoroTimer.tsx
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import TimerDisplay from './components/TimerDisplay';
import TimerControls from './components/TimerControls';

const WORK_DURATION = 30 * 60; // 30 minutes

// Helper to get initial timer value from localStorage
const getInitialTime = () => {
  const savedTime = localStorage.getItem('pomodoro-time');
  if (savedTime) {
    const time = parseInt(savedTime, 10);
    return time > 0 && time <= WORK_DURATION ? time : WORK_DURATION;
  }
  return WORK_DURATION;
};

// Helper to get initial timer status from localStorage
const getInitialIsActive = () => {
    const savedIsActive = localStorage.getItem('pomodoro-isActive');
    return savedIsActive === 'true';
}

export default function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(getInitialTime);
  const [isTimerActive, setIsTimerActive] = useState(getInitialIsActive);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    localStorage.setItem('pomodoro-time', String(timeLeft));
    localStorage.setItem('pomodoro-isActive', String(isTimerActive));

    if (isTimerActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (!isTimerActive || timeLeft === 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeLeft === 0) {
        setIsTimerActive(false);
      }
    }
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isTimerActive, timeLeft]);

  const handlePlayPause = () => {
    setIsTimerActive(!isTimerActive);
  };

  const handleReset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsTimerActive(false);
    setTimeLeft(WORK_DURATION);
  };
  
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
          <TimerDisplay timeLeft={timeLeft} duration={WORK_DURATION} />
          <TimerControls 
            isActive={isTimerActive}
            onPlayPause={handlePlayPause}
            onReset={handleReset}
          />
        </CardContent>
      </Card>
    </div>
  );
}