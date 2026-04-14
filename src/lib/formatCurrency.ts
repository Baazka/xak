export const formatCurrency = (val: string | number | null | undefined) => {
  if (val === null || val === undefined || val === "") return "";

  const num = Number(val);
  if (isNaN(num)) return "";

  return num.toLocaleString("mn-MN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
