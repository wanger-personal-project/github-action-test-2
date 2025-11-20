export function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
          {title}
        </p>
        {description && (
          <p className="text-lg font-semibold text-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
