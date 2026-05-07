export default function NotificationSkeleton() {
  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800 no-print">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-4 p-5">
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />

          <div className="flex-1 space-y-3">
            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-3 w-full animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
          </div>

          <div className="h-6 w-16 animate-pulse rounded-full bg-gray-100 dark:bg-gray-800" />
        </div>
      ))}
    </div>
  );
}
