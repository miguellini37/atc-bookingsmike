import { Skeleton } from '@/components/ui/skeleton';

export function TimelineRowSkeleton() {
  return (
    <div className="flex items-center border-b py-2">
      <div className="w-32 flex-shrink-0 px-4">
        <Skeleton className="h-5 w-24" />
      </div>
      <div className="flex-1 relative h-10">
        <Skeleton
          className="absolute h-8 rounded"
          style={{
            left: `${Math.random() * 20}%`,
            width: `${20 + Math.random() * 30}%`,
          }}
        />
      </div>
    </div>
  );
}

export function TimelineSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Time axis header */}
      <div className="flex items-center border-b bg-muted/50 h-12">
        <div className="w-32 flex-shrink-0 px-4">
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex-1 flex">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex-1 text-center">
              <Skeleton className="h-4 w-8 mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Rows */}
      {Array.from({ length: count }).map((_, i) => (
        <TimelineRowSkeleton key={i} />
      ))}
    </div>
  );
}
