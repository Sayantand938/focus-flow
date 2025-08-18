// src/components/FocusSheet.tsx
import { Session } from "@/utils/types";
import { SHIFTS } from "@/utils/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import { Switch } from "../../components/ui/switch";
import { isSameDay } from "date-fns";

type FocusSheetProps = {
  sessions: Session[];
  onToggleSession: (hour: number, isAdding: boolean) => void;
};

/**
 * Formats an hour (0-23) into a detailed 12-hour format.
 * e.g., 7 -> "07:00 AM", 13 -> "01:00 PM", 0 -> "12:00 AM"
 */
const formatHourDetailed = (hour: number): string => {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  let displayHour = hour % 12;
  if (displayHour === 0) {
    displayHour = 12; // Handle midnight (0) and noon (12)
  }
  const paddedHour = displayHour.toString().padStart(2, '0');
  return `${paddedHour}:00 ${ampm}`;
};

/**
 * Creates a formatted string for a 1-hour time slot.
 * e.g., 7 -> "07:00 AM - 08:00 AM"
 */
const formatHourSlot = (hour: number): string => {
  const start = formatHourDetailed(hour);
  // Use modulo to handle the 11 PM -> 12 AM transition correctly
  const end = formatHourDetailed((hour + 1) % 24); 
  return `${start} - ${end}`;
};


function FocusSheet({ sessions, onToggleSession }: FocusSheetProps) {
  const today = new Date(); // Use a fresh date for display purposes
  today.setHours(0, 0, 0, 0); // Normalize to the start of the day

  // Create a Set of hours that have a completed session today for quick lookups.
  const todaysCompletedHours = new Set(
    sessions
      .filter((s) => isSameDay(s.startTime, today))
      .map((s) => new Date(s.startTime).getHours())
  );

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Focus Sheet</h1>
        <p className="text-muted-foreground">
          Toggle a switch to log a 30-minute study session for that hour block.
        </p>
      </header>

      {SHIFTS.map((shift) => (
        <Card key={shift.name}>
          <CardHeader>
            <CardTitle>{shift.name}</CardTitle>
            <CardDescription className="mb-2">{`From ${formatHourDetailed(shift.startHour)} to ${formatHourDetailed(shift.endHour)}`}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Generate an array of hours for the current shift */}
              {Array.from({ length: shift.endHour - shift.startHour }, (_, i) => {
                  const hour = shift.startHour + i;
                  const isChecked = todaysCompletedHours.has(hour);

                  return (
                    <div key={hour}>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm sm:text-base">
                          {formatHourSlot(hour)}
                        </span>
                        <Switch
                          checked={isChecked}
                          onCheckedChange={(checked) =>
                            // We no longer pass the 'today' object.
                            // The handler will determine the date itself.
                            onToggleSession(hour, checked)
                          }
                          id={`session-${hour}`}
                        />
                      </div>
                      {/* Add a separator between items, but not after the last one */}
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