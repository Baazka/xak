type Props = {
  data: any;
};

export default function Form1({ data }: Props) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Маягт 1</h2>
      <div className="rounded-lg border p-4">Байгууллагын нэр: {data.orgName}</div>
    </div>
  );
}
