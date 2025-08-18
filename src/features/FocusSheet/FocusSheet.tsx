// src/components/FocusSheet.tsx
import { StudiedDays } from "@/utils/types";
import { SHIFTS, slotToHour } from "@/utils/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import { Switch } from "../../components/ui/switch";
import { format } from "date-fns";
import { Badge } from "../../components/ui/badge";

type FocusSheetProps = {
  studiedDays: StudiedDays;
  onToggleSession: (hour: number, isAdding: boolean) => void;
};

const formatHourDetailed = (hour: number): string => {
  const ampm = hour >= 12 ? "PM" : "AM";
  let displayHour = hour % 12;
  if (displayHour === 0) displayHour = 12;
  return `${String(displayHour).padStart(2, "0")}:00 ${ampm}`;
};

const formatHourSlot = (hour: number): string => {
  const start = formatHourDetailed(hour);
  const end = formatHourDetailed((hour + 1) % 24);
  return `${start} - ${end}`;
};

function FocusSheet({ studiedDays, onToggleSession }: FocusSheetProps) {
  const todayKey = format(new Date(), "yyyy-MM-dd");
  const todayData = studiedDays[todayKey];
  const todaysCompletedHours = new Set(
    todayData?.completedSlots.map(slot => slotToHour(slot)).filter(h => h !== null) || []
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
                      <div className="grid grid-cols-[1fr_auto_auto] md:grid-cols-3 items-center gap-2">
                        <span className="font-mono text-sm sm:text-base whitespace-nowrap">
                          {formatHourSlot(hour)}
                        </span>

                        <div className="flex justify-center">
                          {isChecked ? (
                            <Badge variant="logged">Logged</Badge>
                          ) : (
                            <Badge variant="pending">Pending</Badge>
                          )}
                        </div>

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