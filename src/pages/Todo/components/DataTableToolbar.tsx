// src/components/TodoList/DataTableToolbar.tsx
import { Table } from "@tanstack/react-table";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, CheckCircle2, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { statuses, priorities } from "./columns";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  onAddTask: () => void;
  onDeleteSelected: (ids: string[]) => void;
  onMarkSelectedDone: (ids: string[]) => void;
}

export function DataTableToolbar<TData>({
  table,
  onAddTask,
}: DataTableToolbarProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const hasSelection = selectedRows.length > 0;

  const buttonContainerVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { staggerChildren: 0.1 } },
    exit: { opacity: 0, x: -10 },
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex w-full flex-1 items-center gap-2">
        <Input
          placeholder="Filter tasks..."
          readOnly
          className="h-9 w-full sm:w-[250px]"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <Filter className="mr-2 h-4 w-4" />
              Status
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {statuses.map((status) => (
              <DropdownMenuCheckboxItem key={status.value} disabled>
                {status.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <Filter className="mr-2 h-4 w-4" />
              Priority
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Filter by priority</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {priorities.map((priority) => (
              <DropdownMenuCheckboxItem key={priority.value} disabled>
                {priority.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex w-full sm:w-auto items-center gap-2">
        <AnimatePresence mode="wait">
          {hasSelection ? (
            <motion.div
              key="bulk-actions"
              variants={buttonContainerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex w-full sm:w-auto items-center gap-2"
            >
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-full sm:w-auto"
                onClick={() => table.toggleAllPageRowsSelected(false)}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Mark Done ({selectedRows.length})
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="h-9 w-full sm:w-auto"
                onClick={() => table.toggleAllPageRowsSelected(false)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete ({selectedRows.length})
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="add-action"
              variants={buttonContainerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <Button
                onClick={onAddTask}
                variant="default"
                size="sm"
                className="h-9 w-full sm:w-auto"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}