// src/features/Todo/index.tsx
import { useState, useMemo, useEffect } from "react";
import { Plus, Inbox } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useTodoStore } from "@/stores/todoStore";
import { Todo } from "@/shared/lib/types";
import { Button } from "@/shared/components/ui/button";
import { TodoHeader } from "./components/TodoHeader";
import { TaskCard } from "./components/TaskCard";
import { TaskDetailSheet } from "./components/TaskDetailSheet";
import { NewTaskSheet } from "./components/NewTaskSheet";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 16, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 120, damping: 18 },
  },
};

function TodoList() {
  // Get everything directly from the store
  const { todos, toggleStar, isLoadingTodos } = useTodoStore();
  
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTask, setSelectedTask] = useState<Todo | null>(null);
  const [isNewTaskSheetOpen, setIsNewTaskSheetOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Todo | null>(null);

  useEffect(() => {
    if (selectedTask) {
      const updatedTask = todos.find(task => task.id === selectedTask.id);
      setSelectedTask(updatedTask || null);
    }
  }, [todos, selectedTask]);

  const filteredTodos = useMemo(() => {
    return todos
      .filter(task => {
        if (activeFilter === "all") return true;
        return task.status === activeFilter;
      })
      .filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [todos, activeFilter, searchTerm]);

  const handleEditTask = (task: Todo) => {
    setSelectedTask(null);
    setEditingTask(task);
    setIsNewTaskSheetOpen(true);
  };

  const handleOpenNewTask = () => {
    setEditingTask(null);
    setIsNewTaskSheetOpen(true);
  };

  if (isLoadingTodos) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
            <p className="text-lg font-medium">Loading your tasks...</p>
        </div>
    );
  }

  return (
    <motion.div
      className="w-full h-full flex flex-col relative"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.header className="space-y-1 mb-6" variants={itemVariants}>
        <h1 className="text-3xl font-bold">Todo List</h1>
        <p className="text-muted-foreground">Manage and track your tasks.</p>
      </motion.header>

      <motion.div variants={itemVariants}>
        <TodoHeader
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      </motion.div>

      <div className="flex-1 overflow-y-auto py-6 pr-1 -mr-1">
        {filteredTodos.length > 0 ? (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredTodos.map(task => (
                <motion.div
                  key={task.id}
                  layout="position"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10, transition: { duration: 0.25, ease: "easeInOut" } }}
                  transition={{ type: "spring", stiffness: 140, damping: 20 }}
                >
                  <TaskCard task={task} onSelect={setSelectedTask} onToggleStar={toggleStar} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center text-muted-foreground"
          >
            <Inbox className="size-12 mb-4" />
            <h3 className="text-lg font-semibold">All Clear!</h3>
            <p>No tasks match your current filter.</p>
          </motion.div>
        )}
      </div>

      <TaskDetailSheet task={selectedTask} onClose={() => setSelectedTask(null)} onEdit={handleEditTask} />

      <NewTaskSheet
        isOpen={isNewTaskSheetOpen}
        onClose={() => { setIsNewTaskSheetOpen(false); setEditingTask(null); }}
        task={editingTask}
      />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.3 }}
        className="absolute bottom-8 right-8"
      >
        <Button
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl focus:shadow-xl transition-shadow"
          onClick={handleOpenNewTask}
          aria-label="Add new task"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </motion.div>
    </motion.div>
  );
}

export default TodoList;