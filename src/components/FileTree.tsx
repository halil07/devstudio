import { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from 'lucide-react';
import type { VirtualFile } from '../types';

interface FileTreeProps {
  files: VirtualFile[];
  activeFile: string | null;
  onFileSelect: (file: VirtualFile) => void;
}

interface FileNodeProps {
  file: VirtualFile;
  level: number;
  activeFile: string | null;
  onFileSelect: (file: VirtualFile) => void;
}

const FileNode = ({ file, level, activeFile, onFileSelect }: FileNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isActive = activeFile === file.path;
  const isDirectory = file.type === 'directory';

  const handleClick = () => {
    if (isDirectory) {
      setIsExpanded(!isExpanded);
    } else {
      onFileSelect(file);
    }
  };

  const getIcon = () => {
    if (isDirectory) {
      return isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />;
    }
    return <File size={16} />;
  };

  const getLanguageColor = () => {
    if (isDirectory) return '#94a3b8';
    
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const colors: Record<string, string> = {
      js: '#f7df1e',
      jsx: '#f7df1e',
      ts: '#3178c6',
      tsx: '#3178c6',
      py: '#3572A5',
      go: '#00ADD8',
      rs: '#dea584',
      html: '#e34c26',
      css: '#264de4',
      json: '#cbcb41',
      md: '#083fa1',
    };
    return colors[ext] || '#94a3b8';
  };

  return (
    <div>
      <div
        className={'flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-slate-800 transition-colors ' + (isActive ? 'bg-slate-700' : '')}
        style={{ paddingLeft: (level * 16 + 8) + 'px' }}
        onClick={handleClick}
      >
        <span className="text-slate-400">
          {isDirectory && (isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
        </span>
        <span style={{ color: getLanguageColor() }}>{getIcon()}</span>
        <span className="text-sm text-slate-300">{file.name}</span>
      </div>
      {isExpanded && file.children && (
        <div>
          {file.children.map((child) => (
            <FileNode
              key={child.path}
              file={child}
              level={level + 1}
              activeFile={activeFile}
              onFileSelect={onFileSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const FileTree = ({ files, activeFile, onFileSelect }: FileTreeProps) => {
  return (
    <div className="h-full overflow-auto bg-slate-900 text-slate-200">
      <div className="p-2 border-b border-slate-700">
        <h2 className="text-xs font-semibold uppercase text-slate-400">Explorer</h2>
      </div>
      <div className="py-2">
        {files.map((file) => (
          <FileNode
            key={file.path}
            file={file}
            level={0}
            activeFile={activeFile}
            onFileSelect={onFileSelect}
          />
        ))}
      </div>
    </div>
  );
};
