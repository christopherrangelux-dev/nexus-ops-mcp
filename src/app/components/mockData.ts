import { MCPServer, AuditEntry, AccessGrant, AgentConnection } from './types';

export const mockServers: MCPServer[] = [
  {
    id: 'mcp-customer-data',
    name: 'Customer Data MCP',
    version: '2.4.1',
    status: 'APPROVED',
    category: 'Customer Data',
    description: 'Secure access to customer profiles, account summaries, and usage history',
    tools: [
      { name: 'get_account_summary', description: 'Retrieve current account summary', scope: 'read:customer.account', approved: true },
      { name: 'get_user_profile', description: 'Fetch customer profile data', scope: 'read:customer.profile', approved: true },
      { name: 'get_usage_history', description: 'Query usage history records', scope: 'read:customer.usage', approved: true },
      { name: 'update_contact_info', description: 'Modify customer contact details', scope: 'write:customer.profile', approved: true },
    ],
    connectionString: 'npx -y @modelcontextprotocol/server-customer-data',
    maintainer: 'Platform Team',
    lastUpdated: '2026-04-10',
    requestedScopes: ['read:customer.account', 'read:customer.profile', 'read:customer.usage', 'write:customer.profile'],
    allowedScopes: ['read:customer.account', 'read:customer.profile', 'read:customer.usage', 'write:customer.profile'],
    accessPolicy: {
      'read:customer.account': 'auto',
      'read:customer.profile': 'auto',
      'read:customer.usage': 'auto',
      'write:customer.profile': 'manual',
    },
  },
  {
    id: 'mcp-security-analytics',
    name: 'Security Analytics MCP',
    version: '1.8.0',
    status: 'APPROVED',
    category: 'Security & Compliance',
    description: 'Real-time anomaly detection and risk scoring engine',
    tools: [
      { name: 'calculate_risk_score', description: 'Compute risk score for an event', scope: 'execute:risk.score', approved: true },
      { name: 'check_anomaly_indicators', description: 'Analyze anomaly patterns', scope: 'read:security.anomalies', approved: true },
      { name: 'flag_suspicious_activity', description: 'Mark activity for review', scope: 'write:security.alerts', approved: true },
    ],
    connectionString: 'docker run -p 3000:3000 acme-corp/mcp-security-analytics:1.8.0',
    maintainer: 'Security Engineering',
    lastUpdated: '2026-04-15',
    requestedScopes: ['execute:risk.score', 'read:security.anomalies', 'write:security.alerts'],
    allowedScopes: ['execute:risk.score', 'read:security.anomalies', 'write:security.alerts'],
    accessPolicy: {
      'execute:risk.score': 'manual',
      'read:security.anomalies': 'auto',
      'write:security.alerts': 'manual',
    },
  },
  {
    id: 'mcp-document-processor',
    name: 'Document Intelligence MCP',
    version: '3.1.0',
    status: 'REJECTED',
    category: 'Document Processing',
    description: 'OCR, classification, and extraction for uploaded documents',
    tools: [
      { name: 'extract_document_data', description: 'Parse uploaded document forms', scope: 'read:documents.content', approved: false },
      { name: 'classify_document_type', description: 'Auto-categorize uploaded docs', scope: 'read:documents.metadata', approved: false },
      { name: 'generate_pdf_summary', description: 'Create executive summaries', scope: 'write:documents.reports', approved: false },
      { name: 'validate_document_format', description: 'Check uploaded files meet format requirements', scope: 'read:documents.validate', approved: false },
    ],
    connectionString: 'mcp://example.local/document-processor',
    maintainer: 'Data Science Team',
    lastUpdated: '2026-04-17',
    requestedScopes: ['read:documents.content', 'read:documents.metadata', 'write:documents.reports', 'read:documents.validate'],
    allowedScopes: ['read:documents.content', 'read:documents.metadata', 'write:documents.reports'],
    accessPolicy: {
      'read:documents.content': 'auto',
      'read:documents.metadata': 'auto',
      'write:documents.reports': 'manual',
      'read:documents.validate': 'auto',
    },
  },
  {
    id: 'mcp-billing-payments',
    name: 'Billing & Payments MCP',
    version: '2.0.5',
    status: 'APPROVED',
    category: 'Infrastructure',
    description: 'Payment processing, refunds, and transaction settlement for platform billing',
    tools: [
      { name: 'process_payment', description: 'Execute payment transaction', scope: 'execute:payment.process', approved: true },
      { name: 'issue_refund', description: 'Process customer refund', scope: 'execute:payment.refund', approved: true },
      { name: 'check_settlement_status', description: 'Query settlement state', scope: 'read:payment.settlement', approved: true },
    ],
    connectionString: 'https://api.example.local/mcp/billing',
    maintainer: 'Billing Team',
    lastUpdated: '2026-04-12',
    requestedScopes: ['execute:payment.process', 'execute:payment.refund', 'read:payment.settlement'],
    allowedScopes: ['execute:payment.process', 'execute:payment.refund', 'read:payment.settlement'],
    accessPolicy: {
      'execute:payment.process': 'manual',
      'execute:payment.refund': 'manual',
      'read:payment.settlement': 'auto',
    },
  },
  {
    id: 'mcp-analytics-warehouse',
    name: 'Data Warehouse Connector',
    version: '1.5.2',
    status: 'APPROVED',
    category: 'Analytics',
    description: 'Read-only access to platform data warehouse',
    tools: [
      { name: 'query_customer_segments', description: 'Run segmentation queries', scope: 'read:warehouse.segments', approved: true },
      { name: 'fetch_kpi_metrics', description: 'Retrieve business KPIs', scope: 'read:warehouse.kpis', approved: true },
      { name: 'export_dataset', description: 'Export data for analysis', scope: 'read:warehouse.export', approved: true },
    ],
    connectionString: 'jdbc:postgresql://warehouse.example.local:5432/analytics',
    maintainer: 'Analytics Platform',
    lastUpdated: '2026-04-08',
    requestedScopes: ['read:warehouse.segments', 'read:warehouse.kpis', 'read:warehouse.export'],
    allowedScopes: ['read:warehouse.segments', 'read:warehouse.kpis', 'read:warehouse.export'],
    accessPolicy: {
      'read:warehouse.segments': 'auto',
      'read:warehouse.kpis': 'auto',
      'read:warehouse.export': 'manual',
    },
  },
];

