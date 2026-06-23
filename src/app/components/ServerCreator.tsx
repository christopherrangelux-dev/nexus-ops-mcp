import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, CheckCircle, AlertCircle, TestTube2, Code, FormInput } from 'lucide-react';
import { ServerConfig, validateServerConfig, ValidationError, validateJSON } from './validation';
import { ScopeSearch } from './ScopeSearch';
import { SandboxPanel } from './SandboxPanel';
import { categories as allCategories, mockAuditEntries } from './mockData';
import { MCPServer, MCPTool } from './types';

interface ServerCreatorProps {
  onBack: () => void;
  onSubmit?: (server: MCPServer) => void;
}

const categories = allCategories.filter((c) => c !== 'All Servers');

const STEPS = [
  { id: 1, label: 'Register' },
  { id: 2, label: 'Tools & Resources' },
  { id: 3, label: 'Configure Access' },
  { id: 4, label: 'Review & Confirm' },
];

export function ServerCreator({ onBack, onSubmit }: ServerCreatorProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [viewMode, setViewMode] = useState<'FORM' | 'CODE'>('FORM');
  const [showSandbox, setShowSandbox] = useState(false);
  const [recentScopes, setRecentScopes] = useState<string[]>([]);

  const [config, setConfig] = useState<ServerConfig>({
    name: '',
    version: '1.0.0',
    category: categories[0],
    description: '',
    maintainer: '',
    connectionString: '',
    tools: [],
    accessPolicy: {},
  });

  const [jsonCode, setJsonCode] = useState('');
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [jsonError, setJsonError] = useState<string>('');

  // Sync config to JSON when in CODE view
  useEffect(() => {
    if (viewMode === 'CODE') {
      setJsonCode(JSON.stringify(config, null, 2));
    }
  }, [viewMode]);

  // Validate in real-time
  useEffect(() => {
    const validationErrors = validateServerConfig(config);
    setErrors(validationErrors);
  }, [config]);

  // Ensure every scope currently in use has a default access policy of 'manual'
  useEffect(() => {
    const uniqueScopes = [...new Set(config.tools.map((t) => t.scope).filter(Boolean))];
    const missing = uniqueScopes.filter((scope) => !(scope in config.accessPolicy));
    if (missing.length > 0) {
      setConfig((prev) => ({
        ...prev,
        accessPolicy: {
          ...prev.accessPolicy,
          ...Object.fromEntries(missing.map((scope) => [scope, 'manual' as const])),
        },
      }));
    }
  }, [config.tools]);

  // Handle JSON changes
  const handleJsonChange = (value: string) => {
    setJsonCode(value);
    const validation = validateJSON(value);

    if (validation.valid && validation.parsed) {
      setJsonError('');
      setConfig(validation.parsed);
    } else {
      setJsonError(validation.error || 'Invalid JSON');
    }
  };

  const addTool = () => {
    setConfig({
      ...config,
      tools: [...config.tools, { name: '', description: '', scope: '' }],
    });
  };

  const removeTool = (index: number) => {
    setConfig({
      ...config,
      tools: config.tools.filter((_, i) => i !== index),
    });
  };

  const updateTool = (index: number, field: keyof ServerConfig['tools'][0], value: string) => {
    const updatedTools = [...config.tools];
    updatedTools[index] = { ...updatedTools[index], [field]: value };
    setConfig({ ...config, tools: updatedTools });
  };

  const handleScopeSelect = (index: number, scope: string) => {
    updateTool(index, 'scope', scope);
    if (!recentScopes.includes(scope)) {
      setRecentScopes([scope, ...recentScopes].slice(0, 10));
    }
  };

  const getFieldError = (field: string) => {
    return errors.find((e) => e.field === field)?.message;
  };

  const hasFieldError = (field: string) => {
    return errors.some((e) => e.field === field);
  };

  const uniqueScopes = [...new Set(config.tools.map((t) => t.scope).filter(Boolean))];

  const setScopePolicy = (scope: string, policy: 'auto' | 'manual') => {
    setConfig({
      ...config,
      accessPolicy: { ...config.accessPolicy, [scope]: policy },
    });
  };

  const step1Fields = ['name', 'version', 'category', 'description', 'maintainer', 'connectionString'];
  const step1HasErrors = errors.some((e) => step1Fields.includes(e.field));
  const step2HasErrors = errors.some((e) => e.field === 'tools' || e.field.startsWith('tools.'));

  const goToStep = (step: number) => {
    if (step < currentStep) {
      setCurrentStep(step);
    }
  };

  const handleConfirm = () => {
    if (errors.length === 0) {
      const slug = config.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const id = `mcp-${slug}-${Date.now().toString(36)}`;

      const tools: MCPTool[] = config.tools.map((tool) => ({ ...tool, approved: false }));

      const newServer: MCPServer = {
        id,
        name: config.name,
        version: config.version,
        status: 'PENDING',
        category: config.category,
        description: config.description,
        tools,
        connectionString: config.connectionString,
        maintainer: config.maintainer,
        lastUpdated: '2026-04-25',
        requestedScopes: uniqueScopes,
        allowedScopes: uniqueScopes,
        accessPolicy: config.accessPolicy,
      };

      onSubmit?.(newServer);

      mockAuditEntries.push({
        id: `audit-${Date.now().toString(36)}`,
        serverId: newServer.id,
        action: 'registered',
        actor: config.maintainer,
        occurredAt: '2026-04-25T09:00:00Z',
        detail: `Server registered with ${config.tools.length} tools across ${uniqueScopes.length} scopes for review.`,
      });

      onBack();
    }
  };

  const autoCount = Object.values(config.accessPolicy).filter((p) => p === 'auto').length;
  const manualCount = Object.values(config.accessPolicy).filter((p) => p === 'manual').length;

  return (
    <div className="flex-1 overflow-hidden bg-[#FBF7F1] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#E7E0D2] p-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#8A8170] hover:text-[#221F1B] mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Registry</span>
        </button>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl text-[#221F1B]">Create New MCP Server</h1>
            <p className="text-sm text-[#8A8170]">Configure and validate your server before submitting for approval</p>
          </div>

          {currentStep === 2 && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-[#FBF7F1] rounded p-1">
                <button
                  onClick={() => setViewMode('FORM')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded transition-colors ${
                    viewMode === 'FORM'
                      ? 'bg-white text-[#C2752E] shadow-sm'
                      : 'text-[#8A8170] hover:text-[#221F1B]'
                  }`}
                >
                  <FormInput className="w-4 h-4" />
                  <span className="text-sm">Form</span>
                </button>
                <button
                  onClick={() => setViewMode('CODE')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded transition-colors ${
                    viewMode === 'CODE'
                      ? 'bg-white text-[#C2752E] shadow-sm'
                      : 'text-[#8A8170] hover:text-[#221F1B]'
                  }`}
                >
                  <Code className="w-4 h-4" />
                  <span className="text-sm">Code</span>
                </button>
              </div>

              <button
                onClick={() => setShowSandbox(!showSandbox)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                <TestTube2 className="w-4 h-4" />
                <span className="text-sm">Test in Sandbox</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stepper */}
      <div className="p-4 pb-0">
        <div className="bg-white border border-[#E7E0D2] rounded p-4 flex items-center gap-2 flex-wrap">
          {STEPS.map((step) => (
            <button
              key={step.id}
              onClick={() => goToStep(step.id)}
              disabled={step.id >= currentStep}
              className={`flex items-center gap-2 px-3 py-1.5 rounded transition-colors ${
                step.id === currentStep
                  ? 'bg-white text-[#C2752E] shadow-sm'
                  : step.id < currentStep
                  ? 'text-[#8A8170] hover:text-[#221F1B]'
                  : 'text-[#8A8170] cursor-not-allowed opacity-60'
              }`}
            >
              <span className="text-sm">{step.id}. {step.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {currentStep === 2 ? (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {viewMode === 'FORM' ? (
            <>
              {/* Left: Form */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-3xl space-y-6">
                  {/* Tools Section */}
                  <div className="bg-white border border-[#E7E0D2] rounded p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg text-[#221F1B]">Tools & Resources</h3>
                      <button
                        onClick={addTool}
                        className="flex items-center gap-2 px-3 py-1.5 bg-[#C2752E] text-white rounded hover:bg-[#9C5E25] transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-sm">Add Tool</span>
                      </button>
                    </div>

                    <div className="space-y-4">
                      {config.tools.map((tool, index) => (
                        <div key={index} className="bg-[#FBF7F1] border border-[#E7E0D2] rounded p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-[#8A8170]">Tool #{index + 1}</span>
                            <button
                              onClick={() => removeTool(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm text-[#221F1B] mb-1">Tool Name</label>
                              <input
                                type="text"
                                value={tool.name}
                                onChange={(e) => updateTool(index, 'name', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-[#E7E0D2] rounded"
                                placeholder="e.g., get_user_balance"
                              />
                            </div>

                            <div>
                              <label className="block text-sm text-[#221F1B] mb-1">Description</label>
                              <input
                                type="text"
                                value={tool.description}
                                onChange={(e) => updateTool(index, 'description', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-[#E7E0D2] rounded"
                                placeholder="What does this tool do?"
                              />
                            </div>

                            <div>
                              <label className="block text-sm text-[#221F1B] mb-1">API Scope</label>
                              <ScopeSearch
                                onScopeSelect={(scope) => handleScopeSelect(index, scope)}
                                recentScopes={recentScopes}
                              />
                              {tool.scope && (
                                <div className="mt-2">
                                  <span className="inline-block px-3 py-1 bg-[#ECE9F3] text-[#382B5F] rounded-full text-sm">
                                    {tool.scope}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {config.tools.length === 0 && (
                        <div className="text-center py-8 text-[#8A8170]">
                          No tools added yet. Click "Add Tool" to get started.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Back / Next */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white border border-[#E7E0D2] rounded p-4">
                    <div className="flex items-center gap-2">
                      {!step2HasErrors ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-sm text-green-600">Tools configuration is valid</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-5 h-5 text-red-600" />
                          <span className="text-sm text-red-600">
                            {errors.filter((e) => e.field === 'tools' || e.field.startsWith('tools.')).length} validation error(s)
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="px-6 py-2 rounded transition-colors border border-[#E7E0D2] text-[#221F1B] hover:bg-[#FBF7F1]"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => setCurrentStep(3)}
                        disabled={step2HasErrors}
                        className={`px-6 py-2 rounded transition-colors ${
                          !step2HasErrors
                            ? 'bg-[#C2752E] text-white hover:bg-[#9C5E25]'
                            : 'bg-[#E7E0D2] text-[#8A8170] cursor-not-allowed'
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: JSON Preview */}
              <div className="w-full md:w-[500px] max-h-[40vh] md:max-h-none border-t md:border-t-0 md:border-l border-[#E7E0D2] bg-[#1E1E1E] p-6 overflow-y-auto">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm text-[#8A8170]">JSON Preview</h3>
                  <span className="text-xs text-green-400">Read-only</span>
                </div>
                <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
                  {JSON.stringify(config, null, 2)}
                </pre>
              </div>
            </>
          ) : (
            /* CODE View - Editable JSON */
            <div className="flex-1 bg-[#1E1E1E] p-6 overflow-y-auto">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm text-[#8A8170]">JSON Editor</h3>
                {jsonError && (
                  <div className="flex items-center gap-2 text-red-400 text-xs">
                    <AlertCircle className="w-4 h-4" />
                    {jsonError}
                  </div>
                )}
              </div>
              <textarea
                value={jsonCode}
                onChange={(e) => handleJsonChange(e.target.value)}
                className="w-full h-[60vh] md:h-[calc(100vh-200px)] bg-[#2E2E2E] text-green-400 font-mono text-sm p-4 rounded border border-[#3E3E3E] focus:outline-none focus:border-green-400"
                spellCheck={false}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl space-y-6">
            {currentStep === 1 && (
              <>
                {/* General Section */}
                <div className="bg-white border border-[#E7E0D2] rounded p-6">
                  <h3 className="text-lg text-[#221F1B] mb-4">General Information</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-[#221F1B] mb-1">
                        Server Name *
                      </label>
                      <input
                        type="text"
                        value={config.name}
                        onChange={(e) => setConfig({ ...config, name: e.target.value })}
                        className={`w-full px-3 py-2 border rounded ${
                          hasFieldError('name') ? 'border-red-500' : 'border-[#E7E0D2]'
                        }`}
                        placeholder="e.g., Customer Data MCP"
                      />
                      {getFieldError('name') && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                          <AlertCircle className="w-3 h-3" />
                          {getFieldError('name')}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-[#221F1B] mb-1">
                          Version *
                        </label>
                        <input
                          type="text"
                          value={config.version}
                          onChange={(e) => setConfig({ ...config, version: e.target.value })}
                          className={`w-full px-3 py-2 border rounded ${
                            hasFieldError('version') ? 'border-red-500' : 'border-[#E7E0D2]'
                          }`}
                          placeholder="1.0.0"
                        />
                        {getFieldError('version') && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                            <AlertCircle className="w-3 h-3" />
                            {getFieldError('version')}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm text-[#221F1B] mb-1">
                          Category *
                        </label>
                        <select
                          value={config.category}
                          onChange={(e) => setConfig({ ...config, category: e.target.value })}
                          className="w-full px-3 py-2 border border-[#E7E0D2] rounded"
                        >
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-[#221F1B] mb-1">
                        Description *
                      </label>
                      <textarea
                        value={config.description}
                        onChange={(e) => setConfig({ ...config, description: e.target.value })}
                        className={`w-full px-3 py-2 border rounded ${
                          hasFieldError('description') ? 'border-red-500' : 'border-[#E7E0D2]'
                        }`}
                        rows={3}
                        placeholder="Describe what this MCP server does..."
                      />
                      {getFieldError('description') && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                          <AlertCircle className="w-3 h-3" />
                          {getFieldError('description')}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm text-[#221F1B] mb-1">
                        Maintainer *
                      </label>
                      <input
                        type="text"
                        value={config.maintainer}
                        onChange={(e) => setConfig({ ...config, maintainer: e.target.value })}
                        className={`w-full px-3 py-2 border rounded ${
                          hasFieldError('maintainer') ? 'border-red-500' : 'border-[#E7E0D2]'
                        }`}
                        placeholder="e.g., Platform Team"
                      />
                      {getFieldError('maintainer') && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                          <AlertCircle className="w-3 h-3" />
                          {getFieldError('maintainer')}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm text-[#221F1B] mb-1">
                        Connection String *
                      </label>
                      <input
                        type="text"
                        value={config.connectionString}
                        onChange={(e) => setConfig({ ...config, connectionString: e.target.value })}
                        className={`w-full px-3 py-2 border rounded font-mono text-sm ${
                          hasFieldError('connectionString') ? 'border-red-500' : 'border-[#E7E0D2]'
                        }`}
                        placeholder="npx -y @modelcontextprotocol/server-name"
                      />
                      {getFieldError('connectionString') && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                          <AlertCircle className="w-3 h-3" />
                          {getFieldError('connectionString')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Next */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white border border-[#E7E0D2] rounded p-4">
                  <div className="flex items-center gap-2">
                    {!step1HasErrors ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-green-600">General information is valid</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <span className="text-sm text-red-600">
                          {errors.filter((e) => step1Fields.includes(e.field)).length} validation error(s)
                        </span>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => setCurrentStep(2)}
                    disabled={step1HasErrors}
                    className={`px-6 py-2 rounded transition-colors ${
                      !step1HasErrors
                        ? 'bg-[#C2752E] text-white hover:bg-[#9C5E25]'
                        : 'bg-[#E7E0D2] text-[#8A8170] cursor-not-allowed'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </>
            )}

            {currentStep === 3 && (
              <>
                {/* Configure Access Section */}
                <div className="bg-white border border-[#E7E0D2] rounded p-6">
                  <h3 className="text-lg text-[#221F1B] mb-1">Configure Access</h3>
                  <p className="text-sm text-[#8A8170] mb-4">
                    Decide whether each requested scope can be auto-approved or requires manual security review.
                  </p>

                  <div className="space-y-3">
                    {uniqueScopes.map((scope) => {
                      const policy = config.accessPolicy[scope] ?? 'manual';
                      return (
                        <div
                          key={scope}
                          className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-[#FBF7F1] border border-[#E7E0D2] rounded p-4"
                        >
                          <span className="inline-block px-3 py-1 bg-[#ECE9F3] text-[#382B5F] rounded-full text-sm self-start sm:self-auto">
                            {scope}
                          </span>

                          <div className="flex items-center gap-2 bg-white rounded p-1 border border-[#E7E0D2] self-start sm:self-auto">
                            <button
                              onClick={() => setScopePolicy(scope, 'auto')}
                              className={`px-3 py-1.5 rounded transition-colors ${
                                policy === 'auto'
                                  ? 'bg-white text-[#C2752E] shadow-sm'
                                  : 'text-[#8A8170] hover:text-[#221F1B]'
                              }`}
                            >
                              <span className="text-sm">Auto</span>
                            </button>
                            <button
                              onClick={() => setScopePolicy(scope, 'manual')}
                              className={`px-3 py-1.5 rounded transition-colors ${
                                policy === 'manual'
                                  ? 'bg-white text-[#C2752E] shadow-sm'
                                  : 'text-[#8A8170] hover:text-[#221F1B]'
                              }`}
                            >
                              <span className="text-sm">Manual</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {uniqueScopes.length === 0 && (
                      <div className="text-center py-8 text-[#8A8170]">
                        No scopes to configure yet — add tools with scopes in the previous step.
                      </div>
                    )}
                  </div>
                </div>

                {/* Back / Next */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end bg-white border border-[#E7E0D2] rounded p-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="px-6 py-2 rounded transition-colors border border-[#E7E0D2] text-[#221F1B] hover:bg-[#FBF7F1]"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setCurrentStep(4)}
                      className="px-6 py-2 rounded transition-colors bg-[#C2752E] text-white hover:bg-[#9C5E25]"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}

            {currentStep === 4 && (
              <>
                {/* Summary Card */}
                <div className="bg-white border border-[#E7E0D2] rounded p-6">
                  <h3 className="text-lg text-[#221F1B] mb-4">Summary</h3>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-[#8A8170]">Name</dt>
                      <dd className="text-[#221F1B]">{config.name || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-[#8A8170]">Version</dt>
                      <dd className="text-[#221F1B]">{config.version || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-[#8A8170]">Category</dt>
                      <dd className="text-[#221F1B]">{config.category || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-[#8A8170]">Maintainer</dt>
                      <dd className="text-[#221F1B]">{config.maintainer || '—'}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-[#8A8170]">Connection String</dt>
                      <dd className="text-[#221F1B] font-mono text-xs break-all">{config.connectionString || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-[#8A8170]">Tool Count</dt>
                      <dd className="text-[#221F1B]">{config.tools.length}</dd>
                    </div>
                    <div>
                      <dt className="text-[#8A8170]">Access Policy</dt>
                      <dd className="text-[#221F1B]">
                        {autoCount} scope{autoCount === 1 ? '' : 's'} auto-approved, {manualCount} require{manualCount === 1 ? 's' : ''} manual review
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* JSON Preview */}
                <div className="bg-[#1E1E1E] rounded p-6 overflow-x-auto">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm text-[#8A8170]">JSON Preview</h3>
                    <span className="text-xs text-green-400">Read-only</span>
                  </div>
                  <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
                    {JSON.stringify(config, null, 2)}
                  </pre>
                </div>

                {/* Next steps copy + Confirm */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white border border-[#E7E0D2] rounded p-4">
                  <div className="text-sm text-[#8A8170]">
                    <p>Submitted for security review.</p>
                    <p>You'll see it in Registry with a Pending badge.</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="px-6 py-2 rounded transition-colors border border-[#E7E0D2] text-[#221F1B] hover:bg-[#FBF7F1]"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleConfirm}
                      disabled={errors.length > 0}
                      className={`px-6 py-2 rounded transition-colors ${
                        errors.length === 0
                          ? 'bg-[#C2752E] text-white hover:bg-[#9C5E25]'
                          : 'bg-[#E7E0D2] text-[#8A8170] cursor-not-allowed'
                      }`}
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Sandbox Panel */}
      {showSandbox && (
        <SandboxPanel
          serverConfig={config}
          onClose={() => setShowSandbox(false)}
        />
      )}
    </div>
  );
}
