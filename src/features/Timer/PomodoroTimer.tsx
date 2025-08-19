// src/features/Timer/PomodoroTimer.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import TimerDisplay from './components/TimerDisplay';
import TimerControls from './components/TimerControls';

const WORK_DURATION = 30 * 60; // 30 minutes
const STORAGE_KEYS = {
  TIME: 'pomodoro-time',
  IS_ACTIVE: 'pomodoro-isActive',
  TIMESTAMP: 'pomodoro-timestamp'
} as const;

const getInitialState = () => {
  const savedTime = localStorage.getItem(STORAGE_KEYS.TIME);
  const savedTimestamp = localStorage.getItem(STORAGE_KEYS.TIMESTAMP);
  const savedIsActive = localStorage.getItem(STORAGE_KEYS.IS_ACTIVE);

  if (savedTime && savedTimestamp) {
    const time = parseInt(savedTime, 10);
    const timestamp = parseInt(savedTimestamp, 10);
    const wasActive = savedIsActive === 'true';
    
    if (wasActive) {
      // Timer was running when page closed, calculate elapsed time
      const elapsedSeconds = Math.floor((Date.now() - timestamp) / 1000);
      const newTime = time - elapsedSeconds;
      return {
        timeLeft: newTime > 0 ? newTime : 0,
        isActive: newTime > 0 // Auto-pause if time ran out
      };
    } else {
      // Timer was paused, return saved time without elapsed calculation
      return {
        timeLeft: time > 0 ? time : WORK_DURATION,
        isActive: false
      };
    }
  }
  
  return {
    timeLeft: WORK_DURATION,
    isActive: false
  };
};

export default function PomodoroTimer() {
  const initialState = getInitialState();
  const [timeLeft, setTimeLeft] = useState(initialState.timeLeft);
  const [isTimerActive, setIsTimerActive] = useState(initialState.isActive);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Save state to localStorage
  const saveState = useCallback((time: number, active: boolean) => {
    localStorage.setItem(STORAGE_KEYS.TIME, String(time));
    localStorage.setItem(STORAGE_KEYS.IS_ACTIVE, String(active));
    localStorage.setItem(STORAGE_KEYS.TIMESTAMP, String(Date.now()));
  }, []);

  // Clear localStorage
  const clearState = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.TIME);
    localStorage.removeItem(STORAGE_KEYS.IS_ACTIVE);
    localStorage.removeItem(STORAGE_KEYS.TIMESTAMP);
  }, []);

  // Main timer effect
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isTimerActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          const newTime = prevTime - 1;
          if (newTime <= 0) {
            setIsTimerActive(false);
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isTimerActive, timeLeft]);

  // Save state whenever it changes
  useEffect(() => {
    saveState(timeLeft, isTimerActive);
  }, [timeLeft, isTimerActive, saveState]);

  // Handle page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveState(timeLeft, isTimerActive);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [timeLeft, isTimerActive, saveState]);

  // Timer completed effect
  useEffect(() => {
    if (timeLeft === 0 && isTimerActive) {
      setIsTimerActive(false);
      // Optional: Add notification or sound here
      console.log('Pomodoro session completed!');
    }
  }, [timeLeft, isTimerActive]);

  const handlePlayPause = useCallback(() => {
    if (timeLeft === 0) {
      // If timer is at 0, reset it before starting
      setTimeLeft(WORK_DURATION);
      setIsTimerActive(true);
    } else {
      setIsTimerActive(prev => !prev);
    }
  }, [timeLeft]);

  const handleReset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsTimerActive(false);
    setTimeLeft(WORK_DURATION);
    clearState();
  }, [clearState]);
  
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
      
      {timeLeft === 0 && (
        <div className="mt-4 p-4 bg-green-100 dark:bg-green-900 rounded-lg">
          <p className="text-green-800 dark:text-green-200 font-medium">
            🎉 Pomodoro session completed! Great work!
          </p>
        </div>
      )}
    </div>
  );
}