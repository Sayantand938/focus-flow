import {
  Card,
  CardContent,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
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
} from "@/shared/components/ui/alert-dialog";

interface DangerZoneProps {
    isResetting: boolean;
    onReset: () => void;
    isResetDialogOpen: boolean;
    onResetDialogOpenChange: (open: boolean) => void;
}

export function DangerZone({
    isResetting,
    onReset,
    isResetDialogOpen,
    onResetDialogOpenChange
}: DangerZoneProps) {
    return (
        <section className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Danger Zone
            </h2>
            <Card>
                <CardContent>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex-grow">
                            <h3 className="font-medium">Reset All Data</h3>
                            <p className="text-sm text-muted-foreground">
                                Permanently delete all your data. This action cannot be undone.
                            </p>
                        </div>
                        <AlertDialog open={isResetDialogOpen} onOpenChange={onResetDialogOpenChange}>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="w-full sm:w-auto">
                                    Reset All Data
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete all of your
                                        data from the server.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel disabled={isResetting}>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={onReset} disabled={isResetting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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
    );
}