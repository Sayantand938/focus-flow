// src\pages\Todo\components\DataTableRowActions.tsx
import { Row } from "@tanstack/react-table";
import { MoreHorizontal, Trash2, Edit, CheckCircle2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
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
import { Todo, TodoStatus } from "@/shared/lib/types";

interface DataTableRowActionsProps {
  row: Row<Todo>;
  onEdit: (task: Todo) => void;
  onDelete: (id: string) => void;
  onSetStatus: (id: string, status: TodoStatus) => void;
}

export function DataTableRowActions({
  row,
  onEdit,
  onDelete,
  onSetStatus,
}: DataTableRowActionsProps) {
  const task = row.original;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem onClick={() => onEdit(task)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSetStatus(task.id, 'done')}>
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Mark as done
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        
        {/*
          By nesting AlertDialog here and using its trigger on a DropdownMenuItem,
          we correctly scope the confirmation dialog to only the delete action.
          `onSelect` is used to prevent the dropdown from closing when the dialog opens.
        */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
              onSelect={(e) => e.preventDefault()}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the task.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(task.id)}
                className="bg-destructive hover:bg-destructive/90"
              >
                Yes, delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
      </DropdownMenuContent>
    </DropdownMenu>
  );
}