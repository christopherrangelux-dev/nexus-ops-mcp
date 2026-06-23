export type MCPServerStatus = 'APPROVED' | 'PENDING' | 'REJECTED' | 'DEACTIVATED';

export interface MCPTool {
  name: string;
  description: string;
  scope: string;
  approved: boolean;
}

export interface MCPServer {
  id: string;
  name: string;
  version: string;
  status: MCPServerStatus;
  category: string;
  description: string;
  tools: MCPTool[];
  connectionString: string;
  maintainer: string;
  lastUpdated: string;
  requestedScopes: string[];
  allowedScopes: string[];
  accessPolicy: Record<string, 'auto' | 'manual'>;
}

export type ViewMode = 'GRAPH' | 'LIST';

export type AuditAction =
  | 'registered' | 'approved' | 'rejected'
  | 'access_requested' | 'access_granted' | 'access_revoked'
  | 'agent_connected' | 'deactivated' | 'reactivated';

export interface AuditEntry {
  id: string;
  serverId: string;
  action: AuditAction;
  actor: string;
  occurredAt: string;
  detail: string;
}

export type AccessGrantStatus = 'pending' | 'approved' | 'rejected' | 'revoked';

export interface AccessGrant {
  id: string;
  serverId: string;
  scope: string;
  requestedBy: string;
  status: AccessGrantStatus;
  requestedAt: string;
  resolvedAt?: string;
}

export interface AgentConnection {
  id: string;
  serverId: string;
  agentName: string;
  connectedAt: string;
  lastActiveAt: string;
  scopesUsed: string[];
}
