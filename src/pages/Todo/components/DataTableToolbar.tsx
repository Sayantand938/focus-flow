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
import { cn } from "@/utils/utils";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  onAddTask: () => void;
  onDeleteSelected: (ids: string[]) => void;
  onMarkSelectedDone: (ids: string[]) => void;
  isMobile: boolean;
}

export function DataTableToolbar<TData>({
  table,
  onAddTask,
  onDeleteSelected,
  onMarkSelectedDone,
  isMobile,
}: DataTableToolbarProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const hasSelection = selectedRows.length > 0;

  const buttonContainerVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { staggerChildren: 0.1 } },
    exit: { opacity: 0, x: -10 },
  };

  const selectedIds = selectedRows.map((row: any) => row.original.id);

  const handleMarkDone = () => {
    onMarkSelectedDone(selectedIds);
    table.toggleAllPageRowsSelected(false);
  };

  const handleDelete = () => {
    onDeleteSelected(selectedIds);
    table.toggleAllPageRowsSelected(false);
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex w-full flex-1 items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
        <Input
          placeholder="Filter tasks..."
          value={(table.getColumn("description")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("description")?.setFilterValue(event.target.value)
          }
          className="h-9 w-full sm:w-[250px] flex-shrink-0"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size={isMobile ? "icon" : "sm"} className="h-9 flex-shrink-0">
              <Filter className={cn("h-4 w-4", !isMobile && "mr-2")} />
              {!isMobile && "Status"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {statuses.map((status) => (
              <DropdownMenuCheckboxItem
                key={status.value}
                checked={(table.getColumn("status")?.getFilterValue() as string[] | undefined)?.includes(status.value) ?? false}
                onCheckedChange={(value) => {
                  const currentFilter = table.getColumn("status")?.getFilterValue() as string[] | undefined;
                  if (value) {
                    table.getColumn("status")?.setFilterValue(
                      currentFilter ? [...currentFilter, status.value] : [status.value]
                    );
                  } else {
                    table.getColumn("status")?.setFilterValue(
                      currentFilter?.filter((val) => val !== status.value) ?? []
                    );
                  }
                }}
              >
                {status.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size={isMobile ? "icon" : "sm"} className="h-9 flex-shrink-0">
              <Filter className={cn("h-4 w-4", !isMobile && "mr-2")} />
              {!isMobile && "Priority"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Filter by priority</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {priorities.map((priority) => (
              <DropdownMenuCheckboxItem
                key={priority.value}
                checked={(table.getColumn("priority")?.getFilterValue() as string[] | undefined)?.includes(priority.value) ?? false}
                onCheckedChange={(value) => {
                  const currentFilter = table.getColumn("priority")?.getFilterValue() as string[] | undefined;
                  if (value) {
                    table.getColumn("priority")?.setFilterValue(
                      currentFilter ? [...currentFilter, priority.value] : [priority.value]
                    );
                  } else {
                    table.getColumn("priority")?.setFilterValue(
                      currentFilter?.filter((val) => val !== priority.value) ?? []
                    );
                  }
                }}
              >
                {priority.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex w-full sm:w-auto items-center gap-2 flex-shrink-0">
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
                onClick={handleMarkDone}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Mark Done ({selectedRows.length})
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="h-9 w-full sm:w-auto"
                onClick={handleDelete}
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
                size={isMobile ? "icon" : "sm"}
                className="h-9 w-full sm:w-auto"
              >
                <PlusCircle className={cn("h-4 w-4", !isMobile && "mr-2")} />
                {!isMobile && "Add Task"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}