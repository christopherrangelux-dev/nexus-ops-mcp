import { useState } from 'react';
import { ArrowLeft, Network, List } from 'lucide-react';
import { MCPServer, ViewMode } from './types';
import { NodeGraphView } from './NodeGraphView';
import { TableView } from './TableView';
import { ConnectionClipboard } from './ConnectionClipboard';
import { ApprovalDiff } from './ApprovalDiff';
import { getStatusColor } from './utils';
import { mockAuditEntries } from './mockData';
import { AuditHistoryTable } from './lifecycle/AuditHistoryTable';

interface ServerDetailProps {
  server: MCPServer;
  onBack: () => void;
}

export function ServerDetail({ server, onBack }: ServerDetailProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('GRAPH');

  return (
    <div className="flex-1 overflow-y-auto bg-[#FBF7F1]">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#8A8170] hover:text-[#221F1B] mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Registry</span>
          </button>

          <div className="bg-white border border-[#E7E0D2] rounded p-6">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
              <div>
                <h1 className="text-2xl text-[#221F1B] mb-2">{server.name}</h1>
                <p className="text-[#8A8170]">{server.description}</p>
              </div>
              <span className={`${getStatusColor(server.status)} px-3 py-1 rounded flex-shrink-0`}>
                {server.status}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-[#8A8170]">Version</span>
                <p className="text-[#221F1B]">{server.version}</p>
              </div>
              <div>
                <span className="text-[#8A8170]">Maintainer</span>
                <p className="text-[#221F1B]">{server.maintainer}</p>
              </div>
              <div>
                <span className="text-[#8A8170]">Category</span>
                <p className="text-[#221F1B]">{server.category}</p>
              </div>
              <div>
                <span className="text-[#8A8170]">Last Updated</span>
                <p className="text-[#221F1B]">{server.lastUpdated}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Approval Workflow for Pending Servers */}
        {server.status === 'PENDING' && (
          <div className="mb-6">
            <ApprovalDiff server={server} />
          </div>
        )}

        {/* Policy View Toggle */}
        <div className="mb-6">
          <div className="bg-white border border-[#E7E0D2] rounded p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg text-[#221F1B]">Permission Policy View</h2>
              <div className="flex items-center gap-2 bg-[#FBF7F1] rounded p-1 self-start">
                <button
                  onClick={() => setViewMode('GRAPH')}
                  className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                    viewMode === 'GRAPH'
                      ? 'bg-white text-[#C2752E] shadow-sm'
                      : 'text-[#8A8170] hover:text-[#221F1B]'
                  }`}
                >
                  <Network className="w-4 h-4" />
                  <span className="text-sm">Strategic Map</span>
                </button>
                <button
                  onClick={() => setViewMode('LIST')}
                  className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                    viewMode === 'LIST'
                      ? 'bg-white text-[#C2752E] shadow-sm'
                      : 'text-[#8A8170] hover:text-[#221F1B]'
                  }`}
                >
                  <List className="w-4 h-4" />
                  <span className="text-sm">Execution List</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic View Renderer */}
        <div className="mb-6">
          {viewMode === 'GRAPH' ? (
            <NodeGraphView server={server} />
          ) : (
            <TableView server={server} />
          )}
        </div>

        {/* Connection Config (only for approved servers) */}
        {server.status === 'APPROVED' && (
          <ConnectionClipboard server={server} />
        )}

        {/* History (always visible, regardless of status) */}
        <div className="mt-6">
          <h2 className="text-lg text-[#221F1B] mb-3">History</h2>
          <AuditHistoryTable
            entries={mockAuditEntries
              .filter((entry) => entry.serverId === server.id)
              .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())}
          />
        </div>
      </div>
    </div>
  );
}
