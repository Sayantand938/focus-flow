// src/components/CustomHeatmap.tsx
import React, { useMemo, useState } from 'react';
import { StudiedDays } from '@/utils/types';
import { getHeatmapData } from '@/utils/utils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Calendar } from "lucide-react";
import {
  format,
  subDays,
  addDays,
  startOfWeek,
  differenceInCalendarWeeks,
} from 'date-fns';
import { useIsMobile } from '@/hooks/useIsMobile';

interface CustomHeatmapProps {
  studiedDays: StudiedDays;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  content: string;
}

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const CustomHeatmap: React.FC<CustomHeatmapProps> = ({ studiedDays }) => {
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, content: '' });
  const isMobile = useIsMobile();

  const { grid, monthLabels, dateRange } = useMemo(() => {
    const heatmapData = getHeatmapData(studiedDays);
    const dataMap = new Map(heatmapData.map(d => [d.date, d.count]));

    const today = new Date();
    
    const endDate = today;
    let startDate: Date;
    
    if (isMobile) {
      startDate = subDays(endDate, 181);
    } else {
      const lastYear = new Date(today);
      lastYear.setFullYear(today.getFullYear() - 1);
      startDate = addDays(lastYear, 1);
    }
    
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
      dateRange: { start: startDate, end: endDate }
    };
  }, [studiedDays, isMobile]);

  const getColorClass = (minutes: number) => {
    if (minutes === 0) return "bg-muted/30 border-muted/50";
    if (minutes < 15) return "bg-primary/20 border-primary/30";
    if (minutes < 30) return "bg-primary/40 border-primary/50";
    if (minutes < 60) return "bg-primary/60 border-primary/70";
    return "bg-primary/80 border-primary/90";
  };

  const getTooltipText = (date: Date, minutes: number) => {
    const formattedDate = format(date, 'MMMM d, yyyy');
    const contribution = minutes > 0 ? `${Math.round(minutes)} minutes` : 'No contributions';
    return `${contribution} on ${formattedDate}`;
  };

  const showTooltip = (event: React.MouseEvent, dayData: { date: Date; studyTime: number }) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltip({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
      content: getTooltipText(dayData.date, dayData.studyTime)
    });
  };

  const hideTooltip = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  return (
    <div className="relative">
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
                    style={{ left: `${(weekIndex / (isMobile ? 26 : 52)) * 100}%` }}
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

          <div className="flex items-center justify-end mt-4 text-xs text-muted-foreground gap-2">
            <span>Less</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-muted/30 border border-muted/50"></div>
              <div className="w-3 h-3 rounded-sm bg-primary/20 border border-primary/30"></div>
              <div className="w-3 h-3 rounded-sm bg-primary/40 border border-primary/50"></div>
              <div className="w-3 h-3 rounded-sm bg-primary/60 border border-primary/70"></div>
              <div className="w-3 h-3 rounded-sm bg-primary/80 border border-primary/90"></div>
            </div>
            <span>More</span>
          </div>
        </CardContent>
      </Card>

      {tooltip.visible && (
        <div
          className="fixed z-50 px-3 py-2 text-xs bg-popover text-popover-foreground border rounded-md shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
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