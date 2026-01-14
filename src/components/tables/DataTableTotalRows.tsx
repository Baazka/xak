"use client";

type TotalRowsProps = {
  total: number;
};

export function TotalRows({ total }: TotalRowsProps) {
  return <div className="text-sm text-muted-foreground">Нийт: {total} </div>;
}
