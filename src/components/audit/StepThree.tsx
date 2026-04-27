import Radio from "@/components/form/input/Radio";
import FileUpload, { UploadedFileItem } from "../ui/FileUpload";
import { FormErrors } from "@/utils/validation";
import { useEffect, useState } from "react";

export type StepThreeData = {
  payment_method: string;
  aud_file_id: number | null;
};

type Props = {
  values: StepThreeData;
  errors?: FormErrors<StepThreeData>;
  onChange: <K extends keyof StepThreeData>(field: K, value: StepThreeData[K]) => void;
};

export default function StepThree({ values, errors = {}, onChange }: Props) {
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
    } else {
      setFiles([]);
    }
  }, [values.aud_file_id]);

  const renderError = (field: keyof StepThreeData) =>
    errors[field] ? <p className="mt-1 text-xs text-red-500">{errors[field]}</p> : null;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium">Төлбөр</label>

        <div
          className={`flex flex-wrap items-center gap-4 rounded-lg ${
            errors.payment_method ? "border border-red-500 p-3" : ""
          }`}
        >
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

        {renderError("payment_method")}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Гэрээ хавсаргах</label>

        <div className={errors.aud_file_id ? "rounded-lg border border-red-500 p-2" : ""}>
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

        {renderError("aud_file_id")}
      </div>
    </div>
  );
}
