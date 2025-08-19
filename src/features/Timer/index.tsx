// src/features/Timer/index.tsx
import { useState, useEffect, useRef, useCallback } from "react";
// --- This will now be found after installing the plugin ---
import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification';
import { Card, CardContent } from "@/shared/components/ui/card";
import TimerDisplay from './components/TimerDisplay';
import TimerControls from './components/TimerControls';

const WORK_DURATION = 30 * 60; // 30 minutes in seconds

const STORAGE_KEYS = {
  END_TIME: 'pomodoro-endTime', 
  PAUSED_TIME: 'pomodoro-pausedTime',
} as const;

const getInitialState = () => {
  const savedEndTime = localStorage.getItem(STORAGE_KEYS.END_TIME);
  const savedPausedTime = localStorage.getItem(STORAGE_KEYS.PAUSED_TIME);

  if (savedEndTime) {
    const endTime = parseInt(savedEndTime, 10);
    const timeLeft = Math.round((endTime - Date.now()) / 1000);
    
    if (timeLeft > 0) {
      return { timeLeft, isActive: true };
    }
  }
  
  if (savedPausedTime) {
    return { timeLeft: parseInt(savedPausedTime, 10), isActive: false };
  }

  return { timeLeft: WORK_DURATION, isActive: false };
};

export default function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(WORK_DURATION);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    const initialState = getInitialState();
    setTimeLeft(initialState.timeLeft);
    setIsTimerActive(initialState.isActive);
  }, []);

  const clearState = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.END_TIME);
    localStorage.removeItem(STORAGE_KEYS.PAUSED_TIME);
  }, []);
  
  const showCompletionNotification = async () => {
    try {
      let permissionGranted = await isPermissionGranted();
      if (!permissionGranted) {
        const permission = await requestPermission();
        permissionGranted = permission === 'granted';
      }
      if (permissionGranted) {
        sendNotification({
          title: 'Session Complete!',
          body: 'Great work! Time for a break.',
        });
      }
    } catch(e) {
      console.error("Failed to send notification:", e);
    }
  };

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (isTimerActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          const newTime = prevTime - 1;
          if (newTime <= 0) {
            clearInterval(intervalRef.current!);
            setIsTimerActive(false);
            clearState();
            showCompletionNotification();
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isTimerActive, timeLeft, clearState]);

  const handlePlayPause = useCallback(() => {
    const newIsActive = !isTimerActive;
    setIsTimerActive(newIsActive);

    if (newIsActive) {
      const endTime = Date.now() + timeLeft * 1000;
      localStorage.setItem(STORAGE_KEYS.END_TIME, String(endTime));
      localStorage.removeItem(STORAGE_KEYS.PAUSED_TIME);
    } else {
      localStorage.setItem(STORAGE_KEYS.PAUSED_TIME, String(timeLeft));
      localStorage.removeItem(STORAGE_KEYS.END_TIME);
    }
  }, [isTimerActive, timeLeft]);

  const handleReset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
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