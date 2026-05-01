import DatePicker from "@/components/form/date-picker";
import YearStepper from "../form/YearStepper";
import { FormErrors } from "@/utils/validation";

export type StepOneData = {
  aud_name: string;
  aud_year: string;
  aud_begin_date: Date | null;
  aud_end_date: Date | null;
};

type Props = {
  values: StepOneData;
  errors?: FormErrors<StepOneData>;
  onChange: <K extends keyof StepOneData>(field: K, value: StepOneData[K]) => void;
};

export default function StepOne({ values, errors = {}, onChange }: Props) {
  const inputClass = (field: keyof StepOneData) =>
    `w-full rounded-lg border px-3 py-2 outline-none transition focus:ring-1 ${
      errors[field]
        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
        : "border-gray-300 focus:border-brand-500 focus:ring-brand-500"
    }`;

  const renderError = (field: keyof StepOneData) =>
    errors[field] ? <p className="mt-1 text-xs text-red-500">{errors[field]}</p> : null;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <label className="block text-sm font-medium">Аудитын нэр</label>
        <input
          name="aud_name"
          type="text"
          value={values.aud_name ?? ""}
          onChange={(e) => onChange("aud_name", e.target.value)}
          className={inputClass("aud_name")}
          placeholder="Аудитын нэр"
        />
        {renderError("aud_name")}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Аудитын жил</label>
        <div className={errors.aud_year ? "rounded-lg border border-red-500" : ""}>
          <YearStepper
            value={values.aud_year}
            lessYear={5}
            onChange={(value) => onChange("aud_year", value)}
          />
        </div>
        {renderError("aud_year")}
      </div>

      <div className="space-y-2 overflow-visible">
        <DatePicker
          id="aud_begin_date"
          label="Эхлэх хугацаа"
          defaultDate={values.aud_begin_date ?? undefined}
          onChange={(selectedDates) => {
            onChange("aud_begin_date", selectedDates?.[0] ?? null);
          }}
          size="lg"
        />
        {renderError("aud_begin_date")}
      </div>

      <div className="space-y-2 overflow-visible">
        <DatePicker
          id="aud_end_date"
          label="Дуусах хугацаа"
          defaultDate={values.aud_end_date ?? undefined}
          onChange={(selectedDates) => {
            onChange("aud_end_date", selectedDates?.[0] ?? null);
          }}
          size="lg"
        />
        {renderError("aud_end_date")}
      </div>
    </div>
  );
}
