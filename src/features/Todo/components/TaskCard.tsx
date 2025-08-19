// src/features/Todo/components/TaskCard.tsx
import { Todo } from "@/shared/lib/types";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Calendar, CheckSquare, Star } from "lucide-react";
import { format, isPast, isToday } from 'date-fns';
import { getPriorityInfo, getStatusInfo } from './icons';
import { cn } from "@/shared/lib/utils";

interface TaskCardProps {
  task: Todo;
  onSelect: (task: Todo) => void;
  onToggleStar: (id: string) => void;
}

export function TaskCard({ task, onSelect, onToggleStar }: TaskCardProps) {
  const { label: statusLabel } = getStatusInfo(task.status);
  const { label: priorityLabel } = getPriorityInfo(task.priority);
  const completedSubtasks = task.subtasks.filter(st => st.isCompleted).length;
  
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate));

  return (
    <div 
      className="border rounded-lg p-4 space-y-3 cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => onSelect(task)}
    >
      <div className="flex items-start justify-between">
        <h3 className="font-semibold pr-4">{task.title}</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          className="size-7 flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onToggleStar(task.id);
          }}
        >
          <Star className={`size-4 ${task.isStarred ? 'fill-amber-400 text-amber-500' : 'text-muted-foreground'}`} />
        </Button>
      </div>
      
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        {task.dueDate && (
          <div className={cn("flex items-center gap-1.5", isOverdue && "text-destructive font-medium")}>
            <Calendar className="size-3.5" />
            <span>{format(new Date(task.dueDate), "MMM d")}</span>
          </div>
        )}
        {task.subtasks.length > 0 && (
          <div className="flex items-center gap-1.5">
            <CheckSquare className="size-3.5" />
            <span>{completedSubtasks}/{task.subtasks.length}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 pt-2">
         <Badge variant={task.status as any}>{statusLabel}</Badge>
         <Badge variant={task.priority as any}>{priorityLabel}</Badge>
      </div>
    </div>
  );
}