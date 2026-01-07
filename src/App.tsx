import { useState, useEffect, useCallback } from 'react';
import { MonacoEditor } from './components/MonacoEditor';
import { FileTree } from './components/FileTree';
import { Terminal } from './components/Terminal';
import { Header } from './components/Header';
import { TabBar } from './components/TabBar';
import { virtualFS } from './lib/fileSystem';
import { localFS } from './lib/localFileSystem';
import { webContainerManager } from './lib/webcontainer';
import type { VirtualFile, OpenTab, TerminalLine } from './types';
import { getLanguageFromPath } from './types';

function App() {
  const [files, setFiles] = useState<VirtualFile[]>([]);
  const [activeFile, setActiveFile] = useState<OpenTab | null>(null);
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [terminalOpen, setTerminalOpen] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [useLocalFS, setUseLocalFS] = useState(false);
  const [previewKey, setPreviewKey] = useState(0); // Preview yenileme için

  useEffect(() => {
    const tree = virtualFS.getDirectoryTree();
    setFiles(tree);
    
    webContainerManager.setOutputCallback((line) => {
      setTerminalLines(prev => [...prev, line]);
    });
    
    webContainerManager.setUrlChangeCallback((url) => {
      setPreviewUrl(url);
      if (url) {
        setPreviewOpen(true);
      }
    });
  }, []);

  const handleFileSelect = useCallback((file: VirtualFile) => {
    if (file.type === 'directory') return;

    const existingTab = openTabs.find(t => t.path === file.path);
    const tabContent = file.content || '';
    
    if (existingTab) {
      setActiveFile(existingTab);
    } else {
      const newTab: OpenTab = {
        id: Date.now().toString(),
        path: file.path,
        name: file.name,
        content: tabContent,
        language: file.language || getLanguageFromPath(file.path),
        modified: false
      };
      setOpenTabs(prev => [...prev, newTab]);
      setActiveFile(newTab);
    }
  }, [openTabs]);

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (!activeFile) return;

    const newContent = value || '';
    setActiveFile(prev => prev ? { ...prev, content: newContent, modified: true } : null);
    setOpenTabs(prev => prev.map(t =>
      t.id === activeFile.id ? { ...t, content: newContent, modified: true } : t
    ));

    virtualFS.setFileContent(activeFile.path, newContent);
  }, [activeFile]);

  const handleSave = useCallback(async () => {
    if (!activeFile) return;

    // LocalFS kullanıyorsan diske kaydet
    if (useLocalFS) {
      await localFS.writeFile(activeFile.path, activeFile.content);
    }

    // WebContainer'da da güncelle (dev server çalışıyorsa)
    if (isRunning) {
      await webContainerManager.writeFile(activeFile.path, activeFile.content);
      // Preview'i yenile
      setPreviewKey(prev => prev + 1);
    }

    // Modified flag'ini kaldır
    setActiveFile(prev => prev ? { ...prev, modified: false } : null);
    setOpenTabs(prev => prev.map(t =>
      t.id === activeFile.id ? { ...t, modified: false } : t
    ));

    // Terminal'e kaydetme mesajı yaz
    setTerminalLines(prev => [...prev, {
      id: Date.now().toString(),
      content: `Saved: ${activeFile.path}`,
      type: 'info',
      timestamp: Date.now()
    }]);
  }, [activeFile, useLocalFS, isRunning]);

  // Klavye kısayolları - Ctrl+S ile kaydet
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  const handleTabClose = useCallback((tabId: string) => {
    setOpenTabs(prev => {
      const newTabs = prev.filter(t => t.id !== tabId);
      if (activeFile?.id === tabId) {
        setActiveFile(newTabs.length > 0 ? newTabs[newTabs.length - 1] : null);
      }
      return newTabs;
    });
  }, [activeFile]);

  const handleTabSelect = useCallback((tabId: string) => {
    const tab = openTabs.find(t => t.id === tabId);
    if (tab) {
      setActiveFile(tab);
    }
  }, [openTabs]);

  const handleRun = async () => {
    setIsRunning(true);
    
    if (!webContainerManager.isReady()) {
      await webContainerManager.boot();
    }

    const wcFiles = virtualFS.toWebContainerFiles();
    await webContainerManager.mountFiles(wcFiles);
    await webContainerManager.installDependencies();
    await webContainerManager.startDevServer();
  };

  const handleStop = async () => {
    await webContainerManager.stop();
    setIsRunning(false);
  };

  const handleOpenFolder = async () => {
    const localFiles = await localFS.openFolder();
    if (localFiles) {
      setFiles(localFiles);
      virtualFS.loadFromFiles(localFiles); // virtualFS'i de güncelle
      setUseLocalFS(true);
      setTerminalLines(prev => [...prev, {
        id: Date.now().toString(),
        content: 'Local folder connected!',
        type: 'info',
        timestamp: Date.now()
      }]);
    }
  };

  const handleRefresh = () => {
    virtualFS.reset();
    const tree = virtualFS.getDirectoryTree();
    setFiles(tree);
    setOpenTabs([]);
    setActiveFile(null);
    setPreviewUrl(null);
    setTerminalLines([]);
    setUseLocalFS(false);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950">
      <Header
        isRunning={isRunning}
        onRun={handleRun}
        onStop={handleStop}
        onOpenFolder={handleOpenFolder}
        onRefresh={handleRefresh}
        previewUrl={previewUrl}
        useLocalFS={useLocalFS}
        onTogglePreview={() => setPreviewOpen(!previewOpen)}
        previewOpen={previewOpen}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex overflow-hidden">
          <div className="w-64 border-r border-slate-700">
            <FileTree
              files={files}
              activeFile={activeFile?.path || null}
              onFileSelect={handleFileSelect}
            />
          </div>

          <div className="flex-1 flex flex-col min-w-0">
            {openTabs.length > 0 && (
              <TabBar
                tabs={openTabs}
                activeTab={activeFile?.id || null}
                onTabSelect={handleTabSelect}
                onTabClose={handleTabClose}
              />
            )}

            {activeFile ? (
              <MonacoEditor
                value={activeFile.content}
                onChange={handleEditorChange}
                language={activeFile.language}
                path={activeFile.path}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500">
                <div className="text-center">
                  <h2 className="text-xl mb-2">Welcome to DevStudio</h2>
                  <p className="text-sm">Select a file to start editing or click "Run Dev" to start the dev server</p>
                </div>
              </div>
            )}
          </div>

          {previewOpen && previewUrl && (
            <div className="w-1/2 border-l border-slate-700 flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-700">
                <span className="text-sm font-medium text-slate-300">Preview</span>
                <div className="flex items-center gap-2">
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300"
                    title="Open in new tab"
                  >
                    Open in new tab
                  </a>
                  <button
                    onClick={() => setPreviewOpen(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <iframe
                key={previewKey}
                src={previewUrl}
                className="flex-1 w-full bg-white"
                title="Preview"
                sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-downloads"
                allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; clipboard-read; clipboard-write"
              />
            </div>
          )}
        </div>

        {terminalOpen && (
          <div className="h-64 border-t border-slate-700">
            <Terminal
              lines={terminalLines}
              onClose={() => setTerminalOpen(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
