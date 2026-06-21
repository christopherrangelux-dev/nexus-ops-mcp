import { MCPServer } from './types';
import { Lock, Unlock, Database, Cpu, Cloud, ArrowRight, ArrowDown } from 'lucide-react';

interface NodeGraphViewProps {
  server: MCPServer;
}

function Connector() {
  return (
    <div className="flex items-center justify-center text-[#C2752E] flex-shrink-0">
      <div className="flex flex-col items-center md:hidden">
        <div className="w-0.5 h-6 bg-[#C2752E]" />
        <ArrowDown className="w-4 h-4 -mt-1" />
      </div>
      <div className="hidden md:flex items-center">
        <div className="w-8 h-0.5 bg-[#C2752E]" />
        <ArrowRight className="w-4 h-4 -ml-1" />
      </div>
    </div>
  );
}

export function NodeGraphView({ server }: NodeGraphViewProps) {
  const groupedTools = server.tools.reduce((acc, tool) => {
    if (!acc[tool.scope]) {
      acc[tool.scope] = [];
    }
    acc[tool.scope].push(tool);
    return acc;
  }, {} as Record<string, typeof server.tools>);

  return (
    <div className="bg-white p-4 sm:p-8 rounded border border-[#E7E0D2]">
      <div className="flex flex-col items-center gap-2 md:flex-row md:justify-center">
        <div className="w-40 sm:w-44 h-24 rounded-lg border-2 bg-[#C2752E] border-[#9C5E25] flex flex-col items-center justify-center gap-1 text-white flex-shrink-0">
          <Cpu className="w-6 h-6" />
          <span className="text-sm">AI Model</span>
        </div>

        <Connector />

        <div className="w-40 sm:w-44 h-24 rounded-lg border-2 bg-white border-[#C2752E] flex flex-col items-center justify-center gap-1 px-2 text-center flex-shrink-0">
          <Cloud className="w-7 h-7 text-[#C2752E]" />
          <span className="text-sm text-[#221F1B] truncate w-full">{server.name}</span>
          <span className="text-xs text-[#8A8170]">v{server.version}</span>
        </div>

        <Connector />

        <div className="flex flex-col gap-3 w-full max-w-xs sm:max-w-none sm:w-64">
          {Object.entries(groupedTools).map(([scope, tools]) => {
            const isApproved = server.allowedScopes.includes(scope);
            const LockIcon = isApproved ? Unlock : Lock;

            return (
              <div
                key={scope}
                className={`flex items-center justify-between gap-3 rounded-lg border-2 px-4 py-3 ${
                  isApproved
                    ? 'bg-green-50 border-green-600'
                    : 'bg-red-50 border-red-500 border-dashed'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Database className={`w-5 h-5 flex-shrink-0 ${isApproved ? 'text-green-600' : 'text-red-600'}`} />
                  <div className="min-w-0">
                    <div className="text-xs text-[#221F1B] font-mono truncate">{scope}</div>
                    <div className="text-[10px] text-[#8A8170]">{tools.length} tools</div>
                  </div>
                </div>
                <LockIcon className={`w-5 h-5 flex-shrink-0 ${isApproved ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4 sm:gap-6 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-green-600"></div>
          <span className="text-[#8A8170]">Approved Scope</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-red-600 border-dashed border-t-2 border-red-600"></div>
          <span className="text-[#8A8170]">Pending Approval</span>
        </div>
      </div>
    </div>
  );
}
