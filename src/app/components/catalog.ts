export interface CatalogScope {
  id: string;
  name: string;
  description: string;
  level: 'PUBLIC' | 'INTERNAL' | 'RESTRICTED';
  owner: string;
  category: string;
}

export const catalogScopes: CatalogScope[] = [
  {
    id: 'read:customer.account',
    name: 'read:customer.account',
    description: 'Read-only access to customer account summaries',
    level: 'INTERNAL',
    owner: 'Customer Data',
    category: 'Customer Data',
  },
  {
    id: 'read:customer.profile',
    name: 'read:customer.profile',
    description: 'Read customer profile information',
    level: 'INTERNAL',
    owner: 'Customer Data',
    category: 'Customer Data',
  },
  {
    id: 'write:customer.profile',
    name: 'write:customer.profile',
    description: 'Modify customer profile data',
    level: 'RESTRICTED',
    owner: 'Customer Data',
    category: 'Customer Data',
  },
  {
    id: 'read:customer.usage',
    name: 'read:customer.usage',
    description: 'Access usage history',
    level: 'INTERNAL',
    owner: 'Customer Data',
    category: 'Customer Data',
  },
  {
    id: 'execute:payment.process',
    name: 'execute:payment.process',
    description: 'Process payment transactions',
    level: 'RESTRICTED',
    owner: 'Billing Team',
    category: 'Billing Operations',
  },
  {
    id: 'execute:payment.refund',
    name: 'execute:payment.refund',
    description: 'Issue customer refunds',
    level: 'RESTRICTED',
    owner: 'Billing Team',
    category: 'Billing Operations',
  },
  {
    id: 'read:payment.settlement',
    name: 'read:payment.settlement',
    description: 'Query payment settlement status',
    level: 'INTERNAL',
    owner: 'Billing Team',
    category: 'Billing Operations',
  },
  {
    id: 'execute:risk.score',
    name: 'execute:risk.score',
    description: 'Calculate risk scores for platform activity',
    level: 'INTERNAL',
    owner: 'Security Engineering',
    category: 'Risk & Compliance',
  },
  {
    id: 'read:security.anomalies',
    name: 'read:security.anomalies',
    description: 'Access anomaly detection patterns',
    level: 'RESTRICTED',
    owner: 'Security Engineering',
    category: 'Risk & Compliance',
  },
  {
    id: 'write:security.alerts',
    name: 'write:security.alerts',
    description: 'Create security alert notifications',
    level: 'RESTRICTED',
    owner: 'Security Engineering',
    category: 'Risk & Compliance',
  },
  {
    id: 'read:documents.content',
    name: 'read:documents.content',
    description: 'Read uploaded document content',
    level: 'INTERNAL',
    owner: 'Document Processing',
    category: 'Document Management',
  },
  {
    id: 'read:documents.metadata',
    name: 'read:documents.metadata',
    description: 'Access document metadata and classifications',
    level: 'PUBLIC',
    owner: 'Document Processing',
    category: 'Document Management',
  },
  {
    id: 'write:documents.reports',
    name: 'write:documents.reports',
    description: 'Generate and save document reports',
    level: 'INTERNAL',
    owner: 'Document Processing',
    category: 'Document Management',
  },
  {
    id: 'read:documents.validate',
    name: 'read:documents.validate',
    description: 'Validate uploaded document formats and metadata',
    level: 'INTERNAL',
    owner: 'Document Processing',
    category: 'Document Management',
  },
  {
    id: 'read:warehouse.segments',
    name: 'read:warehouse.segments',
    description: 'Query customer segmentation data',
    level: 'INTERNAL',
    owner: 'Analytics Platform',
    category: 'Analytics',
  },
  {
    id: 'read:warehouse.kpis',
    name: 'read:warehouse.kpis',
    description: 'Access business KPI metrics',
    level: 'PUBLIC',
    owner: 'Analytics Platform',
    category: 'Analytics',
  },
  {
    id: 'read:warehouse.export',
    name: 'read:warehouse.export',
    description: 'Export datasets for analysis',
    level: 'INTERNAL',
    owner: 'Analytics Platform',
    category: 'Analytics',
  },
];

export function searchCatalogScopes(query: string): CatalogScope[] {
  if (!query.trim()) return catalogScopes.slice(0, 10);

  const lowerQuery = query.toLowerCase();
  return catalogScopes.filter(
    (scope) =>
      scope.name.toLowerCase().includes(lowerQuery) ||
      scope.description.toLowerCase().includes(lowerQuery) ||
      scope.category.toLowerCase().includes(lowerQuery)
  );
}

export function getScopeLevelColor(level: CatalogScope['level']): string {
  switch (level) {
    case 'PUBLIC':
      return 'bg-green-100 text-green-800';
    case 'INTERNAL':
      return 'bg-blue-100 text-blue-800';
    case 'RESTRICTED':
      return 'bg-red-100 text-red-800';
  }
}
