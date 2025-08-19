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
    <div className="grid grid-cols-[1fr_auto] md:grid-cols-[1fr_auto] items-center gap-2">
      {/* Hour label */}
      <span className="font-mono text-base sm:text-lg whitespace-nowrap">
        {formatHourSlot(hour)}
      </span>

      {/* Badge + Switch grouped together */}
      <div className="flex items-center gap-3">
        <HourBadge isChecked={isChecked} />
        <Switch
          checked={isChecked}
          onCheckedChange={(checked) => onToggleSession(hour, checked)}
          id={`session-${hour}`}
        />
      </div>
    </div>
  );
}
