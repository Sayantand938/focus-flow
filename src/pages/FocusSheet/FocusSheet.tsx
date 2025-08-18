// src/components/FocusSheet.tsx
import { Session } from "@/utils/types";
import { SHIFTS } from "@/utils/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import { Switch } from "../../components/ui/switch";
import { isSameDay } from "date-fns";
import { Badge } from "../../components/ui/badge";

type FocusSheetProps = {
  sessions: Session[];
  onToggleSession: (hour: number, isAdding: boolean) => void;
};

/**
 * Formats an hour (0-23) into a detailed 12-hour format.
 */
const formatHourDetailed = (hour: number): string => {
  const ampm = hour >= 12 ? "PM" : "AM";
  let displayHour = hour % 12;
  if (displayHour === 0) displayHour = 12;
  const paddedHour = displayHour.toString().padStart(2, "0");
  return `${paddedHour}:00 ${ampm}`;
};

/**
 * Creates a formatted string for a 1-hour time slot.
 */
const formatHourSlot = (hour: number): string => {
  const start = formatHourDetailed(hour);
  const end = formatHourDetailed((hour + 1) % 24);
  return `${start} - ${end}`;
};

function FocusSheet({ sessions, onToggleSession }: FocusSheetProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaysCompletedHours = new Set(
    sessions
      .filter((s) => isSameDay(s.startTime, today))
      .map((s) => new Date(s.startTime).getHours())
  );

  return (
    <div className="w-full max-w-4xl mx-auto space-y-10">
      <header>
        <h1 className="text-3xl font-bold">Focus Sheet</h1>
        <p className="text-muted-foreground">
          Toggle a switch to log a 30-minute study session for that hour block.
        </p>
      </header>

      {SHIFTS.map((shift) => (
        <Card key={shift.name}>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              {shift.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from(
                { length: shift.endHour - shift.startHour },
                (_, i) => {
                  const hour = shift.startHour + i;
                  const isChecked = todaysCompletedHours.has(hour);

                  return (
                    <div key={hour}>
                      {/* ✅ Responsive grid:
                           - Mobile → time gets 2x space
                           - Desktop → equal 3 columns */}
                      <div className="grid grid-cols-[2fr_1fr_1fr] md:grid-cols-3 items-center gap-2">
                        {/* Left: Time */}
                        <span className="font-mono text-sm sm:text-base whitespace-nowrap">
                          {formatHourSlot(hour)}
                        </span>

                        {/* Middle: Status Badge */}
                        <div className="flex justify-center">
                          {isChecked ? (
                            <Badge variant="logged">Logged</Badge>
                          ) : (
                            <Badge variant="pending">Pending</Badge>
                          )}
                        </div>

                        {/* Right: Switch */}
                        <div className="flex justify-end">
                          <Switch
                            checked={isChecked}
                            onCheckedChange={(checked) =>
                              onToggleSession(hour, checked)
                            }
                            id={`session-${hour}`}
                          />
                        </div>
                      </div>

                      {/* Divider */}
                      {i < shift.endHour - shift.startHour - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  );
                }
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default FocusSheet;
