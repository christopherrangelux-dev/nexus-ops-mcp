import { MCPServer } from './types';
import { Lock, Unlock, Search } from 'lucide-react';
import { useState } from 'react';

interface TableViewProps {
  server: MCPServer;
}

export function TableView({ server }: TableViewProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTools = server.tools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.scope.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded border border-[#E7E0D2]">
      <div className="p-4 border-b border-[#E7E0D2]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8170]" />
          <input
            type="text"
            placeholder="Search tools, scopes, descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#FBF7F1] border border-[#E7E0D2] rounded"
          />
        </div>
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#FBF7F1]">
            <tr>
              <th className="text-left px-4 py-3 text-sm text-[#221F1B]">Tool Name</th>
              <th className="text-left px-4 py-3 text-sm text-[#221F1B]">Description</th>
              <th className="text-left px-4 py-3 text-sm text-[#221F1B]">Permission Scope</th>
              <th className="text-center px-4 py-3 text-sm text-[#221F1B]">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTools.map((tool, index) => {
              const isApproved = server.allowedScopes.includes(tool.scope);
              const LockIcon = isApproved ? Unlock : Lock;

              return (
                <tr
                  key={`${tool.name}-${index}`}
                  className="border-t border-[#E7E0D2] hover:bg-[#FBF7F1] transition-colors"
                >
                  <td className="px-4 py-3">
                    <code className="text-sm text-[#221F1B] bg-[#F1ECE2] px-2 py-1 rounded font-mono">
                      {tool.name}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#221F1B]">{tool.description}</td>
                  <td className="px-4 py-3">
                    <code className="text-xs text-[#8A8170] font-mono">{tool.scope}</code>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                          isApproved
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        <LockIcon className="w-3 h-3" />
                        {isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredTools.length === 0 && (
          <div className="text-center py-12 text-[#8A8170]">
            No tools match your search criteria
          </div>
        )}
      </div>

      <div className="md:hidden divide-y divide-[#E7E0D2]">
        {filteredTools.map((tool, index) => {
          const isApproved = server.allowedScopes.includes(tool.scope);
          const LockIcon = isApproved ? Unlock : Lock;

          return (
            <div key={`${tool.name}-${index}`} className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <code className="text-sm text-[#221F1B] bg-[#F1ECE2] px-2 py-1 rounded font-mono">
                  {tool.name}
                </code>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs flex-shrink-0 ${
                    isApproved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  <LockIcon className="w-3 h-3" />
                  {isApproved ? 'Approved' : 'Pending'}
                </span>
              </div>
              <p className="text-sm text-[#221F1B] mb-2">{tool.description}</p>
              <code className="text-xs text-[#8A8170] font-mono">{tool.scope}</code>
            </div>
          );
        })}

        {filteredTools.length === 0 && (
          <div className="text-center py-12 text-[#8A8170]">
            No tools match your search criteria
          </div>
        )}
      </div>
    </div>
  );
}
