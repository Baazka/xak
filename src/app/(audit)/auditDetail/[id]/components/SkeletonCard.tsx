type SkeletonCardProps = {
  rows?: number;
  className?: string;
};

export default function SkeletonCard({ rows = 1, className = "" }: SkeletonCardProps) {
  return (
    <div className={`space-y-3 animate-pulse no-print ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="h-4 w-40 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-800" />
          </div>

          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-gray-100 dark:bg-gray-800" />
            <div className="h-3 w-5/6 rounded bg-gray-100 dark:bg-gray-800" />
            <div className="h-3 w-2/3 rounded bg-gray-100 dark:bg-gray-800" />
          </div>
        </div>
      ))}
    </div>
  );
}
