import Radio from "@/components/form/input/Radio";
import FileUpload, { UploadedFileItem } from "../ui/FileUpload";
import { FormErrors } from "@/utils/validation";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

export type StepThreeData = {
  payment_method: string;
  aud_file_id: number | null;
  aud_name: string;
  aud_year: string;
  aud_begin_date: Date;
  aud_end_date: Date;
  org_regno: string;
  org_legal_name: string;
  org_head_name: string;
  org_head_phone: string;
  org_email: string;
  usertype3: number;
  usertype4: number;
  usertype5: number;
  usertype6: number[];
};

type UserOption = {
  value: number;
  label: string;
  regNo?: string;
};

type Props = {
  values: StepThreeData;
  errors?: FormErrors<StepThreeData>;
  onChange: <K extends keyof StepThreeData>(field: K, value: StepThreeData[K]) => void;
  userOptions: UserOption[];
};

export default function StepThree({ values, errors = {}, onChange, userOptions }: Props) {
  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [ticket, setTicket] = useState(0);
  const [ticketTotal, setTicketTotal] = useState(0);
  let aud_price = 100000;

  const loadMeta = async () => {
    try {
      setLoading(true);

      const res = await fetchWithAuth("/api/invoices_new/card", {
        method: "GET",
      });

      if (!res.ok) {
        throw new Error("Failed to load metadata");
      }
      const data = await res.json();
      setBalance(data.balance);
      setTicketTotal(data.ticketTotal);
      setTicket(data.ticket);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getUsername = (userId: number) => {
    const username = userId ? userOptions.filter((u) => u.value === userId)[0].label : null;
    return username;
  };

  useEffect(() => {
    loadMeta();
  }, []);

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
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-2 rounded-lg shadow-md border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
          <div>
            <h2 className=" font-medium border-b">Аудитын үндсэн мэдээлэл</h2>
          </div>
          <div>
            <h2 className="font-semibold text-gray-800 dark:text-white/90">Аудитын нэр:</h2>
            <h2 className="text-gray-800 dark:text-white/90">{values.aud_name}</h2>
          </div>
          <div>
            <h2 className="font-semibold text-gray-800 dark:text-white/90">Аудитын жил:</h2>
            <h2 className="text-gray-800 dark:text-white/90">{values.aud_year}</h2>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white/90">Эхлэх хугацаа:</h3>
            <h3 className="text-gray-800 dark:text-white/90">
              {values.aud_begin_date.toLocaleDateString("en-CA").replace(/-/g, ".")}
            </h3>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white/90">Дуусах хугацаа:</h3>
            <h3 className="text-gray-800 dark:text-white/90">
              {values.aud_end_date.toLocaleDateString("en-CA").replace(/-/g, ".")}
            </h3>
          </div>
        </div>
        <div className="flex flex-col rounded-lg shadow-md border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
          <div>
            <h2 className=" font-medium border-b">Үйлчлүүлэгчийн мэдээлэл</h2>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white/90">Регистрийн дугаар:</h3>
            <h3 className="text-gray-800 dark:text-white/90">{values.org_regno}</h3>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white/90">
              Хуулийн этгээдийн нэр:
            </h3>
            <h3 className="text-gray-800 dark:text-white/90">{values.org_legal_name}</h3>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white/90">Удирдлагын нэр:</h3>
            <h3 className="text-gray-800 dark:text-white/90">{values.org_head_name}</h3>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white/90">Удирдлагын утас:</h3>
            <h3 className="text-gray-800 dark:text-white/90">{values.org_head_phone}</h3>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white/90">Мэйл хаяг:</h3>
            <h3 className="text-gray-800 dark:text-white/90">{values.org_email}</h3>
          </div>
        </div>
        <div className="flex flex-col rounded-lg shadow-md border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
          <div>
            <h2 className="text-lg font-semibold border-b-2">Аудитын багийн мэдээлэл</h2>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white/90">Батлах хэрэглэгч:</h3>
            <h3 className="text-gray-800 dark:text-white/90">{getUsername(values.usertype3)}</h3>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white/90">Чанарын хяналт:</h3>
            <h3 className="text-gray-800 dark:text-white/90">{getUsername(values.usertype4)}</h3>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white/90">Ахлах аудитор:</h3>
            <h3 className="text-gray-800 dark:text-white/90">{getUsername(values.usertype5)}</h3>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white/90">Аудитор:</h3>
            {values.usertype6.map((r) => (
              <h3 className="text-gray-800 dark:text-white/90">{getUsername(r)}</h3>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg shadow-md border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
          <div className="text-center">
            <label className="block text-sm font-medium mb-3">Аудитын гэрээ хавсаргах</label>
          </div>

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
        <div className="flex flex-col gap-2 rounded-lg shadow-md border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
          <div className="text-center">
            <label className="block text-sm font-medium">Төлбөр төлөлт</label>
          </div>
          <div className="text-center">
            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Төлөх дүн: {Number(aud_price).toLocaleString("en-US")} ₮
            </span>
          </div>
          <div className="flex flex-col gap-4">
            <div
              className={`flex flex-col gap-4 rounded-lg ${
                errors.payment_method ? "border border-red-500 p-3" : ""
              }`}
            >
              {ticket > 0 && (
                <Radio
                  id="Ticket"
                  name="methodSelect"
                  value="Ticket"
                  label={"Төлбөрийн эрх ашиглах" + " ( Боломжит эрх: " + ticket + " )"}
                  checked={values.payment_method === "Ticket"}
                  onChange={(value) => onChange("payment_method", value)}
                />
              )}
              <Radio
                id="Wallet"
                name="methodSelect"
                value="Wallet"
                label={
                  "Данснаас төлөх" +
                  " ( Үлдэгдэл: " +
                  Number(balance).toLocaleString("en-US") +
                  "₮ )"
                }
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
        </div>
      </div>
    </div>
  );
}
