import { Badge } from "@/components/ui";
import { RecruitStatus, RECRUIT_STATUS_LABELS, RECRUIT_STATUS_COLORS } from "@/types";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const typedStatus = status as RecruitStatus;
  return (
    <Badge color={RECRUIT_STATUS_COLORS[typedStatus] as "blue" | "yellow" | "orange" | "green" | "gray" | "red"}>
      {RECRUIT_STATUS_LABELS[typedStatus]}
    </Badge>
  );
}
