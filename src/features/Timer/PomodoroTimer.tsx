// src/features/Timer/PomodoroTimer.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import TimerDisplay from './components/TimerDisplay';
import TimerControls from './components/TimerControls';

const WORK_DURATION = 30 * 60; // 30 minutes in seconds

const STORAGE_KEYS = {
  TIME_LEFT: 'pomodoro-timeLeft',
  IS_ACTIVE: 'pomodoro-isActive',
  LAST_PAUSE: 'pomodoro-lastPause',
} as const;

// Helper function to get the initial state from localStorage
const getInitialState = () => {
  const savedIsActive = localStorage.getItem(STORAGE_KEYS.IS_ACTIVE);
  const savedTimeLeft = localStorage.getItem(STORAGE_KEYS.TIME_LEFT);
  const savedLastPause = localStorage.getItem(STORAGE_KEYS.LAST_PAUSE);

  const wasActive = savedIsActive === 'true';

  if (wasActive && savedLastPause) {
    // If the timer was active, calculate elapsed time
    const lastPauseTime = parseInt(savedLastPause, 10);
    const elapsedSeconds = Math.floor((Date.now() - lastPauseTime) / 1000);
    const newTime = WORK_DURATION - elapsedSeconds;
    
    return {
      timeLeft: newTime > 0 ? newTime : 0,
      isActive: newTime > 0 ? true : false // Resume only if time is left
    };
  } else if (!wasActive && savedTimeLeft) {
    // If the timer was paused, load the saved time
    const timeLeft = parseInt(savedTimeLeft, 10);
    return {
      timeLeft: timeLeft,
      isActive: false
    };
  }

  // If no saved state exists, return the default
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
  const saveState = useCallback((active: boolean, time: number) => {
    localStorage.setItem(STORAGE_KEYS.IS_ACTIVE, String(active));
    if (active) {
      localStorage.setItem(STORAGE_KEYS.LAST_PAUSE, String(Date.now() - (WORK_DURATION - time) * 1000));
    } else {
      localStorage.setItem(STORAGE_KEYS.TIME_LEFT, String(time));
    }
  }, []);

  // Clear localStorage
  const clearState = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.TIME_LEFT);
    localStorage.removeItem(STORAGE_KEYS.IS_ACTIVE);
    localStorage.removeItem(STORAGE_KEYS.LAST_PAUSE);
  }, []);

  // Main timer effect
  useEffect(() => {
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

  // Handle page unload to save state
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveState(isTimerActive, timeLeft);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isTimerActive, timeLeft, saveState]);

  // Timer completed effect
  useEffect(() => {
    if (timeLeft === 0 && isTimerActive) {
      setIsTimerActive(false);
      clearState();
      console.log('Pomodoro session completed!');
    }
  }, [timeLeft, isTimerActive, clearState]);

  const handlePlayPause = useCallback(() => {
    setIsTimerActive(prev => !prev);
    if (!isTimerActive) {
      // Starting the timer
      saveState(true, timeLeft);
    } else {
      // Pausing the timer
      saveState(false, timeLeft);
    }
  }, [isTimerActive, timeLeft, saveState]);

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