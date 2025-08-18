import { useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "../../context/ThemeProvider";
import { Palette, AlertTriangle, Loader2, Upload, Download } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { save, open } from "@tauri-apps/plugin-dialog";
import { writeTextFile, readTextFile } from "@tauri-apps/plugin-fs";
import { Session, Todo } from "@/utils/types";

type Theme = "dark" | "light" | "system";

type SettingsProps = {
  onResetData: () => Promise<void>;
  onImportData: (data: { sessions: Session[]; todos: Todo[] }) => Promise<void>;
  sessions: Session[];
  todos: Todo[];
};

function Settings({ onResetData, onImportData, sessions, todos }: SettingsProps) {
  const { theme, setTheme } = useTheme();
  const [isResetting, setIsResetting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleResetConfirm = async () => {
    setIsResetting(true);
    try {
      await onResetData();
      setIsDialogOpen(false); // Close dialog on success
    } catch (error) {
      console.error("❌ Reset failed in Settings component:", error);
      // Optionally show an error message to the user
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

      if (!filePath) {
        console.log("Export cancelled by user.");
        return;
      }

      const dataToExport = {
        sessions,
        todos,
        exportedAt: new Date().toISOString(),
      };

      await writeTextFile(filePath, JSON.stringify(dataToExport, null, 2));
      console.log("📤 Data exported successfully to", filePath);
      // You could add a success notification here
    } catch (error) {
      console.error("❌ Export failed:", error);
      // You could add an error notification here
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    setIsImporting(true);
    try {
      const selectedPath = await open({
        multiple: false,
        filters: [{ name: "JSON", extensions: ["json"] }],
      });

      if (!selectedPath) {
        console.log("Import cancelled by user.");
        return;
      }

      const content = await readTextFile(selectedPath); // Corrected line
      const data = JSON.parse(content);

      if (!data.sessions || !data.todos || !Array.isArray(data.sessions) || !Array.isArray(data.todos)) {
        throw new Error("Invalid import file format. Missing 'sessions' or 'todos' array.");
      }

      // Important: Convert session startTime from string back to Date object
      const parsedSessions = data.sessions.map((s: any) => ({
        ...s,
        startTime: new Date(s.startTime),
      }));
      
      await onImportData({ sessions: parsedSessions, todos: data.todos });
      console.log("📥 Data imported successfully!");
      // You could add a success notification here
    } catch (error) {
      console.error("❌ Import failed:", error);
      // You could add an error notification here
    } finally {
      setIsImporting(false);
    }
  };


  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application settings.
        </p>
      </header>

      {/* --- Appearance Section --- */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-3">
          <Palette className="w-5 h-5 text-primary" />
          Appearance
        </h2>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-grow">
                <Label htmlFor="theme-select">Theme</Label>
                <p className="text-sm text-muted-foreground">
                  Select how the application should look.
                </p>
              </div>
              <Select
                value={theme}
                onValueChange={(value) => setTheme(value as Theme)}
              >
                <SelectTrigger
                  id="theme-select"
                  className="w-full sm:w-[180px]"
                >
                  <SelectValue placeholder="Select a theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* --- Data Management Section --- */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-3">
          <Upload className="w-5 h-5" />
          Import & Export
        </h2>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-6">
              {/* Export Button and Description */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-grow">
                  <h3 className="font-medium">Export Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Download a copy of all your data for backup.
                  </p>
                </div>
                <Button
                  onClick={handleExport}
                  variant="outline"
                  className="w-full sm:w-auto"
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  {isExporting ? "Exporting..." : "Export Data"}
                </Button>
              </div>

              {/* Import Button and Description */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-grow">
                  <h3 className="font-medium">Import Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Restore data from a backup file. This will replace all current data.
                  </p>
                </div>
                <Button
                  onClick={handleImport}
                  variant="outline"
                  className="w-full sm:w-auto"
                  disabled={isImporting}
                >
                  {isImporting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  {isImporting ? "Importing..." : "Import Data"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* --- Danger Zone Section --- */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          Danger Zone
        </h2>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-grow">
                <h3 className="font-medium">Reset All Data</h3>
                <p className="text-sm text-muted-foreground">
                  Permanently delete all your data. This action cannot be undone.
                </p>
              </div>
              <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="w-full sm:w-auto"
                    disabled={isResetting}
                  >
                    {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isResetting ? "Resetting..." : "Reset All Data"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete all of your
                      data from the server including all tracked sessions and statistics.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isResetting}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleResetConfirm}
                      disabled={isResetting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isResetting ? "Deleting..." : "Yes, delete everything"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export default Settings;