import { StudiedDays } from "@/utils/types";
import { SHIFTS, slotToHour } from "@/utils/utils";
import { format } from "date-fns";
import ShiftCard from "./components/ShiftCard";

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

export default function FocusSheet({
  studiedDays,
  onToggleSession,
}: FocusSheetProps) {
  const todayKey = format(new Date(), "yyyy-MM-dd");
  const todayData = studiedDays[todayKey];
  const todaysCompletedHours = new Set(
    todayData?.completedSlots.map(slotToHour).filter(h => h !== null) || []
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
        <ShiftCard
          key={shift.name}
          shift={shift}
          todaysCompletedHours={todaysCompletedHours}
          formatHourSlot={formatHourSlot}
          onToggleSession={onToggleSession}
        />
      ))}
    </div>
  );
}
