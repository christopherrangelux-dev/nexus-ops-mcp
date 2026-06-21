import { useState } from 'react';
import { ArrowLeft, Search, CheckCircle2 } from 'lucide-react';
import { MCPServer } from './types';
import { ServerDirectoryCard } from './ServerDirectoryCard';

interface DiscoveryViewProps {
  servers: MCPServer[];
}

export function DiscoveryView({ servers }: DiscoveryViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedServer, setSelectedServer] = useState<MCPServer | null>(null);
  const [requestedIds, setRequestedIds] = useState<Set<string>>(new Set());

  const availableServers = servers.filter((server) => server.status === 'APPROVED');

  const filteredServers = availableServers.filter(
    (server) =>
      server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      server.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      server.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRequestAccess = (id: string) => {
    setRequestedIds((prev) => new Set(prev).add(id));
  };

  if (selectedServer) {
    const isRequested = requestedIds.has(selectedServer.id);

    return (
      <div className="flex-1 overflow-y-auto bg-[#FBF7F1]">
        <div className="max-w-3xl mx-auto p-6">
          <button
            onClick={() => setSelectedServer(null)}
            className="flex items-center gap-2 text-[#8A8170] hover:text-[#221F1B] mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Directory</span>
          </button>

          <div className="bg-white border border-[#E7E0D2] rounded p-6 mb-6">
            <h1 className="text-2xl text-[#221F1B] mb-2">{selectedServer.name}</h1>
            <p className="text-[#8A8170] mb-4">{selectedServer.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-[#8A8170]">Version</span>
                <p className="text-[#221F1B]">{selectedServer.version}</p>
              </div>
              <div>
                <span className="text-[#8A8170]">Maintainer</span>
                <p className="text-[#221F1B]">{selectedServer.maintainer}</p>
              </div>
              <div>
                <span className="text-[#8A8170]">Category</span>
                <p className="text-[#221F1B]">{selectedServer.category}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E7E0D2] rounded p-6 mb-6">
            <h2 className="text-lg text-[#221F1B] mb-4">Available Tools</h2>
            <ul className="space-y-3">
              {selectedServer.tools.map((tool) => (
                <li key={tool.name} className="border-b border-[#E7E0D2] pb-3 last:border-0 last:pb-0">
                  <code className="text-sm text-[#221F1B] font-mono">{tool.name}</code>
                  <p className="text-sm text-[#8A8170] mt-1">{tool.description}</p>
                </li>
              ))}
            </ul>
          </div>

          {isRequested ? (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded p-4 text-green-800">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm">Access request submitted — you'll be notified once approved.</span>
            </div>
          ) : (
            <button
              onClick={() => handleRequestAccess(selectedServer.id)}
              className="px-6 py-2 bg-[#C2752E] text-white rounded hover:bg-[#9C5E25] transition-colors"
            >
              Request Access
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#FBF7F1]">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl text-[#221F1B] mb-2">MCP Server Directory</h1>
          <p className="text-[#8A8170]">
            Browse available MCP servers and request access — no admin setup required
          </p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A8170]" />
            <input
              type="text"
              placeholder="Search servers by name, description, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-[#E7E0D2] rounded"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServers.map((server) => (
            <ServerDirectoryCard
              key={server.id}
              server={server}
              onClick={() => setSelectedServer(server)}
            />
          ))}
        </div>

        {filteredServers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#8A8170]">No servers match your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
