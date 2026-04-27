type YearStepperProps = {
  label?: string;
  value?: string | number | null;
  onChange: (value: string) => void;
  lessYear?: number;
  maxYear?: number;
  disabled?: boolean;
  className?: string;
};

export default function YearStepper({
  label = "",
  value,
  onChange,
  lessYear = 5,
  maxYear = new Date().getFullYear(),
  disabled = false,
}: YearStepperProps) {
  const minYear = maxYear - lessYear;

  const safeYear = Math.min(maxYear, Math.max(minYear, Number(value) || maxYear));

  const setYear = (next: number) => {
    onChange(String(next));
  };

  return (
    <>
      {label && <label className="block text-sm font-medium">{label}</label>}

      <div className="flex max-w-[9rem] items-center rounded-lg shadow-sm">
        <button
          type="button"
          onClick={() => setYear(Math.max(minYear, safeYear - 1))}
          disabled={disabled || safeYear <= minYear}
          className="h-10 px-3 border border-gray-300 bg-gray-100 rounded-l-lg hover:bg-gray-200 disabled:opacity-50"
        >
          −
        </button>

        <input
          type="number"
          value={safeYear}
          readOnly
          onKeyDown={(e) => {
            if (e.key === "ArrowUp") setYear(Math.min(maxYear, safeYear + 1));
            if (e.key === "ArrowDown") setYear(Math.max(minYear, safeYear - 1));
          }}
          className="h-10 w-full text-center border-y border-gray-300 outline-none"
        />

        <button
          type="button"
          onClick={() => setYear(Math.min(maxYear, safeYear + 1))}
          disabled={disabled || safeYear >= maxYear}
          className="h-10 px-3 border border-gray-300 bg-gray-100 rounded-r-lg hover:bg-gray-200 disabled:opacity-50"
        >
          +
        </button>
      </div>
    </>
  );
}
