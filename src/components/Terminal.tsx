import { useEffect, useRef } from 'react';
import { X, Terminal as TerminalIcon } from 'lucide-react';
import type { TerminalLine } from '../types';

interface TerminalProps {
  lines: TerminalLine[];
  onClose: () => void;
}

// ANSI escape sequence temizleme
function stripAnsiCodes(text: string): string {
  // ANSI renk kodlarını ve diğer control sequence'leri temizle
  return text.replace(/\x1b\[[0-9;]*[mGKH]/g, '')
    .replace(/\x1b\[[0-9]*;[0-9]*H/g, '') // cursor position
    .replace(/\x1b\[[0-9]*J/g, '') // erase display
    .replace(/\x1b\[[0-9]*K/g, '') // erase line
    .replace(/\x1b\[\?[0-9]*[hl]/g, '') // mode changes
    .replace(/\x1b\[[0-9]*[@A-Z]/g, '') // diğer control sequence'ler
    .replace(/\x08/g, '') // backspace
    .replace(/\r(?!\n)/g, ''); // carriage return (yeni satır değilse)
}

export const Terminal = ({ lines, onClose }: TerminalProps) => {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  const getLineColor = (type: string): string => {
    switch (type) {
      case 'stdout':
        return 'text-green-400';
      case 'stderr':
        return 'text-red-400';
      case 'command':
        return 'text-yellow-400';
      case 'info':
        return 'text-blue-400';
      default:
        return 'text-slate-300';
    }
  };

  return (
    <div className="h-full bg-slate-950 flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <TerminalIcon size={16} className="text-slate-400" />
          <span className="text-sm font-medium text-slate-300">Terminal</span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
      <div
        ref={terminalRef}
        className="flex-1 overflow-auto p-4 font-mono text-sm"
      >
        {lines.length === 0 ? (
          <div className="text-slate-500">Waiting for output...</div>
        ) : (
          lines.map((line) => (
            <div
              key={line.id}
              className={'mb-1 whitespace-pre-wrap break-all ' + getLineColor(line.type)}
            >
              {stripAnsiCodes(line.content)}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
