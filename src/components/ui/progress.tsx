import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  color?: "brand" | "emerald" | "amber" | "red";
  size?: "sm" | "md" | "lg";
}

export function Progress({ value, max = 100, className, showLabel, color = "brand", size = "md" }: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const colors = {
    brand: "bg-brand-600",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
  };

  const heights = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn("flex-1 bg-slate-100 rounded-full overflow-hidden", heights[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-500", colors[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && <span className="text-sm font-medium text-slate-600 w-10 text-right">{Math.round(percentage)}%</span>}
    </div>
  );
}
