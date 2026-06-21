import { Database, Shield, FileText, Cpu, BarChart3, ServerIcon } from 'lucide-react';

interface SidebarProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
}

const categoryIcons: Record<string, any> = {
  'All Servers': ServerIcon,
  'Customer Data': Database,
  'Security & Compliance': Shield,
  'Document Processing': FileText,
  'Analytics': BarChart3,
  'Infrastructure': Cpu,
};

export function Sidebar({ selectedCategory, onCategoryChange, categories }: SidebarProps) {
  return (
    <aside className="w-64 bg-[#FBF7F1] border-r border-[#E7E0D2] h-screen overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-[#C2752E] rounded flex items-center justify-center">
            <ServerIcon className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl text-[#221F1B]">MCP Registry</h1>
        </div>

        <nav className="space-y-1">
          <div className="text-xs uppercase tracking-wider text-[#8A8170] mb-3 px-3">Registry Categories</div>
          {categories.map((category) => {
            const Icon = categoryIcons[category] || ServerIcon;
            return (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-colors ${
                  selectedCategory === category
                    ? 'bg-white text-[#C2752E] shadow-sm'
                    : 'text-[#221F1B] hover:bg-white/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{category}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
