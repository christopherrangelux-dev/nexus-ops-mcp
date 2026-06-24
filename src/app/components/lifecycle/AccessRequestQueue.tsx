import { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, XCircle } from 'lucide-react';
import { AccessGrant, MCPServer } from '../types';

interface AccessRequestQueueProps {
  grants: AccessGrant[];
  allServers: MCPServer[];
  onApprove: (grant: AccessGrant) => void;
  onReject: (grant: AccessGrant) => void;
}

function formatRequestedAt(requestedAt: string): string {
  const date = new Date(requestedAt);
  if (Number.isNaN(date.getTime())) {
    return requestedAt;
  }
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function AccessRequestQueue({ grants, allServers, onApprove, onReject }: AccessRequestQueueProps) {
  const [expanded, setExpanded] = useState(true);
  const pendingGrants = grants.filter((grant) => grant.status === 'pending');

  if (pendingGrants.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 bg-white border border-[#E7E0D2] rounded">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4"
      >
        <span className="text-[#221F1B]">
          Pending Access Requests ({pendingGrants.length})
        </span>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-[#8A8170]" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[#8A8170]" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-[#E7E0D2] divide-y divide-[#E7E0D2]">
          {pendingGrants.map((grant) => {
            const server = allServers.find((s) => s.id === grant.serverId);
            return (
              <div
                key={grant.id}
                className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                  <span className="text-sm text-[#221F1B]">{server?.name ?? grant.serverId}</span>
                  <span className="inline-block px-3 py-1 bg-[#ECE9F3] text-[#382B5F] rounded-full text-sm self-start sm:self-auto">
                    {grant.scope}
                  </span>
                  <span className="text-sm text-[#8A8170]">{grant.requestedBy}</span>
                  <span className="text-xs text-[#8A8170] whitespace-nowrap">
                    {formatRequestedAt(grant.requestedAt)}
                  </span>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => onApprove(grant)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm">Approve</span>
                  </button>
                  <button
                    onClick={() => onReject(grant)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    <span className="text-sm">Reject</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
