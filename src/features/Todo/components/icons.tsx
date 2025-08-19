// src/features/Todo/components/icons.tsx
import {
  AlertCircle, ArrowDown, ArrowRight, ArrowUp, CheckCircle2, Circle, Clock,
} from "lucide-react";

export const statuses = [
  { value: "pending", label: "Pending", icon: Clock },
  { value: "in-progress", label: "In Progress", icon: Circle },
  { value: "completed", label: "Completed", icon: CheckCircle2 },
] as const;

export const priorities = [
  { label: "Low", value: "low", icon: ArrowDown },
  { label: "Medium", value: "medium", icon: ArrowRight },
  { label: "High", value: "high", icon: ArrowUp },
] as const;

export const getStatusInfo = (statusValue: string) => {
  return statuses.find(s => s.value === statusValue) || {
    value: "pending",
    label: "Pending",
    icon: AlertCircle,
  };
};

export const getPriorityInfo = (priorityValue: string) => {
  return priorities.find(p => p.value === priorityValue) || {
    label: "Medium",
    value: "medium",
    icon: AlertCircle,
  };
};