// src/features/Todo/components/TaskDetailSheet.tsx
import { useState } from 'react';
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import { Separator } from "@/shared/components/ui/separator";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from "@/shared/components/ui/sheet";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { Todo } from "@/shared/lib/types";
import { getPriorityInfo, getStatusInfo } from './icons';
import { format, isPast, isToday } from "date-fns";
import { Edit, Plus, Trash2, FileText, Info, ListChecks, AlertTriangle } from 'lucide-react';
import { useTodoStore } from '@/stores/todoStore';
import { useIsMobile } from '@/shared/hooks/useIsMobile';
import { cn } from '@/shared/lib/utils';
// --- 1. IMPORT MOTION & ANIMATEPRESENCE ---
import { motion, AnimatePresence } from 'framer-motion';

interface TaskDetailSheetProps {
  task: Todo | null;
  onClose: () => void;
  onEdit: (task: Todo) => void;
}

export function TaskDetailSheet({ task, onClose, onEdit }: TaskDetailSheetProps) {
  const [newSubtask, setNewSubtask] = useState("");
  const { addSubtask, toggleSubtask, deleteSubtask, deleteTask } = useTodoStore();
  const isMobile = useIsMobile();

  if (!task) return null;

  const { label: statusLabel } = getStatusInfo(task.status);
  const { label: priorityLabel } = getPriorityInfo(task.priority);
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate));

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtask.trim()) {
      addSubtask(task.id, newSubtask.trim());
      setNewSubtask("");
    }
  };

  const handleDeleteTask = () => {
    deleteTask(task.id);
    onClose();
  };

  return (
    <Sheet open={!!task} onOpenChange={onClose}>
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        showCloseButton={false}
        className={cn("w-full p-0 flex flex-col", isMobile ? "h-auto max-h-[90vh] rounded-t-lg" : "sm:max-w-md")}
      >
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="pr-4">{task.title}</SheetTitle>
          <div className="flex items-center gap-2 pt-1">
            <Badge variant={task.status as any}>{statusLabel}</Badge>
            <Badge variant={task.priority as any}>{priorityLabel}</Badge>
          </div>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2"><FileText className="size-4" /> Description</h4>
            <p className="text-sm text-muted-foreground">{task.description || "No description provided."}</p>
          </div>
          <Separator />
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2"><Info className="size-4" /> Details</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Created: {format(new Date(task.createdAt), "MMMM d, yyyy")}</p>
              {task.dueDate && (
                <p className={cn(isOverdue && "text-destructive font-medium")}>
                  Due: {format(new Date(task.dueDate), "MMMM d, yyyy")}
                </p>
              )}
            </div>
          </div>
          <Separator />
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2"><ListChecks className="size-4" /> Subtasks</h4>
            {/* --- 2. WRAP THE LIST IN ANIMATEPRESENCE --- */}
            <AnimatePresence>
              {task.subtasks.map(subtask => (
                // --- 3. WRAP EACH ITEM IN A MOTION.DIV ---
                <motion.div
                  key={subtask.id}
                  layout // Ensures smooth re-ordering if that feature is added
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                  className="flex items-center gap-3 group"
                >
                  <Checkbox id={subtask.id} checked={subtask.isCompleted} onCheckedChange={() => toggleSubtask(task.id, subtask.id)} />
                  <label htmlFor={subtask.id} className={`flex-1 text-sm ${subtask.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                    {subtask.text}
                  </label>
                  <Button variant="ghost" size="icon" className="size-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteSubtask(task.id, subtask.id)} aria-label={`Delete subtask: ${subtask.text}`}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
            <form onSubmit={handleAddSubtask} className="flex items-center gap-2 pt-2">
              <Input placeholder="Add Sub Task" value={newSubtask} onChange={(e) => setNewSubtask(e.target.value)} />
              <Button type="submit" size="icon" variant="outline" aria-label="Add new subtask">
                <Plus className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
        
        <SheetFooter className="p-6 border-t mt-auto flex-row justify-end gap-2">
          <Button variant="outline" onClick={() => onEdit(task)}>
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="text-destructive"/> Are you sure?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the task "{task.title}".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteTask}>
                  Yes, delete task
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}