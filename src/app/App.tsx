import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { RegistryView } from './components/RegistryView';
import { DiscoveryView } from './components/DiscoveryView';
import { ServerDetail } from './components/ServerDetail';
import { ServerCreator } from './components/ServerCreator';
import { mockServers, categories } from './components/mockData';
import { MCPServer } from './components/types';
import { Plus, Menu } from 'lucide-react';

type View = 'registry' | 'discovery' | 'detail' | 'create';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState('All Servers');
  const [selectedServer, setSelectedServer] = useState<MCPServer | null>(null);
  const [currentView, setCurrentView] = useState<View>('discovery');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredServers =
    selectedCategory === 'All Servers'
      ? mockServers
      : mockServers.filter((server) => server.category === selectedCategory);

  const handleServerSelect = (server: MCPServer) => {
    setSelectedServer(server);
    setCurrentView('detail');
  };

  const handleCreateNew = () => {
    setCurrentView('create');
  };

  const handleBackToRegistry = () => {
    setSelectedServer(null);
    setCurrentView('registry');
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden md:flex-row">
      {(currentView === 'registry' || currentView === 'detail') && (
        <>
          <div className="md:hidden flex items-center gap-3 bg-white border-b border-[#E7E0D2] p-4 flex-shrink-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-[#221F1B]"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-sm text-[#8A8170]">MCP Registry</span>
          </div>
          <Sidebar
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            categories={categories}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        </>
      )}

      {(currentView === 'registry' || currentView === 'discovery') && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white border-b border-[#E7E0D2] p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-1 bg-[#FBF7F1] rounded p-1 self-start">
              <button
                onClick={() => setCurrentView('discovery')}
                className={`px-4 py-1.5 rounded text-sm transition-colors ${
                  currentView === 'discovery'
                    ? 'bg-white text-[#C2752E] shadow-sm'
                    : 'text-[#8A8170] hover:text-[#221F1B]'
                }`}
              >
                Discovery
              </button>
              <button
                onClick={() => setCurrentView('registry')}
                className={`px-4 py-1.5 rounded text-sm transition-colors ${
                  currentView === 'registry'
                    ? 'bg-white text-[#C2752E] shadow-sm'
                    : 'text-[#8A8170] hover:text-[#221F1B]'
                }`}
              >
                Registry (Admin)
              </button>
            </div>

            {currentView === 'registry' && (
              <button
                onClick={handleCreateNew}
                className="flex items-center gap-2 px-4 py-2 bg-[#C2752E] text-white rounded hover:bg-[#9C5E25] transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">Create New Server</span>
              </button>
            )}
          </div>

          {currentView === 'discovery' ? (
            <DiscoveryView servers={mockServers} />
          ) : (
            <RegistryView
              servers={filteredServers}
              onServerSelect={handleServerSelect}
            />
          )}
        </div>
      )}

      {currentView === 'detail' && selectedServer && (
        <ServerDetail
          server={selectedServer}
          onBack={handleBackToRegistry}
        />
      )}

      {currentView === 'create' && (
        <ServerCreator
          onBack={handleBackToRegistry}
        />
      )}
    </div>
  );
}
