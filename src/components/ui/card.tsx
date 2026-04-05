import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover }: CardProps) {
  return (
    <div className={cn(
      "bg-white border border-slate-200 rounded-xl shadow-sm",
      "dark:bg-slate-900 dark:border-slate-700/60",
      hover && "hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-pointer",
      className
    )}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("px-6 py-4 border-b border-slate-100 dark:border-slate-700/60", className)}>
      {children}
    </div>
  );
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-6 py-5", className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("px-6 py-4 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/40 rounded-b-xl", className)}>
      {children}
    </div>
  );
}
