import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function CardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {React.Children.map(children, (child, index) => (
        <Card key={index} className="h-full">
          {child}
        </Card>
      ))}
    </div>
  );
}

export function CardBody({
  title,
  description,
  actions,
  children,
  className,
}: {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex h-full flex-col p-6", className)}>
      {(title || description || actions) && (
        <div className="flex items-start justify-between gap-3">
          <div>
            {title && <h3 className="text-lg font-semibold">{title}</h3>}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {actions}
        </div>
      )}
      {children && <div className="mt-4 flex-1">{children}</div>}
    </div>
  );
}
