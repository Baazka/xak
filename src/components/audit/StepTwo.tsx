type StepTwoData = {
  usertype3: number;
  usertype4: number;
  usertype5: number;
  usertype6: number;
};

type Props = {
  values: StepTwoData;
  onChange: (field: keyof StepTwoData, value: string) => void;
};

export default function StepTwo({ values, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium">Батлах хэрэглэгч</label>
        <input
          type="input"
          value={values.usertype3}
          onChange={(e) => onChange("usertype3", e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Чанарын хяналт</label>
        <input
          type="input"
          value={values.usertype4}
          onChange={(e) => onChange("usertype4", e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Ахлах аудитор </label>
        <input
          type="input"
          value={values.usertype5}
          onChange={(e) => onChange("usertype5", e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Аудитор</label>
        <input
          type="input"
          value={values.usertype6}
          onChange={(e) => onChange("usertype6", e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>
    </div>
  );
}