export const categories = [
  'All Servers',
  'Customer Data',
  'Security & Compliance',
  'Document Processing',
  'Analytics',
  'Infrastructure',
];

export const mockAuditEntries: AuditEntry[] = [
  // Customer Data MCP — full trail
  {
    id: 'audit-1',
    serverId: 'mcp-customer-data',
    action: 'registered',
    actor: 'Platform Team',
    occurredAt: '2026-02-02T09:15:00Z',
    detail: 'Server registered with 4 tools across 2 scopes for review.',
  },
  {
    id: 'audit-2',
    serverId: 'mcp-customer-data',
    action: 'approved',
    actor: 'Security Engineering',
    occurredAt: '2026-02-05T14:30:00Z',
    detail: 'All requested scopes approved without modification.',
  },
  {
    id: 'audit-3',
    serverId: 'mcp-customer-data',
    action: 'access_granted',
    actor: 'Security Engineering',
    occurredAt: '2026-02-20T11:00:00Z',
    detail: "Granted 'read:customer.profile' to Support Tools Team.",
  },
  {
    id: 'audit-4',
    serverId: 'mcp-customer-data',
    action: 'access_granted',
    actor: 'Security Engineering',
    occurredAt: '2026-03-04T16:45:00Z',
    detail: "Granted 'write:customer.profile' to Growth Engineering.",
  },
  {
    id: 'audit-5',
    serverId: 'mcp-customer-data',
    action: 'agent_connected',
    actor: 'Support Tools Team',
    occurredAt: '2026-03-10T08:20:00Z',
    detail: "Claude Code connected using scope 'read:customer.profile'.",
  },
  {
    id: 'audit-6',
    serverId: 'mcp-customer-data',
    action: 'agent_connected',
    actor: 'Growth Engineering',
    occurredAt: '2026-03-22T13:05:00Z',
    detail: "Internal Support Agent connected using scope 'write:customer.profile'.",
  },

  // Document Intelligence MCP — rejected
  {
    id: 'audit-7',
    serverId: 'mcp-document-processor',
    action: 'registered',
    actor: 'Data Science Team',
    occurredAt: '2026-04-17T10:00:00Z',
    detail: 'Server registered with 4 tools requesting document content and reporting scopes.',
  },
  {
    id: 'audit-8',
    serverId: 'mcp-document-processor',
    action: 'rejected',
    actor: 'Security Engineering',
    occurredAt: '2026-04-19T15:40:00Z',
    detail: "Rejected: 'write:documents.reports' would let the tool generate and export summaries containing unredacted document content with no retention controls in place.",
  },

  // Security Analytics MCP
  {
    id: 'audit-9',
    serverId: 'mcp-security-analytics',
    action: 'registered',
    actor: 'Security Engineering',
    occurredAt: '2026-01-18T09:00:00Z',
    detail: 'Server registered with 3 tools covering risk scoring and anomaly detection.',
  },
  {
    id: 'audit-10',
    serverId: 'mcp-security-analytics',
    action: 'approved',
    actor: 'Security Engineering',
    occurredAt: '2026-01-22T12:10:00Z',
    detail: 'Approved for production use after sandbox review.',
  },

  // Billing & Payments MCP
  {
    id: 'audit-11',
    serverId: 'mcp-billing-payments',
    action: 'registered',
    actor: 'Billing Team',
    occurredAt: '2026-03-01T09:30:00Z',
    detail: 'Server registered with 3 tools covering payment processing and settlement.',
  },
  {
    id: 'audit-12',
    serverId: 'mcp-billing-payments',
    action: 'approved',
    actor: 'Security Engineering',
    occurredAt: '2026-03-06T11:15:00Z',
    detail: 'Approved with manual review required on refund and payment execution scopes.',
  },

  // Data Warehouse Connector
  {
    id: 'audit-13',
    serverId: 'mcp-analytics-warehouse',
    action: 'registered',
    actor: 'Analytics Platform',
    occurredAt: '2026-03-28T10:45:00Z',
    detail: 'Server registered with 3 read-only tools for warehouse access.',
  },
  {
    id: 'audit-14',
    serverId: 'mcp-analytics-warehouse',
    action: 'approved',
    actor: 'Security Engineering',
    occurredAt: '2026-03-30T14:00:00Z',
    detail: 'Approved as read-only; export scope flagged for manual access review.',
  },
];

