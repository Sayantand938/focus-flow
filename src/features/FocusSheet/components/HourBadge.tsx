import { Badge } from "../../../components/ui/badge";

type HourBadgeProps = {
  isChecked: boolean;
};

export default function HourBadge({ isChecked }: HourBadgeProps) {
  return (
    <Badge variant={isChecked ? "logged" : "pending"}>
      {isChecked ? "Logged" : "Pending"}
    </Badge>
  );
}
