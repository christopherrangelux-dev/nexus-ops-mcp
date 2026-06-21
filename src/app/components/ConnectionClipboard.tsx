import { useState } from 'react';
import { Copy, Check, ChevronDown } from 'lucide-react';
import { MCPServer } from './types';
import { generateConnectionConfig } from './utils';

interface ConnectionClipboardProps {
  server: MCPServer;
}

export function ConnectionClipboard({ server }: ConnectionClipboardProps) {
  const [format, setFormat] = useState<'JSON' | 'YAML' | 'SHELL'>('JSON');
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const configString = generateConnectionConfig(server, format);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(configString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-[#E7E0D2] rounded p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[#221F1B]">Connection Configuration</h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#FBF7F1] border border-[#E7E0D2] rounded hover:bg-[#F1ECE2] transition-colors"
            >
              <span className="text-sm">{format}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {isOpen && (
              <div className="absolute right-0 mt-1 bg-white border border-[#E7E0D2] rounded shadow-lg z-10">
                {(['JSON', 'YAML', 'SHELL'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      setFormat(f);
                      setIsOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-[#FBF7F1]"
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-1.5 bg-[#C2752E] text-white rounded hover:bg-[#9C5E25] transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>

      <pre className="bg-[#221F1B] text-green-400 p-4 rounded overflow-x-auto text-sm font-mono">
        {configString}
      </pre>

      <p className="mt-3 text-xs text-[#8A8170]">
        Add this configuration to your Claude Code settings or IDE extension to enable this MCP server.
      </p>
    </div>
  );
}