export const mockAccessGrants: AccessGrant[] = [
  {
    id: 'grant-1',
    serverId: 'mcp-customer-data',
    scope: 'read:customer.profile',
    requestedBy: 'Support Tools Team',
    status: 'approved',
    requestedAt: '2026-02-18T09:00:00Z',
    resolvedAt: '2026-02-20T11:00:00Z',
  },
  {
    id: 'grant-2',
    serverId: 'mcp-customer-data',
    scope: 'write:customer.profile',
    requestedBy: 'Growth Engineering',
    status: 'approved',
    requestedAt: '2026-03-02T10:30:00Z',
    resolvedAt: '2026-03-04T16:45:00Z',
  },
  {
    id: 'grant-3',
    serverId: 'mcp-billing-payments',
    scope: 'execute:payment.refund',
    requestedBy: 'Customer Success Team',
    status: 'pending',
    requestedAt: '2026-04-21T13:00:00Z',
  },
];

export const mockAgentConnections: AgentConnection[] = [
  // Customer Data MCP — heavily adopted
  {
    id: 'conn-1',
    serverId: 'mcp-customer-data',
    agentName: 'Claude Code',
    connectedAt: '2026-03-10T08:20:00Z',
    lastActiveAt: '2026-04-22T17:05:00Z',
    scopesUsed: ['read:customer.profile', 'read:customer.account'],
  },
  {
    id: 'conn-2',
    serverId: 'mcp-customer-data',
    agentName: 'Internal Support Agent',
    connectedAt: '2026-03-22T13:05:00Z',
    lastActiveAt: '2026-04-21T09:40:00Z',
    scopesUsed: ['write:customer.profile'],
  },
  {
    id: 'conn-3',
    serverId: 'mcp-customer-data',
    agentName: 'Billing Reconciliation Agent',
    connectedAt: '2026-03-30T10:00:00Z',
    lastActiveAt: '2026-04-20T15:30:00Z',
    scopesUsed: ['read:customer.usage', 'read:customer.account'],
  },
  {
    id: 'conn-4',
    serverId: 'mcp-customer-data',
    agentName: 'Onboarding Concierge Agent',
    connectedAt: '2026-04-05T11:25:00Z',
    lastActiveAt: '2026-04-22T08:10:00Z',
    scopesUsed: ['read:customer.profile'],
  },

  // Security Analytics MCP — heavily adopted
  {
    id: 'conn-5',
    serverId: 'mcp-security-analytics',
    agentName: 'Claude Code',
    connectedAt: '2026-01-25T09:00:00Z',
    lastActiveAt: '2026-04-22T12:00:00Z',
    scopesUsed: ['read:security.anomalies', 'execute:risk.score'],
  },
  {
    id: 'conn-6',
    serverId: 'mcp-security-analytics',
    agentName: 'Fraud Triage Agent',
    connectedAt: '2026-02-08T14:15:00Z',
    lastActiveAt: '2026-04-19T16:50:00Z',
    scopesUsed: ['write:security.alerts', 'execute:risk.score'],
  },
  {
    id: 'conn-7',
    serverId: 'mcp-security-analytics',
    agentName: 'Incident Response Agent',
    connectedAt: '2026-02-19T10:45:00Z',
    lastActiveAt: '2026-04-21T11:20:00Z',
    scopesUsed: ['read:security.anomalies'],
  },

  // Billing & Payments MCP — lighter adoption
  {
    id: 'conn-8',
    serverId: 'mcp-billing-payments',
    agentName: 'Claude Code',
    connectedAt: '2026-03-12T09:50:00Z',
    lastActiveAt: '2026-04-18T10:05:00Z',
    scopesUsed: ['read:payment.settlement'],
  },
  {
    id: 'conn-9',
    serverId: 'mcp-billing-payments',
    agentName: 'Refund Processing Agent',
    connectedAt: '2026-03-20T13:30:00Z',
    lastActiveAt: '2026-04-15T14:45:00Z',
    scopesUsed: ['execute:payment.refund'],
  },

  // mcp-analytics-warehouse intentionally has zero connections (empty-state demo)
];
