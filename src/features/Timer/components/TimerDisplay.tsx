// D:/Coding/tauri-projects/focus-flow/src/features/Timer/components/TimerDisplay.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface TimerDisplayProps {
  timeLeft: number;
  duration: number;
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

const TimerDisplay: React.FC<TimerDisplayProps> = ({ timeLeft, duration }) => {
  const radius = 120;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const progress = timeLeft / duration;

  return (
    <div className="relative flex items-center justify-center size-72">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90"
      >
        <circle
          stroke="var(--color-border)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
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
          animate={{ strokeDashoffset: circumference * (1 - progress) }}
          transition={{ duration: 1, ease: "linear" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        {/* Replaced motion.span with a regular span to remove the pulsing effect */}
        <span className="text-6xl font-bold tracking-tighter font-mono">
          {formatTime(timeLeft)}
        </span>
      </div>
    </div>
  );
};

export default TimerDisplay;