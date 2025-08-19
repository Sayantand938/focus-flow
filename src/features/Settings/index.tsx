// src/features/Settings/index.tsx
import { useState } from "react";
import { save, open } from "@tauri-apps/plugin-dialog";
import { writeTextFile, readTextFile } from "@tauri-apps/plugin-fs";
import { motion, Variants } from "framer-motion";
import { Todo } from "@/shared/lib/types";
import { AppearanceSettings } from "./components/AppearanceSettings";
import { DataManagementSettings } from "./components/DataManagementSettings";
import { DangerZone } from "./components/DangerZone";
import { useLogStore } from "@/stores/logStore";
import { useTodoStore } from "@/stores/todoStore";
import { useAuthStore } from "@/stores/authStore";
import { db } from "@/shared/services/firebase";
import { collection, getDocs, writeBatch } from "firebase/firestore";
import { toast } from "sonner"; // <-- UPDATED IMPORT

type ImportData = {
  dailyLogs: Record<string, {
    slots: Record<number, string>;
    totalSlots?: number;
  }>;
  todos: Todo[];
};

function Settings() {
  const { dailyLogs, importLogs } = useLogStore();
  const { todos, importTodos } = useTodoStore();
  const user = useAuthStore((state) => state.user);
  
  const [isResetting, setIsResetting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isOpeningFile, setIsOpeningFile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  
  const [pendingImportData, setPendingImportData] = useState<ImportData | null>(null);
  
  const handleResetData = async () => {
    if (!user) return;
    
    setIsResetting(true);
    const promise = (async () => {
        const batch = writeBatch(db);
        
        const logsRef = collection(db, "users", user.uid, "dailyLogs");
        const logsSnap = await getDocs(logsRef);
        logsSnap.docs.forEach(doc => batch.delete(doc.ref));

        const todosRef = collection(db, "users", user.uid, "todos");
        const todosSnap = await getDocs(todosRef);
        todosSnap.docs.forEach(doc => batch.delete(doc.ref));

        await batch.commit();
    })();

    toast.promise(promise, {
        loading: 'Resetting all data...',
        success: 'All data successfully reset.',
        error: 'Failed to reset data.',
    });

    try {
        await promise;
        useLogStore.getState().resetLogs();
        useTodoStore.getState().resetTodos();
        setIsResetDialogOpen(false);
    } catch (error) {
        console.error("Error resetting data:", error);
    } finally {
        setIsResetting(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    const promise = (async () => {
        const filePath = await save({
            filters: [{ name: "JSON", extensions: ["json"] }],
            defaultPath: `focus-flow-export-${new Date().toISOString().split('T')[0]}.json`,
        });

        if (!filePath) throw new Error("Export cancelled by user.");

        const dailyLogsForExport: ImportData['dailyLogs'] = {};
        dailyLogs.forEach(log => {
            dailyLogsForExport[log.id] = { 
              slots: log.slots || {},
              totalSlots: log.totalSlots || Object.keys(log.slots || {}).length,
            };
        });
        
        const dataToExport = {
            dailyLogs: dailyLogsForExport,
            todos,
            exportedAt: new Date().toISOString(),
        };

        await writeTextFile(filePath, JSON.stringify(dataToExport, null, 2));
    })();

    toast.promise(promise, {
        loading: 'Exporting data...',
        success: 'Data exported successfully!',
        error: (err) => err.message || 'Export failed.',
    });

    try {
        await promise;
    } catch (error) {
        console.error("❌ Export failed:", error);
    } finally {
        setIsExporting(false);
    }
  };

  const handleInitiateImport = async () => {
    setIsOpeningFile(true);
    try {
      const selectedPath = await open({
        multiple: false,
        filters: [{ name: "JSON", extensions: ["json"] }],
      });

      if (!selectedPath) return;

      const content = await readTextFile(selectedPath as string);
      const data = JSON.parse(content) as ImportData;

      if (!data.dailyLogs || !data.todos || typeof data.dailyLogs !== 'object' || !Array.isArray(data.todos)) {
        toast.error("Invalid import file format.");
        throw new Error("Invalid import file format.");
      }
      
      setPendingImportData(data);
      setIsImportDialogOpen(true);

    } catch (error) {
      console.error("❌ Failed to read or parse import file:", error);
      toast.error(error instanceof Error ? error.message : "Failed to read file.");
    } finally {
      setIsOpeningFile(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!pendingImportData || !user) return;
    setIsUploading(true);
    
    const promise = Promise.all([
        importLogs(pendingImportData),
        importTodos(pendingImportData.todos),
    ]);
    
    toast.promise(promise, {
        loading: 'Importing data...',
        success: 'Data imported and replaced successfully.',
        error: 'An error occurred during import.',
    });

    try {
      await promise;
    } catch (error) {
      console.error("❌ Import failed during upload:", error);
    } finally {
      setIsUploading(false);
      setIsImportDialogOpen(false);
      setPendingImportData(null);
    }
  };
  
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };
  
  return (
    <motion.div
      className="w-full max-w-3xl mx-auto space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.header variants={itemVariants}>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application settings.
        </p>
      </motion.header>

      <motion.div variants={itemVariants}>
        <AppearanceSettings />
      </motion.div>

      <motion.div variants={itemVariants}>
        <DataManagementSettings 
          isExporting={isExporting}
          isOpeningFile={isOpeningFile}
          isUploading={isUploading}
          onExport={handleExport}
          onInitiateImport={handleInitiateImport}
          onConfirmImport={handleConfirmImport}
          isImportDialogOpen={isImportDialogOpen}
          onImportDialogOpenChange={(open) => {
            setIsImportDialogOpen(open);
            if (!open) setPendingImportData(null);
          }}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <DangerZone 
          isResetting={isResetting}
          onReset={handleResetData}
          isResetDialogOpen={isResetDialogOpen}
          onResetDialogOpenChange={setIsResetDialogOpen}
        />
      </motion.div>
    </motion.div>
  );
}

export default Settings;