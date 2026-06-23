export interface ValidationError {
  field: string;
  message: string;
}

export interface ServerConfig {
  name: string;
  version: string;
  category: string;
  description: string;
  maintainer: string;
  connectionString: string;
  tools: Array<{
    name: string;
    description: string;
    scope: string;
  }>;
  accessPolicy: Record<string, 'auto' | 'manual'>;
}

export function validateServerConfig(config: ServerConfig): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!config.name || config.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Server name is required' });
  }

  if (!config.version || !/^\d+\.\d+\.\d+$/.test(config.version)) {
    errors.push({ field: 'version', message: 'Version must be in format X.Y.Z' });
  }

  if (!config.category || config.category.trim().length === 0) {
    errors.push({ field: 'category', message: 'Category is required' });
  }

  if (!config.description || config.description.trim().length < 10) {
    errors.push({ field: 'description', message: 'Description must be at least 10 characters' });
  }

  if (!config.maintainer || config.maintainer.trim().length === 0) {
    errors.push({ field: 'maintainer', message: 'Maintainer is required' });
  }

  if (!config.connectionString || config.connectionString.trim().length === 0) {
    errors.push({ field: 'connectionString', message: 'Connection string is required' });
  }

  if (!config.tools || config.tools.length === 0) {
    errors.push({ field: 'tools', message: 'At least one tool is required' });
  } else {
    config.tools.forEach((tool, index) => {
      if (!tool.name || tool.name.trim().length === 0) {
        errors.push({ field: `tools.${index}.name`, message: `Tool ${index + 1} name is required` });
      }
      if (!tool.description || tool.description.trim().length === 0) {
        errors.push({ field: `tools.${index}.description`, message: `Tool ${index + 1} description is required` });
      }
      if (!tool.scope || tool.scope.trim().length === 0) {
        errors.push({ field: `tools.${index}.scope`, message: `Tool ${index + 1} scope is required` });
      }
    });
  }

  return errors;
}

export function validateJSON(jsonString: string): { valid: boolean; error?: string; parsed?: any } {
  try {
    const parsed = JSON.parse(jsonString);
    return { valid: true, parsed };
  } catch (error) {
    return { valid: false, error: (error as Error).message };
  }
}
