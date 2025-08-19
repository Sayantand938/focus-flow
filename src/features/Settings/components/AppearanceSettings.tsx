import {
  Card,
  CardContent,
} from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useTheme } from "@/shared/context/ThemeProvider";
import { Palette } from "lucide-react";

type Theme = "dark" | "light" | "system";

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-3">
        <Palette className="w-5 h-5 text-primary" />
        Appearance
      </h2>
      <Card>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-grow">
              <Label htmlFor="theme-select">Theme</Label>
              <p className="text-sm text-muted-foreground">
                Select how the application should look.
              </p>
            </div>
            <Select
              value={theme}
              onValueChange={(value) => setTheme(value as Theme)}
            >
              <SelectTrigger
                id="theme-select"
                className="w-full sm:w-[180px]"
              >
                <SelectValue placeholder="Select a theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}