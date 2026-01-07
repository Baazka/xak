// components/LoadingScreen.tsx
export default function LoadingScreen({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 rounded-xl bg-white px-8 py-6 shadow-lg dark:bg-gray-900">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        <p className="text-sm text-gray-700 dark:text-gray-300">Түр хүлээнэ үү...</p>
      </div>
    </div>
  );
}
