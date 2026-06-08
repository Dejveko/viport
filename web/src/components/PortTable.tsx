import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';
import type { Port } from '../types';

const col = createColumnHelper<Port>();

const columns = [
  col.accessor('port', {
    header: 'Port',
    cell: (c) => <span className="font-mono font-semibold text-white">{c.getValue()}</span>,
  }),
  col.accessor('protocol', {
    header: 'Proto',
    cell: (c) => <span className="font-mono uppercase text-white/70">{c.getValue()}</span>,
  }),
  col.accessor('state', { header: 'State', cell: (c) => <span className="text-white/70">{c.getValue()}</span> }),
  col.accessor('localAddress', {
    header: 'Address',
    cell: (c) => <span className="font-mono text-white/70">{c.getValue()}</span>,
  }),
  col.accessor((r) => r.processName ?? '', {
    id: 'process',
    header: 'Process',
    cell: (c) => c.getValue() || <span className="text-white/30">—</span>,
  }),
  col.accessor((r) => r.unit ?? '', {
    id: 'unit',
    header: 'Service',
    cell: (c) =>
      c.getValue() ? <span className="text-sky-300">{c.getValue()}</span> : <span className="text-white/30">—</span>,
  }),
  col.accessor('externallyReachable', {
    header: 'Reach',
    cell: (c) =>
      c.getValue() ? (
        <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-300">exposed</span>
      ) : (
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/50">local</span>
      ),
  }),
];

export function PortTable({ ports }: { ports: Port[] }) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'port', desc: false }]);

  const table = useReactTable({
    data: ports,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-xl border border-white/10">
      <table className="w-full text-sm">
        <thead className="bg-white/5 text-left text-xs uppercase tracking-wide text-white/50">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((h) => (
                <th
                  key={h.id}
                  onClick={h.column.getToggleSortingHandler()}
                  className="cursor-pointer select-none px-4 py-2.5 hover:text-white/80"
                >
                  {flexRender(h.column.columnDef.header, h.getContext())}
                  {{ asc: ' ↑', desc: ' ↓' }[h.column.getIsSorted() as string] ?? ''}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-t border-white/5 hover:bg-white/5">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
          {ports.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-white/40">
                No ports match the current filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
