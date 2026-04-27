import DatePicker from "@/components/form/date-picker";
import YearStepper from "../form/YearStepper";

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
        <label className="block text-sm font-medium">Аудитын жил</label>

        <YearStepper
          value={values.aud_year}
          lessYear={5}
          onChange={(value) => onChange("aud_year", value)}
        />
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
