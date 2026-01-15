import { cn } from "@/lib/utils";

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className={cn("min-w-full divide-y divide-slate-200", className)}>
          {children}
        </table>
      </div>
    </div>
  );
}

export function TableHeader({ children, className }: TableProps) {
  return (
    <thead className={cn("bg-slate-50/80", className)}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className }: TableProps) {
  return (
    <tbody className={cn("divide-y divide-slate-100 bg-white", className)}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className }: TableProps) {
  return (
    <tr className={cn(
      "transition-colors duration-150",
      "hover:bg-slate-50/50",
      className
    )}>
      {children}
    </tr>
  );
}

interface TableCellProps {
  children?: React.ReactNode;
  className?: string;
  header?: boolean;
  colSpan?: number;
}

export function TableCell({ children, className, header, colSpan }: TableCellProps) {
  if (header) {
    return (
      <th
        colSpan={colSpan}
        className={cn(
          "px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider",
          className
        )}
      >
        {children}
      </th>
    );
  }

  return (
    <td
      colSpan={colSpan}
      className={cn(
        "px-5 py-4 text-sm text-slate-600",
        className
      )}
    >
      {children}
    </td>
  );
}
