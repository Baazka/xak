import DatePicker from "@/components/form/DatePicker";

type StepOneData = {
  aud_name: string;
  aud_year: string;
  aud_begin_date: Date;
  aud_end_date: Date;
};

type Props = {
  values: StepOneData;
  onChange: <K extends keyof StepOneData>(field: K, value: StepOneData[K]) => void;
};

export default function StepOne({ values, onChange }: Props) {
  const currentYear = new Date().getFullYear();
  const MIN_YEAR = currentYear - 5;
  const safeYear =
    values.aud_year === "" || values.aud_year == null ? currentYear : Number(values.aud_year);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <label className="block text-sm font-medium">Аудитын нэр</label>
        <input
          type="text"
          value={values.aud_name}
          onChange={(e) => onChange("aud_name", e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Аудитын нэр"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Жил</label>

        <div className="relative flex max-w-[9rem] items-center rounded-base shadow-xs">
          <button
            type="button"
            onClick={() => {
              const next = Math.max(MIN_YEAR, safeYear - 1);
              onChange("aud_year", String(next));
            }}
            className="box-border h-10 rounded-s-base border border-default-medium bg-neutral-secondary-medium px-3 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={safeYear <= MIN_YEAR}
          >
            −
          </button>

          <input
            type="number"
            min={MIN_YEAR}
            max={currentYear}
            value={safeYear}
            onChange={(e) => {
              const raw = e.target.value;

              if (raw === "") {
                onChange("aud_year", "");
                return;
              }

              let next = Number(raw);

              if (Number.isNaN(next)) next = currentYear;
              if (next < MIN_YEAR) next = MIN_YEAR;
              if (next > currentYear) next = currentYear;

              onChange("aud_year", String(next));
            }}
            className="h-10 w-full border-y border-default-medium text-center focus:outline-none"
            readOnly
          />

          <button
            type="button"
            onClick={() => {
              const next = Math.min(currentYear, safeYear + 1);
              onChange("aud_year", String(next));
            }}
            className="box-border h-10 rounded-e-base border border-default-medium bg-neutral-secondary-medium px-3 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={safeYear >= currentYear}
          >
            +
          </button>
        </div>
      </div>

      <div className="space-y-2 overflow-visible ">
        <DatePicker
          id="aud_begin_date"
          label="Эхлэх хугацаа"
          defaultDate={values.aud_begin_date}
          onChange={(selectedDates) => {
            if (selectedDates?.[0]) {
              onChange("aud_begin_date", selectedDates[0]);
            }
          }}
          size="lg"
        />
      </div>

      <div className="space-y-2 overflow-visible">
        <DatePicker
          id="aud_end_date"
          label="Дуусах хугацаа"
          defaultDate={values.aud_end_date}
          onChange={(selectedDates) => {
            if (selectedDates?.[0]) {
              onChange("aud_end_date", selectedDates[0]);
            }
          }}
          size="lg"
        />
      </div>
    </div>
  );
}
