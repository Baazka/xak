"use client";

type Props = {
  id?: string;
  value?: string;
  onChange: (value: string) => void;
  size?: "sm" | "md" | "lg";
  minuteStep?: 5 | 10 | 15 | 30;
};

const sizeClassMap = {
  sm: "h-8 text-xs",
  md: "h-10 text-sm",
  lg: "h-11 text-base",
};

export default function TimePicker({
  id,
  value = "",
  onChange,
  size = "md",
  minuteStep = 5,
}: Props) {
  const [hour = "", minute = ""] = value ? value.split(":") : ["", ""];

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  const minutes = Array.from({ length: Math.floor(60 / minuteStep) }, (_, i) =>
    String(i * minuteStep).padStart(2, "0")
  );

  const handleHourChange = (h: string) => {
    if (!h) {
      onChange("");
      return;
    }
    onChange(`${h}:${minute || "00"}`);
  };

  const handleMinuteChange = (m: string) => {
    if (!m) {
      onChange("");
      return;
    }
    onChange(`${hour || "00"}:${m}`);
  };

  return (
    <div className="flex items-center gap-2">
      <select
        id={id}
        value={hour}
        onChange={(e) => handleHourChange(e.target.value)}
        className={`w-full rounded-lg border border-gray-300 bg-white px-2 text-gray-900 ${sizeClassMap[size]} focus:outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-400`}
      >
        <option value="">Цаг</option>
        {hours.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>

      <span className="text-gray-500 dark:text-gray-400">:</span>

      <select
        value={minute}
        onChange={(e) => handleMinuteChange(e.target.value)}
        className={`w-full rounded-lg border border-gray-300 bg-white px-2 text-gray-900 ${sizeClassMap[size]} focus:outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-400`}
      >
        <option value="">Мин</option>
        {minutes.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </div>
  );
}
