type StepThreeData = {
  payment_method: number;
};

type Props = {
  values: StepThreeData;
  onChange: (field: keyof StepThreeData, value: string) => void;
};

export default function StepThree({ values, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium"></label>
        <input
          type="text"
          value={values.payment_method}
          onChange={(e) => onChange("payment_method", e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>
    </div>
  );
}
