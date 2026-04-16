import UserMultiSelect from "@/app/(admin)/(new-pages)/notifications/components/UserMultiSelect";
import Select, { SingleValue } from "react-select";
import { useTheme } from "@/context/ThemeContext";

export type StepTwoData = {
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
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const selectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      backgroundColor: isDark ? "#111827" : "#ffffff",
      borderColor: state.isFocused ? "#3b82f6" : isDark ? "#374151" : "#d1d5db",
      color: isDark ? "#f9fafb" : "#111827",
    }),
    menuPortal: (base: any) => ({
      ...base,
      zIndex: 9999,
    }),

    menu: (base: any) => ({
      ...base,
      zIndex: 9999,
      backgroundColor: isDark ? "#111827" : "#ffffff",
      color: isDark ? "#f9fafb" : "#111827",
    }),

    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused ? (isDark ? "#1f2937" : "#f3f4f6") : "transparent",
      color: isDark ? "#f9fafb" : "#111827",
    }),

    singleValue: (base: any) => ({
      ...base,
      color: isDark ? "#f9fafb" : "#111827",
    }),

    input: (base: any) => ({
      ...base,
      color: isDark ? "#f9fafb" : "#111827",
    }),

    placeholder: (base: any) => ({
      ...base,
      color: isDark ? "#9ca3af" : "#6b7280",
    }),
  };

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
          styles={selectStyles}
          menuPortalTarget={document.body}
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
          styles={selectStyles}
          menuPortalTarget={document.body}
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
          styles={selectStyles}
          menuPortalTarget={document.body}
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
