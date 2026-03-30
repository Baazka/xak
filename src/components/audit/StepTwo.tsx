import UserMultiSelect from "@/app/(admin)/(new-pages)/notifications/components/UserMultiSelect";
import Select, { SingleValue } from "react-select";

type StepTwoData = {
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

type UserItem = {
  user_id: number;
  user_firstname: string;
  user_phone: string;
  user_email: string;
};

type Props = {
  values: StepTwoData;
  userOptions: UserOption[];
  onChange: <K extends keyof StepTwoData>(field: K, value: StepTwoData[K]) => void;
};

export default function StepTwo({ values, userOptions, onChange }: Props) {
  const selectedApprover = userOptions.find((opt) => opt.value === values.usertype3) ?? null;
  const selectedQualityReviewer = userOptions.find((opt) => opt.value === values.usertype4) ?? null;
  const selectedSeniorAuditor = userOptions.find((opt) => opt.value === values.usertype5) ?? null;

  const multiUsers: UserItem[] = userOptions.map((u) => ({
    user_id: u.value,
    user_firstname: u.label,
    user_phone: "",
    user_email: "",
  }));
  const handleUserApproverChange = (selected: SingleValue<UserOption>) => {
    onChange("usertype3", selected?.value ?? 0);
  };
  const handleUserQualityReviewerChange = (selected: SingleValue<UserOption>) => {
    onChange("usertype4", selected?.value ?? 0);
  };
  const handleUserSeniorAuditorChange = (selected: SingleValue<UserOption>) => {
    onChange("usertype5", selected?.value ?? 0);
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <label className="block text-sm font-medium">Батлах хэрэглэгч</label>
        <Select<UserOption, false>
          options={userOptions}
          value={selectedApprover}
          onChange={handleUserApproverChange}
          placeholder="Нэрээр нь хайх..."
          isSearchable
          isClearable
          formatOptionLabel={(option) => (
            <div className="flex flex-col">
              <span>{option.label}</span>
              {option.regNo && <span className="text-xs text-gray-500">{option.regNo}</span>}
            </div>
          )}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Чанарын хяналт</label>
        <Select<UserOption, false>
          options={userOptions}
          value={selectedQualityReviewer}
          onChange={handleUserQualityReviewerChange}
          placeholder="Нэрээр нь хайх..."
          isSearchable
          isClearable
          formatOptionLabel={(option) => (
            <div className="flex flex-col">
              <span>{option.label}</span>
              {option.regNo && <span className="text-xs text-gray-500">{option.regNo}</span>}
            </div>
          )}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Ахлах аудитор </label>
        <Select<UserOption, false>
          options={userOptions}
          value={selectedSeniorAuditor}
          onChange={handleUserSeniorAuditorChange}
          placeholder="Нэрээр нь хайх..."
          isSearchable
          isClearable
          formatOptionLabel={(option) => (
            <div className="flex flex-col">
              <span>{option.label}</span>
              {option.regNo && <span className="text-xs text-gray-500">{option.regNo}</span>}
            </div>
          )}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Аудитор</label>
        <UserMultiSelect
          users={multiUsers}
          value={values.usertype6}
          onChange={(selected) => onChange("usertype6", selected)}
        />
      </div>
    </div>
  );
}
