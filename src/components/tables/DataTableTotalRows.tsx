"use client";

type TotalRowsProps = {
  total: number;
};

export function TotalRows({ total }: TotalRowsProps) {
  return <div className="text-sm text-muted-foreground">Total: {total} rows</div>;
}
