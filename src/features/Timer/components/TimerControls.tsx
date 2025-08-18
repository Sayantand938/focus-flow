// src/features/Timer/components/TimerControls.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RefreshCw } from 'lucide-react';

interface TimerControlsProps {
  isActive: boolean;
  onPlayPause: () => void;
  onReset: () => void;
}

const TimerControls: React.FC<TimerControlsProps> = ({ isActive, onPlayPause, onReset }) => {
  return (
    <div className="flex items-center gap-4">
      <Button
        onClick={onPlayPause}
        size="lg"
        className="w-24"
      >
        {isActive ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
        {isActive ? 'Pause' : 'Play'}
      </Button>
      <Button
        onClick={onReset}
        variant="outline"
        size="lg"
        className="w-24"
      >
        <RefreshCw className="mr-2 h-5 w-5" />
        Reset
      </Button>
    </div>
  );
}

export default TimerControls;