import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SkeletonLoaderProps {
  variant?: "card" | "table" | "list" | "form";
  rows?: number;
  className?: string;
}

function SkeletonCard() {
  return (
    <div className="rounded-lg border bg-card p-5 space-y-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

function SkeletonTableRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b last:border-0">
      <Skeleton className="h-4 w-[30%]" />
      <Skeleton className="h-4 w-[20%]" />
      <Skeleton className="h-4 w-[15%]" />
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-4 w-[10%] ml-auto" />
    </div>
  );
}

function SkeletonListItem() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b last:border-0">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-[40%]" />
        <Skeleton className="h-3 w-[25%]" />
      </div>
    </div>
  );
}

function SkeletonFormField() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  );
}

export function SkeletonLoader({ variant = "table", rows = 5, className }: SkeletonLoaderProps) {
  const items = Array.from({ length: rows });

  return (
    <div className={cn("animate-fade-in", className)}>
      {variant === "card" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}
      {variant === "table" && (
        <div className="rounded-lg border bg-card">
          {items.map((_, i) => <SkeletonTableRow key={i} />)}
        </div>
      )}
      {variant === "list" && (
        <div className="rounded-lg border bg-card">
          {items.map((_, i) => <SkeletonListItem key={i} />)}
        </div>
      )}
      {variant === "form" && (
        <div className="space-y-4 max-w-lg">
          {items.map((_, i) => <SkeletonFormField key={i} />)}
        </div>
      )}
    </div>
  );
}
