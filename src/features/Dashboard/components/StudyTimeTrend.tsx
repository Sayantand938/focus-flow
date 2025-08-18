import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { LineChart as LineChartIcon } from "lucide-react";

interface StudyTimeTrendProps {
  past30DaysProgress: { date: string; minutes: number; fullDate: string }[];
  isMobile: boolean;
}

const chartTickStyle = {
  fill: "var(--muted-foreground)",
  fontSize: 12,
};

export function StudyTimeTrend({
  past30DaysProgress,
  isMobile,
}: StudyTimeTrendProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <LineChartIcon className="size-5" />
          Study Time Trend (Last 30 Days)
        </CardTitle>
        <CardDescription>
          Daily study time progression over the past month.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ResponsiveContainer width="100%" height="100%" minHeight={300}>
          <LineChart
            data={past30DaysProgress}
            margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border)"
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              interval={isMobile ? 9 : 6}
              tick={{ ...chartTickStyle, fontSize: isMobile ? 10 : 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ ...chartTickStyle, fontSize: isMobile ? 10 : 12 }}
            />
            <Tooltip
              labelFormatter={(_, payload) =>
                `Date: ${payload?.[0]?.payload.fullDate || ""}`
              }
              formatter={(value: number) => [`${value} mins`, "Study Time"]}
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            />
            <Line
              type="monotone"
              dataKey="minutes"
              stroke="var(--foreground)"
              strokeWidth={2}
              dot={{ fill: "var(--foreground)", strokeWidth: 2, r: 4 }}
              activeDot={{
                r: 6,
                stroke: "var(--foreground)",
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}