// D:/Coding/tauri-projects/focus-flow/src/features/Timer/components/TimerDisplay.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface TimerDisplayProps {
  timeLeft: number;
  duration: number;
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

const TimerDisplay: React.FC<TimerDisplayProps> = ({ timeLeft, duration }) => {
  const radius = 120;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  
  // Ensure progress is between 0 and 1, handle edge cases
  const progress = duration > 0 ? Math.max(0, Math.min(1, timeLeft / duration)) : 0;
  
  // Calculate stroke dash offset for the progress circle
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="relative flex items-center justify-center size-72">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90"
        role="img"
        aria-label={`Timer progress: ${Math.round(progress * 100)}% remaining`}
      >
        {/* Background circle */}
        <circle
          stroke="var(--color-border)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Progress circle */}
        <motion.circle
          stroke="var(--color-primary)"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          initial={false}
          animate={{ 
            strokeDashoffset: strokeDashoffset,
            stroke: timeLeft === 0 ? "var(--color-success, #22c55e)" : "var(--color-primary)"
          }}
          transition={{ 
            strokeDashoffset: { duration: 0.5, ease: "easeOut" },
            stroke: { duration: 0.3 }
          }}
        />
      </svg>
      
      <div className="absolute flex flex-col items-center justify-center">
        <span 
          className={`text-6xl font-bold tracking-tighter font-mono transition-colors duration-300 ${
            timeLeft === 0 ? 'text-green-600 dark:text-green-400' : ''
          }`}
          role="timer"
          aria-live="polite"
          aria-atomic="true"
        >
          {formatTime(timeLeft)}
        </span>
        {timeLeft === 0 && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-sm font-medium text-green-600 dark:text-green-400 mt-1"
          >
            Complete!
          </motion.span>
        )}
      </div>
    </div>
  );
};

export default TimerDisplay;