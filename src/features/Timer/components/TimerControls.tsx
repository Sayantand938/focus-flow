// src/features/Timer/components/TimerControls.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RefreshCw } from 'lucide-react';

interface TimerControlsProps {
  isActive: boolean;
  onPlayPause: () => void;
  onReset: () => void;
}

const TimerControls: React.FC<TimerControlsProps> = ({ 
  isActive, 
  onPlayPause, 
  onReset 
}) => {
  return (
    <div className="flex items-center gap-4">
      <Button
        onClick={onPlayPause}
        size="lg"
        className="w-24"
        aria-label={isActive ? "Pause timer" : "Start timer"}
      >
        {isActive ? (
          <>
            <Pause className="mr-2 h-5 w-5" />
            Pause
          </>
        ) : (
          <>
            <Play className="mr-2 h-5 w-5" />
            Play
          </>
        )}
      </Button>
      
      <Button
        onClick={onReset}
        variant="outline"
        size="lg"
        className="w-24"
        aria-label="Reset timer to full duration"
      >
        <RefreshCw className="mr-2 h-5 w-5" />
        Reset
      </Button>
    </div>
  );
};

export default TimerControls;