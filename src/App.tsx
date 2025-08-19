// src/App.tsx
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Import feature components (entry points)
import Settings from "@/features/Settings";
import Auth from "@/features/Auth";
import Dashboard from "@/features/Dashboard";
import FocusSheet from "@/features/FocusSheet";
import TodoList from "@/features/Todo";
import PomodoroTimer from "@/features/Timer";
import Progression from "@/features/Progression";

// Import shared components
import SideMenu from "@/shared/components/layout/SideMenu";

// Import Zustand stores
import { useAppStore } from "@/stores/appStore";
import { useAuthStore } from "@/stores/authStore";
import { useLogStore } from "@/stores/logStore";
// --- FIX: No longer importing useTodoStore here as it's not needed for loading state ---

// Import shared utilities
import { cn } from "@/shared/lib/utils";

function App() {
  // Subscribe to state and actions from our global stores
  const activePage = useAppStore((state) => state.activePage);
  const { user, isLoadingAuth, initAuthListener } = useAuthStore();
  const isLoadingLogs = useLogStore((state) => state.isLoadingLogs);
  // --- FIX: Removed isLoadingTodos as it's no longer in the store ---

  // On initial application load, set up the Firebase authentication listener.
  useEffect(() => {
    const unsubscribe = initAuthListener();
    return () => unsubscribe();
  }, [initAuthListener]);

  const renderContent = () => {
    // --- FIX: Simplified loading logic ---
    // The loading indicator now only depends on logs, as todos are loaded synchronously.
    // The todo-list page will never be blocked by log loading.
    const isAppLoading = isLoadingLogs && activePage !== 'todo-list';
    
    if (isAppLoading) {
      return <div className="text-center text-muted-foreground"><p>Loading data...</p></div>;
    }

    if (!user) return null;

    switch (activePage) {
      case "timer":         return <PomodoroTimer />;
      case "focus-sheet":   return <FocusSheet />;
      case "dashboard":     return <Dashboard />;
      case "todo-list":     return <TodoList />;
      case "progression":   return <Progression />;
      case "settings":      return <Settings />;
      default:              return <FocusSheet />;
    }
  };
  
  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <p className="text-foreground">Authenticating...</p>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="h-screen flex bg-background text-foreground">
      <SideMenu />
      <main className={cn(
        "flex-1 flex flex-col items-center overflow-y-auto min-h-screen", 
        "p-4 sm:p-6 lg:p-8", 
        "pt-28 md:pt-8", 
        "pb-12 sm:pb-16"
      )}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="w-full flex-1 flex flex-col"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;