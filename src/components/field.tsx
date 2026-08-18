import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

export function TextArea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm text-fg placeholder:text-subtle focus-visible:border-line-strong focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none",
        className,
      )}
      {...props}
    />
  );
}

export function SelectField({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-md border border-line bg-elevated px-3 text-sm text-fg focus-visible:border-line-strong focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
