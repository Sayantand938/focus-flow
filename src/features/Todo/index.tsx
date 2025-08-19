// src/features/Todo/index.tsx
import { useState, useMemo } from "react";
import { Todo } from "@/shared/lib/types";
import { getColumns } from "./components/Columns";
import { DataTable } from "./components/DataTable";
import { TaskFormDialog } from "./components/TaskFormDialog";
import { useIsMobile } from "@/shared/hooks/useIsMobile";
import { Card, CardContent } from "@/shared/components/ui/card";
import { motion, Variants } from "framer-motion";
import { useTodoStore } from "@/stores/todoStore";

function TodoList() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Todo | null>(null);
  const isMobile = useIsMobile();

  const {
    todos, addTask, updateTask, deleteTask, setTaskStatus,
    deleteSelectedTasks, markSelectedTasksDone
  } = useTodoStore();

  const handleOpenEdit = (task: Todo) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };
  
  const handleOpenAdd = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  }

  const handleTaskSubmit = (values: Omit<Todo, 'id' | 'createdAt'>) => {
    if (editingTask) {
      updateTask({ ...editingTask, ...values });
    } else {
      addTask(values);
    }
    setIsFormOpen(false);
    setEditingTask(null);
  };
  
  const columns = useMemo(() => getColumns(isMobile, {
    onEdit: handleOpenEdit,
    onDelete: deleteTask,
    onSetStatus: setTaskStatus,
  }), [isMobile, todos, deleteTask, setTaskStatus]);

  const containerVariants: Variants = { /* ... */ };
  const itemVariants: Variants = { /* ... */ };

  return (
    <motion.div
      className="w-full max-w-7xl mx-auto space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.header variants={itemVariants}>
        <h1 className="text-3xl font-bold">Todo List</h1>
        <p className="text-muted-foreground">
          A robust task management board. Here's a look at your current tasks.
        </p>
      </motion.header>
      
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="pt-6">
            <DataTable
              columns={columns}
              data={todos}
              onAddTask={handleOpenAdd}
              onDeleteSelected={deleteSelectedTasks}
              onMarkSelectedDone={markSelectedTasksDone}
              isMobile={isMobile}
            />
          </CardContent>
        </Card>
      </motion.div>

      <TaskFormDialog
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleTaskSubmit}
        task={editingTask}
      />
    </motion.div>
  );
}

export default TodoList;