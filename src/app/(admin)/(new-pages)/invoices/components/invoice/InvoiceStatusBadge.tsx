type Props = {
  status: string;
  dueDate?: string; // YYYY-MM-DD
};

export default function InvoiceStatusBadge({ status, dueDate }: Props) {
  const today = new Date();
  const due = dueDate ? new Date(dueDate) : null;

  let label = status;
  let className = "px-2 py-1 text-xs font-medium rounded";

  // 🔴 OVERDUE (computed)
  if (status !== "PAID" && due && due < today) {
    label = "OVERDUE";
    className += " bg-red-100 text-red-700";
  } else {
    switch (status) {
      case "PAID":
        className += " bg-green-100 text-green-700";
        break;
      case "PARTIAL":
        className += " bg-yellow-100 text-yellow-800";
        break;
      case "ISSUED":
        className += " bg-blue-100 text-blue-700";
        break;
      case "CANCELLED":
        className += " bg-gray-200 text-gray-600";
        break;
      default:
        className += " bg-gray-100 text-gray-700";
    }
  }

  return <span className={className}>{label}</span>;
}
