import { Switch } from "@/shared/components/ui/switch";
import HourBadge from "./HourBadge";

type HourRowProps = {
  hour: number;
  isChecked: boolean;
  formatHourSlot: (hour: number) => string;
  onToggleSession: (hour: number, checked: boolean) => void;
};

export default function HourRow({
  hour,
  isChecked,
  formatHourSlot,
  onToggleSession,
}: HourRowProps) {
  return (
    <div className="grid grid-cols-[1fr_auto_auto] md:grid-cols-3 items-center gap-2">
      <span className="font-mono text-base sm:text-lg whitespace-nowrap">
        {formatHourSlot(hour)}
      </span>

      <div className="flex justify-center">
        <HourBadge isChecked={isChecked} />
      </div>

      <div className="flex justify-end">
        <Switch
          checked={isChecked}
          onCheckedChange={(checked) => onToggleSession(hour, checked)}
          id={`session-${hour}`}
        />
      </div>
    </div>
  );
}