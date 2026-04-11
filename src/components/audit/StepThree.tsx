import Radio from "@/components/form/input/Radio";
import FileUpload, { UploadedFileItem } from "../ui/FileUpload";
import { useEffect, useState } from "react";

type StepThreeData = {
  payment_method: string;
  aud_file_id: number | null;
};

type Props = {
  values: StepThreeData;
  onChange: <K extends keyof StepThreeData>(field: K, value: StepThreeData[K]) => void;
};

export default function StepThree({ values, onChange }: Props) {
  const [files, setFiles] = useState<UploadedFileItem[]>([]);

  useEffect(() => {
    if (values.aud_file_id) {
      const fakeFile = new File([""], `Файл-${values.aud_file_id}`);

      setFiles([
        {
          file: fakeFile,
          file_id: values.aud_file_id,
          original_name: `Файл-${values.aud_file_id}`,
        },
      ]);
    }
  }, [values.aud_file_id]);
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
          accept=".pdf,.doc,.docx"
          multiple={false}
          auditId={9999999}
          value={files}
          onChange={(nextFiles) => {
            setFiles(nextFiles);

            if (!nextFiles.length) {
              onChange("aud_file_id", null);
            }
          }}
          onUploaded={(fileIds) => {
            onChange("aud_file_id", fileIds[0] ?? null);
          }}
        />
      </div>
    </div>
  );
}
