import { X } from 'lucide-react';
import type { OpenTab } from '../types';

interface TabBarProps {
  tabs: OpenTab[];
  activeTab: string | null;
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
}

export const TabBar = ({ tabs, activeTab, onTabSelect, onTabClose }: TabBarProps) => {
  return (
    <div className="flex items-center bg-slate-900 border-b border-slate-700 overflow-x-auto">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={'flex items-center gap-2 px-4 py-2 border-r border-slate-700 cursor-pointer hover:bg-slate-800 transition-colors min-w-fit ' +
            (activeTab === tab.id ? 'bg-slate-800 text-white' : 'text-slate-400')}
          onClick={() => onTabSelect(tab.id)}
        >
          <span className="text-sm">{tab.name}</span>
          {tab.modified && <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTabClose(tab.id);
            }}
            className="ml-1 hover:bg-slate-700 rounded p-0.5"
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  );
};
