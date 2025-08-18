// src/components/TodoList/columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Todo, TodoStatus } from "@/utils/types";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowRight, ArrowUp, Circle, CheckCircle2, XCircle, ArrowUpDown } from "lucide-react";
import { DataTableRowActions } from "./DataTableRowActions";

export const statuses = [
  { value: "done", label: "Done", icon: CheckCircle2 },
  { value: "in-progress", label: "In Progress", icon: Circle },
  { value: "todo", label: "Todo", icon: XCircle },
];

export const priorities = [
  { label: "Low", value: "low", icon: ArrowDown },
  { label: "Medium", value: "medium", icon: ArrowRight },
  { label: "High", value: "high", icon: ArrowUp },
];

export const getColumns = (
    isMobile: boolean,
    actions: {
        onEdit: (task: Todo) => void;
        onDelete: (id: string) => void;
        onSetStatus: (id: string, status: TodoStatus) => void;
    }
): ColumnDef<Todo>[] => {
    const baseColumns: ColumnDef<Todo>[] = [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            className="translate-y-[2px]"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="translate-y-[2px]"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "description",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Task Description
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          return (
            <div className="flex flex-col pl-2">
              <span className="font-medium max-w-[300px] truncate">{row.getValue("description")}</span>
            </div>
          )
        },
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Created At
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
            const date = new Date(row.getValue("createdAt"));
            return <span>{format(date, "MMM d, yyyy")}</span>
        }
      },
      {
        accessorKey: "tag",
        header: "Tag",
        cell: ({ row }) => {
          const tag = row.original.tag;
          return tag ? <Badge variant="outline">{tag}</Badge> : null;
        },
      },
      {
        accessorKey: "priority",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Priority
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const priority = priorities.find(
            (p) => p.value === row.getValue("priority")
          );
          if (!priority) return null;
          return (
            <div className="flex items-center gap-2">
              <priority.icon className="h-4 w-4 text-muted-foreground" />
              <span>{priority.label}</span>
            </div>
          );
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const status = statuses.find((s) => s.value === row.getValue("status"));
          if (!status) return null;
          return (
            <div className="flex items-center gap-2">
              <status.icon className="h-4 w-4 text-muted-foreground" />
              <span>{status.label}</span>
            </div>
          );
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
      },
      {
        id: "actions",
        cell: ({ row }) => <DataTableRowActions row={row} {...actions} />,
      },
    ];

    if (isMobile) {
        // Filter columns for mobile view
        return baseColumns.filter(col => {
            if (!('accessorKey' in col)) return true;
            return !['id', 'createdAt'].includes(col.accessorKey as string);
        });
    }

    // Show all columns on desktop
    return baseColumns;
}