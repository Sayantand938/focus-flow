// src/components/ui/custom-heatmap.tsx
import React, { useMemo, useState, useRef } from 'react';
import { StudiedDays } from "@/shared/lib/types";
import { getHeatmapData, DAILY_GOAL_MINUTES } from "@/shared/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/shared/components/ui/card";
import { Calendar } from "lucide-react";
import {
  format,
  subDays,
  addDays,
  startOfWeek,
  differenceInCalendarWeeks,
} from 'date-fns';
import { useIsMobile } from '@/shared/hooks/useIsMobile';

interface CustomHeatmapProps {
  studiedDays: StudiedDays;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  content: string;
  align: 'center' | 'left' | 'right'; // Added align property
}

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const CustomHeatmap: React.FC<CustomHeatmapProps> = ({ studiedDays }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, content: '', align: 'center' });
  const isMobile = useIsMobile();

  const { grid, monthLabels, dateRange, totalWeeks } = useMemo(() => {
    const heatmapData = getHeatmapData(studiedDays);
    const dataMap = new Map(heatmapData.map(d => [d.date, d.count]));

    const today = new Date();
    
    const endDate = today;
    let startDate: Date;
    
    if (isMobile) {
      // Show approx. 6 months on mobile
      startDate = subDays(endDate, 181);
    } else {
      // Show a rolling year on desktop
      const lastYear = new Date(today);
      lastYear.setFullYear(today.getFullYear() - 1);
      startDate = addDays(lastYear, 1);
    }
    
    // Align the grid start date to the beginning of the week (Sunday)
    const gridStartDate = startOfWeek(startDate, { weekStartsOn: 0 });
    const actualNumWeeks = differenceInCalendarWeeks(endDate, gridStartDate, { weekStartsOn: 0 }) + 1;
    
    const grid: ({ date: Date; studyTime: number }[])[] = [];
    const monthLabels: { label: string; weekIndex: number }[] = [];
    let currentMonth = -1;

    for (let weekIndex = 0; weekIndex < actualNumWeeks; weekIndex++) {
      const week: { date: Date; studyTime: number }[] = [];
      
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const date = addDays(gridStartDate, weekIndex * 7 + dayIndex);
        const dateKey = format(date, 'yyyy-MM-dd');
        const studyTime = dataMap.get(dateKey) || 0;
        
        week.push({ date, studyTime });
      }
      
      grid.push(week);

      // Check if the month has changed to add a label
      const firstDayOfWeek = week[0].date;
      if (firstDayOfWeek.getMonth() !== currentMonth) {
        currentMonth = firstDayOfWeek.getMonth();
        monthLabels.push({
          label: MONTH_LABELS[currentMonth],
          weekIndex: weekIndex
        });
      }
    }

    return { 
      grid, 
      monthLabels, 
      dateRange: { start: startDate, end: endDate },
      totalWeeks: actualNumWeeks
    };
  }, [studiedDays, isMobile]);

  const getColorClass = (minutes: number) => {
    // Use CSS variables for theme-aware colors
    if (minutes === 0) return "bg-[var(--color-heatmap-empty)] border-transparent";
    if (minutes >= DAILY_GOAL_MINUTES) return "bg-[var(--color-heatmap-perfect)] border-transparent";
    if (minutes < 120) return "bg-[var(--color-heatmap-1)] border-transparent";
    if (minutes < 240) return "bg-[var(--color-heatmap-2)] border-transparent";
    if (minutes < 360) return "bg-[var(--color-heatmap-3)] border-transparent";
    // For minutes >= 360 and < 480
    return "bg-[var(--color-heatmap-4)] border-transparent";
  };

  const getTooltipText = (date: Date, minutes: number) => {
    const formattedDate = format(date, 'MMMM d, yyyy');
    const contribution = minutes > 0 ? `${Math.round(minutes)} minutes` : 'No contributions';
    return `${contribution} on ${formattedDate}`;
  };

  const showTooltip = (event: React.MouseEvent, dayData: { date: Date; studyTime: number }) => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const squareRect = event.currentTarget.getBoundingClientRect();
    
    const x = squareRect.left - containerRect.left + squareRect.width / 2;
    const y = squareRect.top - containerRect.top - 8;
    
    const TOOLTIP_ESTIMATED_HALF_WIDTH = 100;
    let align: TooltipState['align'] = 'center';

    if (x - TOOLTIP_ESTIMATED_HALF_WIDTH < 0) {
      align = 'left';
    } else if (x + TOOLTIP_ESTIMATED_HALF_WIDTH > containerRect.width) {
      align = 'right';
    }

    setTooltip({
      visible: true,
      x,
      y,
      content: getTooltipText(dayData.date, dayData.studyTime),
      align,
    });
  };

  const hideTooltip = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  const alignmentClasses = {
    center: '-translate-x-1/2',
    left: 'translate-x-0',
    right: '-translate-x-full',
  };

  return (
    <div className="relative" ref={containerRef}>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="size-5"/>
            Study Activity
          </CardTitle>
          <CardDescription>
            Your study contributions from {format(dateRange.start, 'MMM d, yyyy')} to {format(dateRange.end, 'MMM d, yyyy')}.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col flex-1">
          <div className="flex flex-1 items-center gap-3 overflow-x-auto pb-4">
            <div className="flex flex-col gap-1 text-xs text-muted-foreground pt-6 flex-shrink-0">
              {WEEK_DAYS.map((day, i) => (
                <div
                  key={day}
                  className={`${isMobile ? 'h-2' : 'h-3'} flex items-center`}
                  style={{ visibility: i % 2 !== 0 ? 'hidden' : 'visible' }}
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="relative min-w-0 flex-1">
              <div className="flex absolute top-0 left-0 right-0">
                {monthLabels.map(({ label, weekIndex }) => (
                  <div
                    key={`${label}-${weekIndex}`}
                    className="text-xs text-muted-foreground absolute"
                    style={{ left: `${(weekIndex / totalWeeks) * 100}%` }}
                  >
                    {label}
                  </div>
                ))}
              </div>

              <div className="flex gap-1 pt-6 h-full" style={{ width: '100%' }}>
                {grid.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1 flex-1">
                    {week.map((day, dayIndex) => (
                      <div
                        key={`${weekIndex}-${dayIndex}`}
                        className={`${
                          isMobile ? 'h-2' : 'h-3'
                        } rounded-sm border cursor-pointer flex-1 ${getColorClass(day.studyTime)}`}
                        style={{ 
                          minWidth: isMobile ? '4px' : '6px',
                          aspectRatio: '1'
                        }}
                        onMouseEnter={(e) => showTooltip(e, day)}
                        onMouseLeave={hideTooltip}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {tooltip.visible && (
        <div
          className={`absolute z-50 px-3 py-2 text-xs bg-popover text-popover-foreground border rounded-md shadow-lg pointer-events-none transform -translate-y-full whitespace-nowrap ${alignmentClasses[tooltip.align]}`}
          style={{
            left: tooltip.x,
            top: tooltip.y
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
};