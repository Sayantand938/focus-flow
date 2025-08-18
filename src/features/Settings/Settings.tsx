// D:/Coding/tauri-projects/focus-flow/src/features/Settings/Settings.tsx
import { useState } from "react";
import { save, open } from "@tauri-apps/plugin-dialog";
import { writeTextFile, readTextFile } from "@tauri-apps/plugin-fs";
import { motion, Variants } from "framer-motion";
import { Todo, DailyLog } from "@/utils/types";
import { AppearanceSettings } from "./components/AppearanceSettings";
import { DataManagementSettings } from "./components/DataManagementSettings";
import { DangerZone } from "./components/DangerZone";

type SettingsProps = {
  onResetData: () => Promise<void>;
  onImportData: (data: { dailyLogs: Record<string, number[]>, todos: Todo[] }) => Promise<void>;
  dailyLogs: DailyLog[];
  todos: Todo[];
};

type ImportData = {
  dailyLogs: Record<string, number[]>;
  todos: Todo[];
};

function Settings({ onResetData, onImportData, dailyLogs, todos }: SettingsProps) {
  const [isResetting, setIsResetting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isOpeningFile, setIsOpeningFile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  
  const [pendingImportData, setPendingImportData] = useState<ImportData | null>(null);

  const handleResetConfirm = async () => {
    setIsResetting(true);
    try {
      await onResetData();
      setIsResetDialogOpen(false);
    } catch (error) {
      console.error("❌ Reset failed in Settings component:", error);
    } finally {
      setIsResetting(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const filePath = await save({
        filters: [{ name: "JSON", extensions: ["json"] }],
        defaultPath: `focus-flow-export-${new Date().toISOString().split('T')[0]}.json`,
      });

      if (!filePath) return;

      const dailyLogsForExport: Record<string, number[]> = {};
      for (const log of dailyLogs) {
        dailyLogsForExport[log.id] = [...log.completedSlots].sort((a, b) => a - b);
      }
      
      const dataToExport = {
        dailyLogs: dailyLogsForExport,
        todos,
        exportedAt: new Date().toISOString(),
      };

      await writeTextFile(filePath, JSON.stringify(dataToExport, null, 2));
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

      const content = await readTextFile(selectedPath);
      const data = JSON.parse(content);

      if (!data.dailyLogs || !data.todos || typeof data.dailyLogs !== 'object' || !Array.isArray(data.todos)) {
        throw new Error("Invalid import file format.");
      }
      
      setPendingImportData(data);
      setIsImportDialogOpen(true);

    } catch (error) {
      console.error("❌ Failed to read or parse import file:", error);
    } finally {
      setIsOpeningFile(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!pendingImportData) return;
    setIsUploading(true);
    try {
      await onImportData(pendingImportData);
    } catch (error) {
      console.error("❌ Import failed during upload:", error);
    } finally {
      setIsUploading(false);
      setIsImportDialogOpen(false);
      setPendingImportData(null);
    }
  };

  const handleImportDialogChange = (open: boolean) => {
    setIsImportDialogOpen(open);
    if (!open) {
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
          onImportDialogOpenChange={handleImportDialogChange}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <DangerZone 
          isResetting={isResetting}
          onReset={handleResetConfirm}
          isResetDialogOpen={isResetDialogOpen}
          onResetDialogOpenChange={setIsResetDialogOpen}
        />
      </motion.div>
    </motion.div>
  );
}

export default Settings;