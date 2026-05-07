type SkeletonFormProps = {
  rows?: number;
};

export default function SkeletonForm({ rows = 6 }: SkeletonFormProps) {
  return (
    <div className="space-y-6 animate-pulse">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {/* label */}
          <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-800" />

          {/* input */}
          <div className="md:col-span-2">
            <div className="h-10 w-full rounded-lg bg-gray-200 dark:bg-gray-800" />
          </div>
        </div>
      ))}

      {/* textarea */}
      <div className="space-y-3">
        <div className="h-4 w-40 rounded bg-gray-200 dark:bg-gray-800" />

        <div className="h-28 w-full rounded-xl bg-gray-200 dark:bg-gray-800" />
      </div>

      {/* buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <div className="h-10 w-24 rounded-lg bg-gray-200 dark:bg-gray-800" />
        <div className="h-10 w-32 rounded-lg bg-gray-300 dark:bg-gray-700" />
      </div>
    </div>
  );
}
