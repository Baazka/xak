import Radio from "@/components/form/input/Radio";
import FileUpload from "./FileUpload";

type UploadedFileItem = {
  file: File;
  preview?: string;
};
type StepThreeData = {
  payment_method: string;
  attachments: UploadedFileItem[];
};

type Props = {
  values: StepThreeData;
  onChange: <K extends keyof StepThreeData>(field: K, value: StepThreeData[K]) => void;
};

export default function StepThree({ values, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium">Төлбөр</label>

        <div className="flex flex-wrap items-center gap-4">
          <Radio
            id="Wallet"
            name="methodSelect"
            value="Wallet"
            label="Данснаас төлөх"
            checked={values.payment_method === "Wallet"}
            onChange={(value) => onChange("payment_method", value)}
          />

          <Radio
            id="Qpay"
            name="methodSelect"
            value="QPay"
            label="QPay төлөх"
            checked={values.payment_method === "QPay"}
            onChange={(value) => onChange("payment_method", value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium">Гэрээ хавсаргах</label>
        <FileUpload
          // label="Хавсралт файл"
          accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
          multiple={false}
          value={values.attachments}
          onChange={(files) => onChange("attachments", files)}
        />
      </div>
    </div>
  );
}
