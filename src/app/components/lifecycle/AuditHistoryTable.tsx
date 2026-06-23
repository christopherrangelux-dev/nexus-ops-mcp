import { AuditEntry } from '../types';
import { getAuditActionColor } from '../utils';

interface AuditHistoryTableProps {
  entries: AuditEntry[];
}

function formatAuditAction(action: string): string {
  return action
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatOccurredAt(occurredAt: string): string {
  const date = new Date(occurredAt);
  if (Number.isNaN(date.getTime())) {
    return occurredAt;
  }
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function AuditHistoryTable({ entries }: AuditHistoryTableProps) {
  if (entries.length === 0) {
    return (
      <div className="bg-white rounded border border-[#E7E0D2] p-8 text-center text-[#8A8170]">
        No history yet
      </div>
    );
  }

  return (
    <div className="bg-white rounded border border-[#E7E0D2]">
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#FBF7F1]">
            <tr>
              <th className="text-left px-4 py-3 text-sm text-[#221F1B]">Action</th>
              <th className="text-left px-4 py-3 text-sm text-[#221F1B]">Actor</th>
              <th className="text-left px-4 py-3 text-sm text-[#221F1B]">When</th>
              <th className="text-left px-4 py-3 text-sm text-[#221F1B]">Detail</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr
                key={entry.id}
                className="border-t border-[#E7E0D2] hover:bg-[#FBF7F1] transition-colors"
              >
                <td className="px-4 py-3">
                  <span className={`${getAuditActionColor(entry.action)} inline-block px-2 py-1 rounded text-xs`}>
                    {formatAuditAction(entry.action)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-[#221F1B]">{entry.actor}</td>
                <td className="px-4 py-3 text-sm text-[#8A8170] whitespace-nowrap">
                  {formatOccurredAt(entry.occurredAt)}
                </td>
                <td className="px-4 py-3 text-sm text-[#221F1B]">{entry.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden divide-y divide-[#E7E0D2]">
        {entries.map((entry) => (
          <div key={entry.id} className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className={`${getAuditActionColor(entry.action)} inline-block px-2 py-1 rounded text-xs flex-shrink-0`}>
                {formatAuditAction(entry.action)}
              </span>
              <span className="text-xs text-[#8A8170] whitespace-nowrap">{formatOccurredAt(entry.occurredAt)}</span>
            </div>
            <p className="text-sm text-[#221F1B] mb-1">{entry.actor}</p>
            <p className="text-sm text-[#8A8170]">{entry.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
