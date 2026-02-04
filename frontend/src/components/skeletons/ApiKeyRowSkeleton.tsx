import { Skeleton } from '@/components/ui/skeleton';

export function ApiKeyRowSkeleton() {
  return (
    <tr className="border-b">
      <td className="p-4">
        <Skeleton className="h-5 w-32" />
      </td>
      <td className="p-4">
        <Skeleton className="h-5 w-20" />
      </td>
      <td className="p-4">
        <Skeleton className="h-5 w-16" />
      </td>
      <td className="p-4">
        <Skeleton className="h-5 w-48" />
      </td>
      <td className="p-4">
        <Skeleton className="h-5 w-24" />
      </td>
      <td className="p-4">
        <Skeleton className="h-8 w-8" />
      </td>
    </tr>
  );
}

export function ApiKeyTableSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="h-12 px-4 text-left text-muted-foreground">Name</th>
            <th className="h-12 px-4 text-left text-muted-foreground">CID</th>
            <th className="h-12 px-4 text-left text-muted-foreground">Division</th>
            <th className="h-12 px-4 text-left text-muted-foreground">API Key</th>
            <th className="h-12 px-4 text-left text-muted-foreground">Created</th>
            <th className="h-12 px-4 text-left text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: count }).map((_, i) => (
            <ApiKeyRowSkeleton key={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
