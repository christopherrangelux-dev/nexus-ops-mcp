import { Search } from 'lucide-react';
import { MCPServer } from './types';
import { ServerCard } from './ServerCard';
import { useState } from 'react';

interface RegistryViewProps {
  servers: MCPServer[];
  onServerSelect: (server: MCPServer) => void;
}

export function RegistryView({ servers, onServerSelect }: RegistryViewProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredServers = servers.filter(
    (server) =>
      server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      server.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      server.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[#FBF7F1]">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl text-[#221F1B] mb-2">MCP Server Registry</h1>
          <p className="text-[#8A8170]">
            Discover and deploy secure, vetted Model Context Protocol servers across your platform
          </p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A8170]" />
            <input
              type="text"
              placeholder="Search MCP servers by name, description, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-[#E7E0D2] rounded"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServers.map((server) => (
            <ServerCard
              key={server.id}
              server={server}
              onClick={() => onServerSelect(server)}
            />
          ))}
        </div>

        {filteredServers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#8A8170]">No MCP servers match your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
