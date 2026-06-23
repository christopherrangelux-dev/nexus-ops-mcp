import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, CheckCircle, AlertCircle, TestTube2, Code, FormInput } from 'lucide-react';
import { ServerConfig, validateServerConfig, ValidationError, validateJSON } from './validation';
import { ScopeSearch } from './ScopeSearch';
import { SandboxPanel } from './SandboxPanel';
import { categories as allCategories } from './mockData';

interface ServerCreatorProps {
  onBack: () => void;
  onSubmit?: (config: ServerConfig) => void;
}

const categories = allCategories.filter((c) => c !== 'All Servers');

export function ServerCreator({ onBack, onSubmit }: ServerCreatorProps) {
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

  const handleSubmit = () => {
    if (errors.length === 0) {
      onSubmit?.(config);
      alert('Server configuration submitted for approval!');
      onBack();
    }
  };

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
        </div>
      </div>

      {/* Split Pane Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {viewMode === 'FORM' ? (
          <>
            {/* Left: Form */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-3xl space-y-6">
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

                {/* Tools Section */}
                <div className="bg-white border border-[#E7E0D2] rounded p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg text-[#221F1B]">Tools & Scopes</h3>
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

                {/* Submit */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white border border-[#E7E0D2] rounded p-4">
                  <div className="flex items-center gap-2">
                    {errors.length === 0 ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-green-600">Configuration is valid</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <span className="text-sm text-red-600">{errors.length} validation error(s)</span>
                      </>
                    )}
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={errors.length > 0}
                    className={`px-6 py-2 rounded transition-colors ${
                      errors.length === 0
                        ? 'bg-[#C2752E] text-white hover:bg-[#9C5E25]'
                        : 'bg-[#E7E0D2] text-[#8A8170] cursor-not-allowed'
                    }`}
                  >
                    Submit for Approval
                  </button>
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
