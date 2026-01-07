import React from 'react';
import { Play, Square, FolderOpen, RefreshCw, ExternalLink } from 'lucide-react';

interface HeaderProps {
  isRunning: boolean;
  onRun: () => void;
  onStop: () => void;
  onOpenFolder: () => void;
  onRefresh: () => void;
  previewUrl: string | null;
  useLocalFS: boolean;
  onTogglePreview: () => void;
  previewOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isRunning,
  onRun,
  onStop,
  onOpenFolder,
  onRefresh,
  previewUrl,
  useLocalFS,
  onTogglePreview,
  previewOpen,
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-700">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold text-white">DevStudio</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenFolder}
            className={'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ' +
              (useLocalFS
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600')
            }
          >
            <FolderOpen size={16} />
            {useLocalFS ? 'Local Folder Connected' : 'Open Local Folder'}
          </button>
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 text-slate-300 rounded-md text-sm font-medium hover:bg-slate-600 transition-colors"
          >
            <RefreshCw size={16} />
            Reset
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {previewUrl && (
          <button
            onClick={onTogglePreview}
            className={'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ' +
              (previewOpen
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600')
            }
          >
            <ExternalLink size={16} />
            {previewOpen ? 'Hide Preview' : 'Show Preview'}
          </button>
        )}
        {isRunning ? (
          <button
            onClick={onStop}
            className="flex items-center gap-2 px-4 py-1.5 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
          >
            <Square size={16} />
            Stop
          </button>
        ) : (
          <button
            onClick={onRun}
            className="flex items-center gap-2 px-4 py-1.5 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
          >
            <Play size={16} />
            Run Dev
          </button>
        )}
      </div>
    </div>
  );
};
