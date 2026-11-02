import React from "react";

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({
  className = "",
  children,
  ...props
}) => {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-200/70 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
      <table className={`w-full text-left text-xs ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className = "",
  children,
  ...props
}) => {
  return (
    <thead
      className={`bg-[#FAFBFD] border-b border-slate-100 text-slate-400 font-bold text-[10px] uppercase tracking-wider ${className}`}
      {...props}
    >
      {children}
    </thead>
  );
};

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className = "",
  children,
  ...props
}) => {
  return (
    <tbody className={`divide-y divide-slate-100 text-slate-700 ${className}`} {...props}>
      {children}
    </tbody>
  );
};

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  className = "",
  children,
  ...props
}) => {
  return (
    <tr
      className={`hover:bg-slate-50/70 transition-colors ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
};

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  className = "",
  children,
  ...props
}) => {
  return (
    <th className={`py-4 px-5 font-bold ${className}`} {...props}>
      {children}
    </th>
  );
};

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  className = "",
  children,
  ...props
}) => {
  return (
    <td className={`py-3.5 px-5 text-slate-700 font-medium ${className}`} {...props}>
      {children}
    </td>
  );
};
