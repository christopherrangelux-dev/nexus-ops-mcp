import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { MCPServer } from './types';
import { getStatusColor } from './utils';

interface ServerCardProps {
  server: MCPServer;
  onClick: () => void;
}

export function ServerCard({ server, onClick }: ServerCardProps) {
  const StatusIcon = server.status === 'APPROVED' ? CheckCircle2 : server.status === 'PENDING' ? Clock : XCircle;

  return (
    <button
      onClick={onClick}
      className="w-full bg-white border border-[#E7E0D2] rounded p-4 hover:shadow-md transition-shadow text-left"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-[#221F1B] mb-1">{server.name}</h3>
          <p className="text-sm text-[#8A8170]">v{server.version}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`${getStatusColor(server.status)} px-2 py-1 rounded text-xs flex items-center gap-1`}>
            <StatusIcon className="w-3 h-3" />
            {server.status}
          </span>
        </div>
      </div>

      <p className="text-sm text-[#221F1B] mb-3 line-clamp-2">{server.description}</p>

      <div className="flex items-center justify-between text-xs text-[#8A8170]">
        <span>{server.tools.length} tools available</span>
        <span>{server.maintainer}</span>
      </div>
    </button>
  );
}
