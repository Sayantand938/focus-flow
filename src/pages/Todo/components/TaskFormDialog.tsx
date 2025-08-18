// src/components/TodoList/TaskFormDialog.tsx
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { priorities, statuses } from "./columns";
import { useEffect } from "react";
import { Todo } from "@/utils/types";

const taskFormSchema = z.object({
  description: z.string().min(3, "Description must be at least 3 characters."),
  tag: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["todo", "in-progress", "done"]),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => void;
  task?: Todo | null;
}

export function TaskFormDialog({
  isOpen,
  onClose,
  onSubmit,
  task,
}: TaskFormDialogProps) {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      description: task?.description || "",
      tag: task?.tag || "",
      priority: task?.priority || "medium",
      status: task?.status || "todo",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (task) {
        // Editing existing task
        form.reset({
          description: task.description,
          tag: task.tag || "",
          priority: task.priority,
          status: task.status,
        });
      } else {
        // Adding new task
        form.reset({
          description: "",
          tag: "",
          priority: "medium",
          status: "todo",
        });
      }
    }
  }, [isOpen, task, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Add New Task"}</DialogTitle>
          <DialogDescription>
            {task
              ? "Edit the details of your task. Click save when you're done."
              : "Fill in the details to create a new task. Click create when you're done."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter task description" {...field} autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tag"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tag (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter tag (optional)" {...field} autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a status" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {statuses.map(s => (
                                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {priorities.map(p => (
                        <SelectItem key={p.value} value={p.value}>
                          <div className="flex items-center gap-2">
                            <p.icon className="h-4 w-4 text-muted-foreground" />
                            {p.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
               <DialogClose asChild>
                <Button type="button" variant="ghost">Cancel</Button>
               </DialogClose>
               <Button type="submit">{task ? "Save Changes" : "Create Task"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}