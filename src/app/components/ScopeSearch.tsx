import { useState, useEffect } from 'react';
import { Search, Tag, Shield, Clock } from 'lucide-react';
import { searchCatalogScopes, getScopeLevelColor, CatalogScope } from './catalog';

interface ScopeSearchProps {
  onScopeSelect: (scope: string) => void;
  recentScopes?: string[];
}

export function ScopeSearch({ onScopeSelect, recentScopes = [] }: ScopeSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CatalogScope[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (query.trim() || isOpen) {
      setResults(searchCatalogScopes(query));
    }
  }, [query, isOpen]);

  const handleSelect = (scope: CatalogScope) => {
    onScopeSelect(scope.name);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8170]" />
        <input
          type="text"
          placeholder="Search pre-vetted API scopes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-10 pr-4 py-2 bg-[#FBF7F1] border border-[#E7E0D2] rounded"
        />
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E7E0D2] rounded shadow-lg max-h-96 overflow-y-auto z-20">
            {recentScopes.length > 0 && query.trim() === '' && (
              <div className="p-3 border-b border-[#E7E0D2]">
                <div className="flex items-center gap-2 text-xs text-[#8A8170] mb-2">
                  <Clock className="w-3 h-3" />
                  <span>Recently Used</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentScopes.slice(0, 5).map((scope) => (
                    <button
                      key={scope}
                      onClick={() => onScopeSelect(scope)}
                      className="px-3 py-1 bg-[#ECE9F3] text-[#382B5F] rounded-full text-xs hover:bg-[#DCD5E8] transition-colors"
                    >
                      {scope}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="p-2">
              {results.length > 0 ? (
                results.map((scope) => (
                  <button
                    key={scope.id}
                    onClick={() => handleSelect(scope)}
                    className="w-full text-left p-3 hover:bg-[#FBF7F1] rounded transition-colors"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <code className="text-sm text-[#221F1B] font-mono">{scope.name}</code>
                      <span className={`${getScopeLevelColor(scope.level)} px-2 py-0.5 rounded text-xs flex items-center gap-1`}>
                        <Shield className="w-3 h-3" />
                        {scope.level}
                      </span>
                    </div>
                    <p className="text-xs text-[#8A8170] mb-1">{scope.description}</p>
                    <div className="flex items-center gap-2 text-xs text-[#8A8170]">
                      <Tag className="w-3 h-3" />
                      <span>{scope.category}</span>
                      <span>•</span>
                      <span>{scope.owner}</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-6 text-[#8A8170] text-sm">
                  No scopes found matching "{query}"
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
