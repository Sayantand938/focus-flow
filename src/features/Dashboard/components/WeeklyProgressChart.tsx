import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BarChart2 } from "lucide-react";

interface WeeklyProgressChartProps {
  past7DaysProgress: { name: string; minutes: number }[];
  isMobile: boolean;
}

const chartTickStyle = {
  fill: "var(--muted-foreground)",
  fontSize: 12,
};

export function WeeklyProgressChart({
  past7DaysProgress,
  isMobile,
}: WeeklyProgressChartProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <BarChart2 className="size-5" />
          Past 7 Days Progress
        </CardTitle>
        <CardDescription>
          Total minutes studied each day this week.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ResponsiveContainer width="100%" height="100%" minHeight={300}>
          <BarChart
            data={past7DaysProgress}
            margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border)"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ ...chartTickStyle, fontSize: isMobile ? 10 : 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ ...chartTickStyle, fontSize: isMobile ? 10 : 12 }}
            />
            <Tooltip
              cursor={{ fill: "var(--accent)" }}
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            />
            <Bar
              dataKey="minutes"
              name="Minutes Studied"
              fill="var(--foreground)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}