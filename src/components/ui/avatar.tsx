import { cn, getInitials } from "@/lib/utils";

interface AvatarProps {
  name: string;
  image?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-7 h-7 text-xs",
  md: "w-9 h-9 text-sm",
  lg: "w-11 h-11 text-base",
  xl: "w-14 h-14 text-lg",
};

const colors = [
  "bg-brand-100 text-brand-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-violet-100 text-violet-700",
  "bg-cyan-100 text-cyan-700",
];

function getColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({ name, image, size = "md", className }: AvatarProps) {
  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className={cn("rounded-full object-cover flex-shrink-0", sizeClasses[size], className)}
      />
    );
  }

  return (
    <div className={cn("rounded-full flex items-center justify-center font-semibold flex-shrink-0", sizeClasses[size], getColor(name), className)}>
      {getInitials(name)}
    </div>
  );
}
