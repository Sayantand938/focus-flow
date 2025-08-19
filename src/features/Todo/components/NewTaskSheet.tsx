import { z } from "zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/shared/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { DatePicker } from "@/shared/components/ui/datepicker";
import { Todo } from "@/shared/lib/types";
import { priorities, statuses } from "./icons";
import { useTodoStore } from "@/stores/todoStore";
import { useIsMobile } from "@/shared/hooks/useIsMobile";
import { cn } from "@/shared/lib/utils";

const taskFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long."),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["pending", "in-progress", "completed"]),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface NewTaskSheetProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Todo | null;
}

export function NewTaskSheet({ isOpen, onClose, task }: NewTaskSheetProps) {
  const { addTask, updateTask } = useTodoStore();
  const isEditing = Boolean(task);
  const isMobile = useIsMobile();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: undefined,
      priority: "medium",
      status: "pending",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (task) {
        form.reset({
          title: task.title,
          description: task.description || "",
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          priority: task.priority,
          status: task.status,
        });
      } else {
        form.reset({
          title: "",
          description: "",
          dueDate: undefined,
          priority: "medium",
          status: "pending",
        });
      }
    }
  }, [isOpen, task, form]);

  const onSubmit = (values: TaskFormValues) => {
    const taskData = {
      ...values,
      dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
    };

    if (isEditing && task) {
      updateTask({ id: task.id, ...taskData });
    } else {
      addTask(taskData);
    }
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side={'right'}
        showCloseButton={false}
        className={cn("w-full p-0 flex flex-col", isMobile ? "h-full pt-8" : "sm:max-w-md")}
      >
        <SheetHeader className="p-6 border-b">
          <SheetTitle>{isEditing ? "Edit To-Do" : "Add New To-Do"}</SheetTitle>
          <SheetDescription>
            {isEditing ? "Update the details of your task." : "Fill in the details to create a new task."}
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto p-6">
          <Form {...form}>
            {/* --- FIX 1: Attach the submit handler to the form itself --- */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl><Input placeholder="e.g., Finalize project report" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl><Textarea placeholder="Add more details (optional)" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <DatePicker date={field.value} setDate={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select a status" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statuses.map(s => (
                            <SelectItem key={s.value} value={s.value}>
                              <div className="flex items-center gap-2"><s.icon className="size-4 text-muted-foreground" /> {s.label}</div>
                            </SelectItem>
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
                          <SelectTrigger><SelectValue placeholder="Select a priority" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {priorities.map(p => (
                            <SelectItem key={p.value} value={p.value}>
                              <div className="flex items-center gap-2"><p.icon className="size-4 text-muted-foreground" /> {p.label}</div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* --- FIX 2: Move the buttons inside the form so "Enter" can trigger them --- */}
              <SheetFooter className="p-0 pt-6 mt-auto flex flex-row gap-4">
                {/* The onClick is removed; type="submit" is enough to trigger the form's onSubmit */}
                <Button type="submit" className="w-3/4">
                  {isEditing ? "Save Changes" : "Create Task"}
                </Button>
                <Button type="button" variant="outline" onClick={onClose} className="w-1/4">
                  Cancel
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </div>
        
        {/* The SheetFooter is no longer needed here as the buttons are now inside the form */}
      </SheetContent>
    </Sheet>
  );
}