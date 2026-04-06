type Props = {
  data: any;
};

export default function Form2({ data }: Props) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Маягт 2</h2>
      <div className="rounded-lg border p-4">Регистр: {data.regNo}</div>
    </div>
  );
}
