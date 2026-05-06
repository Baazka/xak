import { Archive, CheckCircle, Eye, RotateCcw, Save, Send, ShieldCheck } from "lucide-react";

export const getStatusMeta = (status?: string) => {
  switch (status) {
    case "Хадгалсан":
      return {
        icon: <Save className="h-3.5 w-3.5" />,
        style: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300",
      };

    case "Илгээсэн":
      return {
        icon: <Send className="h-3.5 w-3.5" />,
        style: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400",
      };

    case "Хянасан":
      return {
        icon: <Eye className="h-3.5 w-3.5" />,
        style:
          "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400",
      };

    case "Баталсан":
      return {
        icon: <CheckCircle className="h-3.5 w-3.5" />,
        style:
          "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400",
      };

    case "Буцаасан":
      return {
        icon: <RotateCcw className="h-3.5 w-3.5" />,
        style: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400",
      };

    case "Чанарын хяналт":
      return {
        icon: <ShieldCheck className="h-3.5 w-3.5" />,
        style:
          "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400",
      };

    case "Архивласан":
      return {
        icon: <Archive className="h-3.5 w-3.5" />,
        style: "bg-slate-200 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300",
      };

    default:
      return {
        icon: null,
        style: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300",
      };
  }
};
export const StatusBadge = ({ status }: { status?: string }) => {
  const meta = getStatusMeta(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-medium ${meta.style}`}
    >
      {meta.icon}
      {status ?? "-"}
    </span>
  );
};
