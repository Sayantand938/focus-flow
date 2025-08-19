// src/features/Todo/components/TodoHeader.tsx
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Input } from "@/shared/components/ui/input";
import { List, LayoutGrid, Search } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface TodoHeaderProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export function TodoHeader({
  activeFilter,
  onFilterChange,
  searchTerm,
  onSearchChange,
}: TodoHeaderProps) {
  return (
    // --- RESPONSIVE ---
    // Stacks vertically on small screens, row on medium and up
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <Tabs value={activeFilter} onValueChange={onFilterChange} className="w-full sm:w-auto">
        <TabsList className="grid w-full grid-cols-4 sm:w-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="flex w-full sm:w-auto items-center gap-2">
        <div className="relative flex-1 sm:flex-initial">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 w-full sm:w-64"
          />
        </div>
        <Button variant="outline" size="icon" className="hidden sm:inline-flex">
          <List className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="hidden sm:inline-flex">
          <LayoutGrid className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}