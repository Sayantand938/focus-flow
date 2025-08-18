// src\pages\Todo\components\TaskFormDialog.tsx
import { z } from "zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, Tag as TagIcon, Text as TextIcon } from "lucide-react";

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
import { Separator } from "@/components/ui/separator";

import { priorities, statuses } from "./Columns";
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
        form.reset({
          description: task.description,
          tag: task.tag || "",
          priority: task.priority,
          status: task.status,
        });
      } else {
        form.reset({
          description: "",
          tag: "",
          priority: "medium",
          status: "todo",
        });
      }
    }
  }, [isOpen, task, form]);

  const isEditing = Boolean(task);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden">
        {/* Header without badges */}
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-md p-2 bg-muted">
                <ClipboardList className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">
                  {isEditing ? "Edit task" : "Create task"}
                </DialogTitle>
                <DialogDescription>
                  {isEditing
                    ? "Update the task details below."
                    : "Enter details to create a new task."}
                </DialogDescription>
              </div>
            </div>
            {/* The Badge section has been removed */}
          </div>
        </DialogHeader>

        {/* Animated body */}
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              key={isEditing ? "edit" : "create"}
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className="px-6 py-5"
            >
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Essentials */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <TextIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                className="pl-9"
                                placeholder="What needs to be done?"
                                {...field}
                                autoComplete="off"
                              />
                            </div>
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
                          <FormLabel>Tag</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <TagIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                className="pl-9"
                                placeholder="Optional tag (e.g., Work)"
                                {...field}
                                autoComplete="off"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  {/* Unified STATUS + PRIORITY button style */}
                  <div className="space-y-6">
                    {/* STATUS */}
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          {/* Updated flexbox to prevent wrapping */}
                          <div className="flex gap-2">
                            {statuses.map((s) => (
                              <Button
                                key={s.value}
                                type="button"
                                variant={
                                  field.value === s.value ? "default" : "outline"
                                }
                                className="flex-1 flex items-center gap-2"
                                onClick={() => field.onChange(s.value)}
                              >
                                {s.icon && <s.icon className="h-4 w-4" />}
                                {s.label}
                              </Button>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* PRIORITY */}
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <div className="flex gap-2 flex-wrap">
                            {priorities.map((p) => {
                              const isSelected = field.value === p.value;
                              return (
                                <Button
                                  key={p.value}
                                  type="button"
                                  variant={
                                    isSelected ? "default" : "outline"
                                  }
                                  className="flex-1 sm:flex-none flex items-center gap-2"
                                  onClick={() => field.onChange(p.value)}
                                >
                                  <p.icon
                                    className={`h-4 w-4 ${
                                      isSelected
                                        ? "text-primary-foreground"
                                        : "text-muted-foreground"
                                    }`}
                                  />
                                  {p.label}
                                </Button>
                              );
                            })}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Footer */}
                  <DialogFooter className="border-t pt-4">
                    <DialogClose asChild>
                      <Button type="button" variant="ghost">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button type="submit">
                      {isEditing ? "Save changes" : "Create task"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}