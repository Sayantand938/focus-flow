import {
  Card,
  CardContent,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Loader2, Upload, Download } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";

interface DataManagementSettingsProps {
    isExporting: boolean;
    isOpeningFile: boolean;
    isUploading: boolean;
    onExport: () => void;
    onInitiateImport: () => void;
    onConfirmImport: () => void;
    isImportDialogOpen: boolean;
    onImportDialogOpenChange: (open: boolean) => void;
}

export function DataManagementSettings({
    isExporting,
    isOpeningFile,
    isUploading,
    onExport,
    onInitiateImport,
    onConfirmImport,
    isImportDialogOpen,
    onImportDialogOpenChange,
}: DataManagementSettingsProps) {
    return (
        <section className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-3">
                <Upload className="w-5 h-5" />
                Import & Export
            </h2>
            <Card>
                <CardContent>
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex-grow">
                                <h3 className="font-medium">Export Data</h3>
                                <p className="text-sm text-muted-foreground">
                                    Download a copy of all your data for backup.
                                </p>
                            </div>
                            <Button onClick={onExport} variant="outline" className="w-full sm:w-auto" disabled={isExporting}>
                                {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                                {isExporting ? "Exporting..." : "Export Data"}
                            </Button>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex-grow">
                                <h3 className="font-medium">Import Data</h3>
                                <p className="text-sm text-muted-foreground">
                                    Restore data from a backup file. This will replace all current data.
                                </p>
                            </div>
                            {/* This button now only opens the file dialog */}
                            <Button onClick={onInitiateImport} variant="outline" className="w-full sm:w-auto" disabled={isOpeningFile}>
                                {isOpeningFile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                {isOpeningFile ? "Opening..." : "Import Data"}
                            </Button>

                            {/* The AlertDialog is now controlled entirely by state, with no trigger */}
                            <AlertDialog open={isImportDialogOpen} onOpenChange={onImportDialogOpenChange}>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action will overwrite all current data in the cloud with the contents of the selected file. This cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel disabled={isUploading}>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={onConfirmImport} disabled={isUploading}>
                                            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            {isUploading ? "Importing..." : "Yes, overwrite and import"}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}