import { Switch } from "@/shared/components/ui/switch"
import { Badge } from "@/shared/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"

type HourRowProps = {
  hour: number
  isChecked: boolean
  tag?: string
  formatHourSlot: (hour: number) => string
  onToggleSession: (hour: number, checked: boolean) => void
  onUpdateTag: (hour: number, tag: string) => void
}

export default function HourRow({
  hour,
  isChecked,
  tag,
  formatHourSlot,
  onToggleSession,
  onUpdateTag,
}: HourRowProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 items-center gap-3 sm:gap-4">
      {/* Column 1: Hour (always visible, left aligned) */}
      <span className="font-mono text-base sm:text-lg whitespace-nowrap text-left">
        {formatHourSlot(hour)}
      </span>

      {/* Column 2: Tag dropdown (hidden on mobile, centered on desktop) */}
      <div className="hidden sm:flex justify-center">
        <Select
          value={tag || ""}
          onValueChange={(value) => onUpdateTag(hour, value)}
          disabled={!isChecked}
        >
          <SelectTrigger className="w-[130px] lg:w-[150px]">
            <SelectValue placeholder="Tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="math">MATH</SelectItem>
            <SelectItem value="gi">GI</SelectItem>
            <SelectItem value="gk">GK</SelectItem>
            <SelectItem value="english">ENGLISH</SelectItem>
            <SelectItem value="bengali">BENGALI</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Column 3: Badge + Switch (right aligned, badge hidden on mobile) */}
      <div className="flex items-center justify-end gap-2">
        <Badge
          variant={isChecked ? "logged" : "pending"}
          className="hidden sm:inline-flex"
        >
          {isChecked ? "Logged" : "Pending"}
        </Badge>
        <Switch
          checked={isChecked}
          onCheckedChange={(checked) => onToggleSession(hour, checked)}
          id={`session-${hour}`}
        />
      </div>
    </div>
  )
}