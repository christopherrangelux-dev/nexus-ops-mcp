import { AgentConnection } from '../types';

interface AgentConnectionsPanelProps {
  connections: AgentConnection[];
}

function formatConnectionDate(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function ScopePills({ scopes }: { scopes: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {scopes.map((scope) => (
        <span
          key={scope}
          className="px-3 py-1 bg-[#ECE9F3] text-[#382B5F] rounded-full text-xs"
        >
          {scope}
        </span>
      ))}
    </div>
  );
}

export function AgentConnectionsPanel({ connections }: AgentConnectionsPanelProps) {
  if (connections.length === 0) {
    return (
      <div className="bg-white rounded border border-[#E7E0D2] p-8 text-center text-[#8A8170]">
        No agents have connected to this server yet
      </div>
    );
  }

  return (
    <div className="bg-white rounded border border-[#E7E0D2]">
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#FBF7F1]">
            <tr>
              <th className="text-left px-4 py-3 text-sm text-[#221F1B]">Agent</th>
              <th className="text-left px-4 py-3 text-sm text-[#221F1B]">Connected</th>
              <th className="text-left px-4 py-3 text-sm text-[#221F1B]">Last active</th>
              <th className="text-left px-4 py-3 text-sm text-[#221F1B]">Scopes used</th>
            </tr>
          </thead>
          <tbody>
            {connections.map((connection) => (
              <tr
                key={connection.id}
                className="border-t border-[#E7E0D2] hover:bg-[#FBF7F1] transition-colors"
              >
                <td className="px-4 py-3 text-sm text-[#221F1B]">{connection.agentName}</td>
                <td className="px-4 py-3 text-sm text-[#8A8170] whitespace-nowrap">
                  {formatConnectionDate(connection.connectedAt)}
                </td>
                <td className="px-4 py-3 text-sm text-[#8A8170] whitespace-nowrap">
                  {formatConnectionDate(connection.lastActiveAt)}
                </td>
                <td className="px-4 py-3">
                  <ScopePills scopes={connection.scopesUsed} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden divide-y divide-[#E7E0D2]">
        {connections.map((connection) => (
          <div key={connection.id} className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="text-sm text-[#221F1B]">{connection.agentName}</p>
              <span className="text-xs text-[#8A8170] whitespace-nowrap">
                {formatConnectionDate(connection.lastActiveAt)}
              </span>
            </div>
            <p className="text-xs text-[#8A8170] mb-2">
              Connected {formatConnectionDate(connection.connectedAt)}
            </p>
            <ScopePills scopes={connection.scopesUsed} />
          </div>
        ))}
      </div>
    </div>
  );
}
