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

  const InfoRow = ({ label, value }: { label: string; value?: React.ReactNode }) => (
    <div className="grid grid-cols-[140px_1fr] gap-3 border-b border-gray-100 py-2 last:border-b-0 dark:border-gray-800">
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</div>
      <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{value || "-"}</div>
    </div>
  );

  const InfoCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3 border-b border-gray-200 pb-3 dark:border-gray-800">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h2>
      </div>
      <div>{children}</div>
    </div>
  );

  const Card = ({
    title,
    desc,
    children,
  }: {
    title: string;
    desc?: string;
    children: React.ReactNode;
  }) => (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 border-b border-gray-100 pb-3 dark:border-gray-800">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
        {desc && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{desc}</p>}
      </div>

      {children}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <InfoCard title="Аудитын үндсэн мэдээлэл">
          <InfoRow label="Аудитын нэр" value={values.aud_name} />
          <InfoRow label="Аудитын жил" value={values.aud_year} />
          <InfoRow label="Эхлэх хугацаа" value={values.aud_begin_date.toDateString()} />
          <InfoRow label="Дуусах хугацаа" value={values.aud_end_date.toDateString()} />
        </InfoCard>

        <InfoCard title="Үйлчлүүлэгчийн мэдээлэл">
          <InfoRow label="Регистрийн дугаар" value={values.org_regno} />
          <InfoRow label="Хуулийн этгээдийн нэр" value={values.org_legal_name} />
          <InfoRow label="Удирдлагын нэр" value={values.org_head_name} />
          <InfoRow label="Удирдлагын утас" value={values.org_head_phone} />
          <InfoRow label="Мэйл хаяг" value={values.org_email} />
        </InfoCard>

        <InfoCard title="Аудитын багийн мэдээлэл">
          <InfoRow label="Батлах хэрэглэгч" value={getUsername(values.usertype3)} />
          <InfoRow label="Чанарын хяналт" value={getUsername(values.usertype4)} />
          <InfoRow label="Ахлах аудитор" value={getUsername(values.usertype5)} />
          <InfoRow
            label="Аудитор"
            value={
              values.usertype6?.length
                ? values.usertype6.map((r) => getUsername(r)).join(", ")
                : "-"
            }
          />
        </InfoCard>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Аудитын гэрээ хавсаргах" desc="PDF, DOC, DOCX файл хавсаргана уу">
          <div
            className={`rounded-xl transition ${
              errors.aud_file_id ? "border border-red-500 bg-red-50/40 p-3 dark:bg-red-950/20" : ""
            }`}
          >
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
        </Card>

        <Card title="Төлбөр төлөлт" desc="Төлбөрийн боломжит хэлбэрээс сонгоно уу">
          <div className="mb-4 rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800/60">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Төлөх дүн</p>
            <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
              {Number(aud_price).toLocaleString("en-US")} ₮
            </p>
          </div>

          <div
            className={`space-y-3 rounded-xl transition ${
              errors.payment_method
                ? "border border-red-500 bg-red-50/40 p-3 dark:bg-red-950/20"
                : ""
            }`}
          >
            {ticket > 0 && (
              <Radio
                id="Ticket"
                name="methodSelect"
                value="Ticket"
                label={`Төлбөрийн эрх ашиглах (Боломжит эрх: ${ticket})`}
                checked={values.payment_method === "Ticket"}
                onChange={(value) => onChange("payment_method", value)}
              />
            )}

            <Radio
              id="Wallet"
              name="methodSelect"
              value="Wallet"
              label={`Данснаас төлөх (Үлдэгдэл: ${Number(balance).toLocaleString("en-US")} ₮)`}
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
        </Card>
      </div>
    </div>
  );
}
