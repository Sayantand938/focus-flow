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

type Theme = "dark" | "light" | "system";

type SettingsProps = {
  onResetData: () => Promise<void>;
};

function Settings({ onResetData }: SettingsProps) {
  const { theme, setTheme } = useTheme();
  const [isResetting, setIsResetting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleResetConfirm = async () => {
    console.log('🔄 Reset button clicked in Settings');
    setIsResetting(true);
    
    try {
      await onResetData();
      console.log('✅ Reset completed successfully');
      
      // Close the dialog after successful reset
      setIsDialogOpen(false);
    } catch (error) {
      console.error('❌ Reset failed in Settings component:', error);
      // Keep dialog open on error so user can see what happened
    } finally {
      setIsResetting(false);
    }
  };

  // UI for import/export functions (not functional)
  const handleExport = () => {
    console.log('📤 Export button clicked. UI is ready, now implement functionality!');
  };

  const handleImport = () => {
    console.log('📥 Import button clicked. UI is ready, now implement functionality!');
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
          <AlertTriangle className="w-5 h-5 text-destructive" />
          Data Management
        </h2>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-grow">
                <h3 className="font-medium">Reset All Data</h3>
                <p className="text-sm text-muted-foreground">
                  Permanently delete all of your tracked sessions and statistics from the server.
                </p>
              </div>
              
              <div className="flex gap-2 flex-col sm:flex-row w-full sm:w-auto">
                <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      className="w-full sm:w-auto"
                      disabled={isResetting}
                    >
                      {isResetting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Resetting...
                        </>
                      ) : (
                        'Reset Data'
                      )}
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
                        {isResetting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Resetting...
                          </>
                        ) : (
                          'Yes, delete everything'
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* --- Import & Export Section --- */}
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
                    Download a copy of your data to your device for backup.
                  </p>
                </div>
                <Button 
                  onClick={handleExport}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Data
                </Button>
              </div>

              {/* Import Button and Description */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-grow">
                  <h3 className="font-medium">Import Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload a previously exported file to restore your data.
                  </p>
                </div>
                <Button 
                  onClick={handleImport}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Import Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export default Settings;
