import { ArrowRight } from 'lucide-react';
import { MCPServer } from './types';

interface ServerDirectoryCardProps {
  server: MCPServer;
  onClick: () => void;
}

export function ServerDirectoryCard({ server, onClick }: ServerDirectoryCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white border border-[#E7E0D2] rounded p-4 hover:shadow-md transition-shadow text-left"
    >
      <h3 className="text-[#221F1B] mb-1">{server.name}</h3>
      <p className="text-sm text-[#8A8170] mb-3 line-clamp-2">{server.description}</p>

      <div className="flex items-center justify-between text-xs text-[#8A8170] mb-3">
        <span>{server.tools.length} tools available</span>
        <span>{server.maintainer}</span>
      </div>

      <div className="flex items-center gap-1 text-sm text-[#C2752E]">
        <span>View &amp; request access</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </div>
    </button>
  );
}
