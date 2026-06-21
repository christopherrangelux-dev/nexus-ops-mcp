import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { MCPServer } from './types';

interface ApprovalDiffProps {
  server: MCPServer;
  onApprove?: () => void;
  onReject?: () => void;
}

export function ApprovalDiff({ server, onApprove, onReject }: ApprovalDiffProps) {
  const deniedScopes = server.requestedScopes.filter(
    (scope) => !server.allowedScopes.includes(scope)
  );

  return (
    <div className="bg-white border-2 border-amber-500 rounded p-6">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="w-6 h-6 text-amber-500" />
        <h3 className="text-lg text-[#221F1B]">Pending Security Approval</h3>
      </div>

      <p className="text-sm text-[#8A8170] mb-6">
        This MCP server is awaiting security review. Compare requested scopes against platform policy:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <h4 className="text-sm text-green-900">Approved Scopes ({server.allowedScopes.length})</h4>
          </div>
          <ul className="space-y-2">
            {server.allowedScopes.map((scope) => (
              <li key={scope} className="text-xs font-mono text-green-800 bg-white px-2 py-1 rounded">
                {scope}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-red-50 border border-red-200 rounded p-4">
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="w-5 h-5 text-red-600" />
            <h4 className="text-sm text-red-900">Denied Scopes ({deniedScopes.length})</h4>
          </div>
          {deniedScopes.length > 0 ? (
            <ul className="space-y-2">
              {deniedScopes.map((scope) => (
                <li key={scope} className="text-xs font-mono text-red-800 bg-white px-2 py-1 rounded">
                  {scope}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-red-600">All requested scopes approved</p>
          )}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded p-4 mb-6">
        <h4 className="text-sm text-amber-900 mb-2">Security Rationale</h4>
        <p className="text-xs text-amber-800">
          {deniedScopes.length > 0
            ? `Scope "${deniedScopes[0]}" exceeds platform data classification policy and requires additional review before approval.`
            : 'All requested scopes comply with platform security policy.'}
        </p>
      </div>

      {onApprove && onReject && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={onApprove}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            Approve Server
          </button>
          <button
            onClick={onReject}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            <XCircle className="w-4 h-4" />
            Reject Server
          </button>
        </div>
      )}
    </div>
  );
}
