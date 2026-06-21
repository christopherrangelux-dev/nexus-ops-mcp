import { useState } from 'react';
import { X, Send, CheckCircle2, AlertCircle, Terminal } from 'lucide-react';
import { ServerConfig } from './validation';

interface SandboxPanelProps {
  serverConfig: ServerConfig;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface ExecutionLog {
  toolName: string;
  request: any;
  response: any;
  status: 'success' | 'error';
  timestamp: Date;
}

export function SandboxPanel({ serverConfig, onClose }: SandboxPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content: `Connected to ${serverConfig.name} (v${serverConfig.version}) sandbox. Available tools: ${serverConfig.tools.map(t => t.name).join(', ')}`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Simulate tool detection and execution
    const mentionedTool = serverConfig.tools.find((tool) =>
      input.toLowerCase().includes(tool.name.toLowerCase().replace(/_/g, ' '))
    );

    setTimeout(() => {
      if (mentionedTool) {
        // Create execution log
        const log: ExecutionLog = {
          toolName: mentionedTool.name,
          request: {
            method: mentionedTool.name,
            params: { query: input },
          },
          response: {
            status: 200,
            data: { result: 'Mock response from ' + mentionedTool.name },
          },
          status: 'success',
          timestamp: new Date(),
        };
        setExecutionLogs((prev) => [...prev, log]);

        const assistantMessage: Message = {
          role: 'assistant',
          content: `I executed the "${mentionedTool.name}" tool with scope "${mentionedTool.scope}". The tool returned successfully with mock data. Check the execution logs for details.`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const assistantMessage: Message = {
          role: 'assistant',
          content: `I don't see a request that requires calling any of the available tools. Try asking something like "get account summary" or "process payment" to test the tools.`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    }, 500);

    setInput('');
  };

  return (
    <div className="fixed right-0 top-0 h-screen w-full sm:w-[400px] bg-[#1E1E1E] shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#3E3E3E]">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-green-400" />
          <h3 className="text-white">Test Sandbox</h3>
        </div>
        <button
          onClick={onClose}
          className="text-[#8A8170] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tab Toggle */}
      <div className="flex border-b border-[#3E3E3E]">
        <button
          onClick={() => setShowLogs(false)}
          className={`flex-1 px-4 py-2 text-sm ${
            !showLogs
              ? 'bg-[#2E2E2E] text-white border-b-2 border-green-400'
              : 'text-[#8A8170] hover:text-white'
          }`}
        >
          Chat Interface
        </button>
        <button
          onClick={() => setShowLogs(true)}
          className={`flex-1 px-4 py-2 text-sm ${
            showLogs
              ? 'bg-[#2E2E2E] text-white border-b-2 border-green-400'
              : 'text-[#8A8170] hover:text-white'
          }`}
        >
          Execution Logs ({executionLogs.length})
        </button>
      </div>

      {/* Content */}
      {!showLogs ? (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`${
                  message.role === 'user'
                    ? 'ml-8'
                    : message.role === 'system'
                    ? 'bg-[#2E2E2E] rounded p-3'
                    : 'mr-8'
                }`}
              >
                <div className="flex items-start gap-2">
                  {message.role === 'system' && (
                    <Terminal className="w-4 h-4 text-green-400 mt-1" />
                  )}
                  <div className="flex-1">
                    <div className="text-xs text-[#8A8170] mb-1">
                      {message.role === 'user' ? 'You' : message.role === 'system' ? 'System' : 'Assistant'}
                    </div>
                    <div className={`text-sm ${message.role === 'system' ? 'text-green-400' : 'text-white'}`}>
                      {message.content}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-[#3E3E3E]">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Test your MCP tools..."
                className="flex-1 px-3 py-2 bg-[#2E2E2E] text-white border border-[#3E3E3E] rounded"
              />
              <button
                onClick={handleSend}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {executionLogs.length > 0 ? (
            executionLogs.map((log, index) => (
              <div key={index} className="bg-[#2E2E2E] rounded p-3">
                <div className="flex items-center gap-2 mb-2">
                  {log.status === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  )}
                  <code className="text-sm text-green-400">{log.toolName}</code>
                  <span className="text-xs text-[#8A8170] ml-auto">
                    {log.timestamp.toLocaleTimeString()}
                  </span>
                </div>

                <div className="space-y-2">
                  <div>
                    <div className="text-xs text-[#8A8170] mb-1">Request:</div>
                    <pre className="text-xs text-white bg-[#1E1E1E] p-2 rounded overflow-x-auto">
                      {JSON.stringify(log.request, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <div className="text-xs text-[#8A8170] mb-1">Response:</div>
                    <pre className="text-xs text-white bg-[#1E1E1E] p-2 rounded overflow-x-auto">
                      {JSON.stringify(log.response, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-[#8A8170] text-sm">
              No execution logs yet. Start chatting to test your tools.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
