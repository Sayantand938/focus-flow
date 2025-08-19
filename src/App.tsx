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

// --- 1. IMPORT THE NEW SKELETON COMPONENT ---
import { ShiftCardSkeleton } from "@/features/FocusSheet/components/ShiftCardSkeleton";

// Import shared components
import SideMenu from "@/shared/components/layout/SideMenu";

// Import Zustand stores
import { useAppStore } from "@/stores/appStore";
import { useAuthStore } from "@/stores/authStore";
import { useLogStore } from "@/stores/logStore";
import { useTodoStore } from "@/stores/todoStore";

// Import shared utilities
import { cn } from "@/shared/lib/utils";

// --- 2. CREATE A DEDICATED SKELETON UI COMPONENT ---
const AppSkeleton = ({ page }: { page: string }) => {
  // We can expand this to show skeletons for other pages too
  if (page === 'focus-sheet') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mt-16">
        <ShiftCardSkeleton />
        <ShiftCardSkeleton />
        <ShiftCardSkeleton />
        <ShiftCardSkeleton />
      </div>
    );
  }

  // Fallback for other pages while loading
  return (
    <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
      <p>Loading data...</p>
    </div>
  );
};


function App() {
  const activePage = useAppStore((state) => state.activePage);
  const { user, isLoadingAuth, initAuthListener } = useAuthStore();
  const isLoadingLogs = useLogStore((state) => state.isLoadingLogs);
  const isLoadingTodos = useTodoStore((state) => state.isLoadingTodos);

  useEffect(() => {
    const unsubscribe = initAuthListener();
    return () => unsubscribe();
  }, [initAuthListener]);

  // --- 3. UPDATE RENDERCONTENT LOGIC ---
  const renderContent = () => {
    const isAppLoading = isLoadingLogs || isLoadingTodos;
    
    // Show skeleton UI if the app is loading data for the first time.
    // The TodoList handles its own internal loading state, so we exclude it here.
    if (isAppLoading && activePage !== 'todo-list') {
      return <AppSkeleton page={activePage} />;
    }

    if (!user) return null;

    switch (activePage) {
      case "timer":         return <PomodoroTimer />;
      case "focus-sheet":   return <FocusSheet />;
      case "dashboard":     return <Dashboard />;
      case "todo-list":     return <TodoList />;
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