import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  description,
  icon,
  className,
}: {
  label: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between rounded-2xl border border-border bg-white p-6 shadow-sm",
        className
      )}
    >
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold text-foreground">{value}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {icon && (
        <div className="rounded-full bg-muted p-3 text-muted-foreground">
          {icon}
        </div>
      )}
    </div>
  );
}
