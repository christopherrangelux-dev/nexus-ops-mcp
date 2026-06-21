export type MCPServerStatus = 'APPROVED' | 'PENDING' | 'REJECTED';

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
}

export type ViewMode = 'GRAPH' | 'LIST';
