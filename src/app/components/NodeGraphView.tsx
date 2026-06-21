import { MCPServer } from './types';
import { Lock, Unlock, Database, Cpu, Cloud } from 'lucide-react';

interface NodeGraphViewProps {
  server: MCPServer;
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
    <div className="bg-white p-8 rounded border border-[#E7E0D2] min-h-[500px]">
      <div className="flex items-center justify-center">
        <svg width="100%" height="600" className="overflow-visible">
          {/* Model Node (Left) */}
          <g transform="translate(100, 250)">
            <rect
              x="-60"
              y="-40"
              width="120"
              height="80"
              rx="8"
              fill="#C2752E"
              stroke="#9C5E25"
              strokeWidth="2"
            />
            <foreignObject x="-50" y="-30" width="100" height="60">
              <div className="flex flex-col items-center justify-center h-full text-white">
                <Cpu className="w-6 h-6 mb-1" />
                <span className="text-sm">AI Model</span>
              </div>
            </foreignObject>
          </g>

          {/* MCP Server Node (Center) */}
          <g transform="translate(400, 250)">
            <rect
              x="-80"
              y="-50"
              width="160"
              height="100"
              rx="8"
              fill="#ffffff"
              stroke="#C2752E"
              strokeWidth="2"
            />
            <foreignObject x="-70" y="-40" width="140" height="80">
              <div className="flex flex-col items-center justify-center h-full">
                <Cloud className="w-8 h-8 mb-2 text-[#C2752E]" />
                <span className="text-sm text-[#221F1B]">{server.name}</span>
                <span className="text-xs text-[#8A8170]">v{server.version}</span>
              </div>
            </foreignObject>
          </g>

          {/* Connection Line: Model to MCP */}
          <line
            x1="160"
            y1="250"
            x2="320"
            y2="250"
            stroke="#C2752E"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
          />

          {/* API Resources Nodes (Right) */}
          {Object.entries(groupedTools).map(([scope, tools], index) => {
            const yPos = 100 + index * 120;
            const isApproved = server.allowedScopes.includes(scope);
            const LockIcon = isApproved ? Unlock : Lock;

            return (
              <g key={scope} transform={`translate(700, ${yPos})`}>
                {/* Connection Line: MCP to Resource */}
                <line
                  x1="-220"
                  y1={250 - yPos}
                  x2="-90"
                  y2="0"
                  stroke={isApproved ? "#10b981" : "#ef4444"}
                  strokeWidth="2"
                  strokeDasharray={isApproved ? "0" : "5,5"}
                  markerEnd={isApproved ? "url(#arrowhead-approved)" : "url(#arrowhead-denied)"}
                />

                {/* Resource Node */}
                <rect
                  x="-80"
                  y="-40"
                  width="160"
                  height="80"
                  rx="8"
                  fill={isApproved ? "#f0fdf4" : "#fef2f2"}
                  stroke={isApproved ? "#10b981" : "#ef4444"}
                  strokeWidth="2"
                />
                <foreignObject x="-70" y="-30" width="140" height="60">
                  <div className="flex items-center justify-between h-full px-2">
                    <div className="flex-1">
                      <Database className={`w-5 h-5 mb-1 ${isApproved ? 'text-green-600' : 'text-red-600'}`} />
                      <div className="text-xs text-[#221F1B] font-mono">{scope}</div>
                      <div className="text-[10px] text-[#8A8170]">{tools.length} tools</div>
                    </div>
                    <LockIcon className={`w-5 h-5 ${isApproved ? 'text-green-600' : 'text-red-600'}`} />
                  </div>
                </foreignObject>
              </g>
            );
          })}

          {/* Arrow Markers */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#C2752E" />
            </marker>
            <marker
              id="arrowhead-approved"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#10b981" />
            </marker>
            <marker
              id="arrowhead-denied"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#ef4444" />
            </marker>
          </defs>
        </svg>
      </div>

      <div className="mt-6 flex items-center gap-6 justify-center text-sm">
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
