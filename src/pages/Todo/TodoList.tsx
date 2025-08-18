// src/components/TodoList.tsx
import { useState, useMemo } from "react";
import { Todo, TodoStatus } from "@/utils/types";
import { getColumns } from "./components/columns";
import { DataTable } from "./components/DataTable";
import { TaskFormDialog } from "./components/TaskFormDialog";
import { useIsMobile } from "@/hooks/useIsMobile";
import { Card, CardContent } from "@/components/ui/card";

interface TodoListProps {
  todos: Todo[];
  onAddTask: (values: Omit<Todo, 'id' | 'createdAt'>) => void;
  onUpdateTask: (task: Todo) => void;
  onDelete: (id: string) => void;
  onDeleteSelected: (ids: string[]) => void;
  onSetStatus: (id: string, status: TodoStatus) => void;
  onMarkSelectedDone: (ids: string[]) => void;
}

function TodoList({
  todos,
  onAddTask,
  onUpdateTask,
  onDelete,
  onDeleteSelected,
  onSetStatus,
  onMarkSelectedDone,
}: TodoListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Todo | null>(null);
  const isMobile = useIsMobile();

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
      onUpdateTask({ ...editingTask, ...values });
    } else {
      onAddTask(values);
    }
    setIsFormOpen(false);
    setEditingTask(null);
  };
  
  const columns = useMemo(() => getColumns(isMobile, {
    onEdit: handleOpenEdit,
    onDelete: onDelete,
    onSetStatus: onSetStatus,
  }), [isMobile, todos, onDelete, onSetStatus]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Todo List</h1>
        <p className="text-muted-foreground">
          A robust task management board. Here's a look at your current tasks.
        </p>
      </header>
      
      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={todos}
            onAddTask={handleOpenAdd}
            onDeleteSelected={onDeleteSelected}
            onMarkSelectedDone={onMarkSelectedDone}
          />
        </CardContent>
      </Card>

      <TaskFormDialog
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleTaskSubmit}
        task={editingTask}
      />
    </div>
  );
}

export default TodoList;