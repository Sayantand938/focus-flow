import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Separator } from "../../../components/ui/separator";
import HourRow from "./HourRow";

type ShiftCardProps = {
  shift: { name: string; startHour: number; endHour: number };
  todaysCompletedHours: Set<number>;
  formatHourSlot: (hour: number) => string;
  onToggleSession: (hour: number, checked: boolean) => void;
};

export default function ShiftCard({
  shift,
  todaysCompletedHours,
  formatHourSlot,
  onToggleSession,
}: ShiftCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{shift.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: shift.endHour - shift.startHour }, (_, i) => {
            const hour = shift.startHour + i;
            const isChecked = todaysCompletedHours.has(hour);

            return (
              <div key={hour}>
                <HourRow
                  hour={hour}
                  isChecked={isChecked}
                  formatHourSlot={formatHourSlot}
                  onToggleSession={onToggleSession}
                />
                {i < shift.endHour - shift.startHour - 1 && (
                  <Separator className="mt-4" />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
