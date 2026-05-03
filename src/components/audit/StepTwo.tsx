import UserMultiSelect from "@/app/(admin)/(new-pages)/notifications/components/UserMultiSelect";
import { FormErrors } from "@/utils/validation";
import { useTheme } from "@/context/ThemeContext";
import Select, { SingleValue } from "react-select";

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
  errors?: FormErrors<StepTwoData>;
  userOptions: UserOption[];
  onChange: <K extends keyof StepTwoData>(field: K, value: StepTwoData[K]) => void;
  useMenuPortal?: boolean;
};

export default function StepTwo({
  values,
  errors = {},
  userOptions,
  onChange,
  useMenuPortal = true,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const renderError = (field: keyof StepTwoData) =>
    errors[field] ? <p className="mt-1 text-xs text-red-500">{errors[field]}</p> : null;

  const getSelectClass = (field: keyof StepTwoData) =>
    errors[field] ? "rounded-lg border border-red-500" : "";

  const selectedApprover = userOptions.find((opt) => opt.value === values.usertype3) ?? null;

  const selectedQualityReviewer = userOptions.find((opt) => opt.value === values.usertype4) ?? null;

  const selectedSeniorAuditor = userOptions.find((opt) => opt.value === values.usertype5) ?? null;

  const multiUsers: UserItem[] = userOptions.map((u) => ({
    user_id: u.value,
    user_firstname: u.label,
    user_phone: "",
    user_email: "",
  }));

  const formatOptionLabel = (option: UserOption) => (
    <div className="flex flex-col">
      <span>{option.label}</span>
      {option.regNo && (
        <span className="text-xs text-gray-500 dark:text-gray-400">{option.regNo}</span>
      )}
    </div>
  );

  const makeSelectStyles = (field: keyof StepTwoData) => ({
    control: (base: any, state: any) => ({
      ...base,
      minHeight: "38px",
      backgroundColor: isDark ? "#111827" : "#ffffff",
      borderWidth: "1px",
      borderColor: errors[field]
        ? "#ef4444"
        : state.isFocused
          ? "#3b82f6"
          : isDark
            ? "#374151"
            : "#d1d5db",
      boxShadow: errors[field]
        ? "0 0 0 1px #ef4444"
        : state.isFocused
          ? "0 0 0 1px #3b82f6"
          : "none",
      "&:hover": {
        borderColor: errors[field] ? "#ef4444" : "#3b82f6",
      },
    }),
    menuPortal: (base: any) => ({
      ...base,
      zIndex: 9999,
    }),
    menu: (base: any) => ({
      ...base,
      zIndex: 9999,
      backgroundColor: isDark ? "#111827" : "#ffffff",
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
  });

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
        <div>
          <Select<UserOption, false>
            options={userOptions}
            value={selectedApprover}
            onChange={handleUserApproverChange}
            placeholder="Нэрээр нь хайх..."
            isSearchable
            isClearable
            styles={makeSelectStyles("usertype3")}
            formatOptionLabel={formatOptionLabel}
            menuPortalTarget={useMenuPortal ? document.body : undefined}
          />
        </div>
        {renderError("usertype3")}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Чанарын хяналт</label>
        <div>
          <Select<UserOption, false>
            options={userOptions}
            value={selectedQualityReviewer}
            onChange={handleUserQualityReviewerChange}
            placeholder="Нэрээр нь хайх..."
            isSearchable
            isClearable
            styles={makeSelectStyles("usertype4")}
            formatOptionLabel={formatOptionLabel}
            menuPortalTarget={useMenuPortal ? document.body : undefined}
          />
        </div>
        {renderError("usertype4")}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Ахлах аудитор</label>
        <div>
          <Select<UserOption, false>
            options={userOptions}
            value={selectedSeniorAuditor}
            onChange={handleUserSeniorAuditorChange}
            placeholder="Нэрээр нь хайх..."
            isSearchable
            isClearable
            styles={makeSelectStyles("usertype5")}
            formatOptionLabel={formatOptionLabel}
            menuPortalTarget={useMenuPortal ? document.body : undefined}
          />
        </div>
        {renderError("usertype5")}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Аудитор</label>
        <div className={getSelectClass("usertype6")}>
          <UserMultiSelect
            users={multiUsers}
            value={values.usertype6}
            onChange={(selected) => onChange("usertype6", selected)}
          />
        </div>
        {renderError("usertype6")}
      </div>
    </div>
  );
}
