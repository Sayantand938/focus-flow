// src/components/TodoList.tsx
import { useState, useMemo } from "react";
import { Todo, TodoStatus } from "@/utils/types";
import { getColumns, priorities, statuses } from "./components/columns";
import { DataTable } from "./components/DataTable";
import { TaskFormDialog } from "./components/TaskFormDialog";
import { useIsMobile } from "@/hooks/useIsMobile";
import { Card, CardContent } from "@/components/ui/card";

// Create static sample data for UI demonstration
const sampleTodos: Todo[] = [
  {
    id: "TASK-8782",
    description: "Implement user authentication flow with multi-factor support.",
    tag: "Backend",
    createdAt: "2025-07-15T10:00:00Z",
    priority: "high",
    status: "in-progress",
  },
  {
    id: "TASK-7878",
    description: "Design the new dashboard UI in Figma.",
    tag: "Design",
    createdAt: "2025-07-14T14:30:00Z",
    priority: "high",
    status: "todo",
  },
  {
    id: "TASK-4532",
    description: "Set up the CI/CD pipeline using GitHub Actions.",
    tag: "DevOps",
    createdAt: "2025-07-12T09:00:00Z",
    priority: "medium",
    status: "done",
  },
  {
    id: "TASK-2345",
    description: "Write API documentation for the new '/users' endpoint.",
    tag: "Backend",
    createdAt: "2025-07-16T11:00:00Z",
    priority: "medium",
    status: "in-progress",
  },
  {
    id: "TASK-9876",
    description: "Fix visual bug in the reporting module on mobile.",
    tag: "Frontend",
    createdAt: "2025-07-17T16:00:00Z",
    priority: "low",
    status: "todo",
  },
  {
    id: "TASK-5432",
    description: "Refactor the old settings page component to use React Hooks.",
    tag: "Frontend",
    createdAt: "2025-07-18T08:00:00Z",
    priority: "low",
    status: "todo",
  },
];


function TodoList() {
  const [todos] = useState<Todo[]>(sampleTodos);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const isMobile = useIsMobile();

  // Dummy handlers for UI demonstration. They log to the console instead of changing state.
  const handleOpenEdit = (task: Todo) => {
    console.log("UI: Edit task", task);
    setIsFormOpen(true);
  };
  
  const handleOpenAdd = () => {
    console.log("UI: Add new task");
    setIsFormOpen(true);
  }

  const handleDelete = (id: string) => {
    console.log("UI: Delete task", id);
  };
  
  const handleDeleteSelected = (ids: string[]) => {
    console.log("UI: Delete selected tasks", ids);
  }

  const handleSetStatus = (id: string, status: TodoStatus) => {
    console.log("UI: Set status", { id, status });
  };

  const handleMarkSelectedDone = (ids: string[]) => {
    console.log("UI: Mark selected as done", ids);
  }

  const handleTaskSubmit = () => {
    // In the UI-only version, this just closes the dialog.
    setIsFormOpen(false);
  };
  
  const columns = useMemo(() => getColumns(isMobile, {
    onEdit: handleOpenEdit,
    onDelete: handleDelete,
    onSetStatus: handleSetStatus,
  }), [isMobile]);

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
            onDeleteSelected={handleDeleteSelected}
            onMarkSelectedDone={handleMarkSelectedDone}
          />
        </CardContent>
      </Card>

      <TaskFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleTaskSubmit}
      />
    </div>
  );
}

export default TodoList;