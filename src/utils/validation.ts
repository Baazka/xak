export type FormErrors<T> = Partial<Record<keyof T, string>>;

export type ValidationRule = {
  required?: boolean;
  label?: string;
  pattern?: RegExp;
  message?: string;
};

export type ValidationSchema<T> = Partial<Record<keyof T, ValidationRule>>;

export const validateForm = <T extends Record<string, any>>(
  form: T,
  schema: ValidationSchema<T>
): FormErrors<T> => {
  const errors: FormErrors<T> = {};

  Object.entries(schema).forEach(([key, rule]) => {
    const field = key as keyof T;
    const value = String(form[field] ?? "").trim();

    if (rule?.required && !value) {
      errors[field] = `${rule.label ?? "Талбар"} заавал бөглөх`;
      return;
    }

    if (rule?.pattern && value && !rule.pattern.test(value)) {
      errors[field] = rule.message ?? `${rule.label ?? "Талбар"} буруу байна`;
    }
  });

  return errors;
};
