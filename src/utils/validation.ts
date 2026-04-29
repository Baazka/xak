export type FormErrors<T> = Partial<Record<keyof T, string>>;

export type ValidationRule = {
  required?: boolean;
  label?: string;
  pattern?: RegExp;
  message?: string;
};

export type ValidationSchema<T> = Partial<Record<keyof T, ValidationRule>>;

const isEmptyValue = (value: unknown) => {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (typeof value === "number") return value === 0;
  if (Array.isArray(value)) return value.length === 0;
  return false;
};

export const validateForm = <T extends Record<string, any>>(
  form: T,
  schema: ValidationSchema<T>
): FormErrors<T> => {
  const errors: FormErrors<T> = {};

  Object.entries(schema).forEach(([key, rule]) => {
    const field = key as keyof T;
    const value = form[field];
    const strValue = String(value ?? "").trim();

    if (rule?.required && isEmptyValue(value)) {
      errors[field] = `${rule.label ?? "Талбар"} заавал бөглөх`;
      return;
    }

    if (rule?.pattern && strValue && !rule.pattern.test(strValue)) {
      errors[field] = rule.message ?? `${rule.label ?? "Талбар"} буруу байна`;
    }
  });

  return errors;
};
