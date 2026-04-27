type Props = {
  value: number | "";
  onChange: (val: number | "") => void;
  min?: number;
  max?: number;
  step?: number;
  error?: string;
};

export default function NumberStepper({ value, onChange, min = 0, max, step = 1, error }: Props) {
  const base = "flex items-center border rounded overflow-hidden w-full";
  const btn = "px-3 py-2 bg-gray-100 hover:bg-gray-200 active:scale-95 transition";
  const input = "w-full text-center outline-none px-2 py-2";

  const isError = !!error;

  const decrease = () => {
    if (value === "") return;
    const newVal = value - step;
    if (newVal < min) return;
    onChange(newVal);
  };

  const increase = () => {
    const newVal = (value || 0) + step;
    if (max !== undefined && newVal > max) return;
    onChange(newVal);
  };

  return (
    <div>
      <div className={`${base} ${isError ? "border-red-500" : "border-gray-300"}`}>
        <button type="button" onClick={decrease} className={btn}>
          –
        </button>

        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
          className={input}
        />

        <button type="button" onClick={increase} className={btn}>
          +
        </button>
      </div>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
