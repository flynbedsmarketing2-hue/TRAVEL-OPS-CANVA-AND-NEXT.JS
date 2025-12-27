import type { ReactNode } from "react";
import { Card } from "./card";
import { Table, THead, TBody, TR, TH, TD } from "./table";

type Column<T> = {
  key: keyof T | string;
  header: string;
  render?: (row: T) => ReactNode;
  align?: "left" | "right" | "center";
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  emptyState?: ReactNode;
};

export function DataTable<T>({ columns, data, emptyState }: DataTableProps<T>) {
  if (!data.length && emptyState) {
    return <Card className="p-8 text-center">{emptyState}</Card>;
  }
  return (
    <Table>
      <THead>
        <TR>
          {columns.map((col) => (
            <TH key={col.key as string} className={col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : ""}>
              {col.header}
            </TH>
          ))}
        </TR>
      </THead>
      <TBody>
        {data.map((row, idx) => (
          <TR key={idx}>
            {columns.map((col) => (
              <TD key={col.key as string} className={col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : ""}>
                {col.render ? col.render(row) : (row as unknown as Record<string, unknown>)[col.key as string]}
              </TD>
            ))}
          </TR>
        ))}
      </TBody>
    </Table>
  );
}
