import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import HourRow from "./HourRow";
import { hourToSlot } from "@/shared/lib/utils";

type ShiftCardProps = {
  shift: { name: string; startHour: number; endHour: number };
  todaysSlots: Record<number, string>;
  formatHourSlot: (hour: number) => string;
  onToggleSession: (hour: number, checked: boolean) => void;
  onUpdateTag: (hour: number, tag: string) => void;
};

export default function ShiftCard({
  shift,
  todaysSlots,
  formatHourSlot,
  onToggleSession,
  onUpdateTag,
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
            const slot = hourToSlot(hour);
            const isChecked = slot !== null && slot in todaysSlots;
            const tag = isChecked ? todaysSlots[slot!] : undefined;

            return (
              <div key={hour}>
                <HourRow
                  hour={hour}
                  isChecked={isChecked}
                  tag={tag}
                  formatHourSlot={formatHourSlot}
                  onToggleSession={onToggleSession}
                  onUpdateTag={onUpdateTag}
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