export function isScopeApproved(scope: string, allowedScopes: string[]): boolean {
  return allowedScopes.includes(scope);
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'APPROVED':
      return 'bg-blue-600 text-white';
    case 'PENDING':
      return 'bg-amber-500 text-white';
    case 'REJECTED':
      return 'bg-red-600 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
}

export function generateConnectionConfig(server: any, format: 'JSON' | 'YAML' | 'SHELL'): string {
  if (format === 'JSON') {
    return JSON.stringify(
      {
        mcpServers: {
          [server.id]: {
            command: server.connectionString,
            scopes: server.allowedScopes,
          },
        },
      },
      null,
      2
    );
  }

  if (format === 'YAML') {
    return `mcpServers:
  ${server.id}:
    command: "${server.connectionString}"
    scopes:
${server.allowedScopes.map((s: string) => `      - ${s}`).join('\n')}`;
  }

  // SHELL
  return `# Add to your shell profile
export MCP_SERVER_${server.id.toUpperCase().replace(/-/g, '_')}="${server.connectionString}"
export MCP_SCOPES="${server.allowedScopes.join(',')}"`;
}
