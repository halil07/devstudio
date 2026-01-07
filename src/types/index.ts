// File System Types
export interface VirtualFile {
  name: string;
  path: string;
  content?: string;
  type: 'file' | 'directory';
  children?: VirtualFile[];
  language?: string;
}

// File System Access API Types
export interface LocalFileSystemHandle {
  directoryHandle: FileSystemDirectoryHandle | null;
  fileHandles: Map<string, FileSystemFileHandle>;
}

// WebContainer Types
export type ContainerStatus = 'booting' | 'ready' | 'running' | 'stopped' | 'error';

export interface WebContainerState {
  status: ContainerStatus;
  previewUrl: string | null;
}

export interface TerminalLine {
  id: string;
  content: string;
  type: 'stdout' | 'stderr' | 'command' | 'info';
  timestamp: number;
}

// Editor State
export interface EditorFile {
  path: string;
  name: string;
  content: string;
  language: string;
  modified?: boolean;
}

export interface OpenTab extends EditorFile {
  id: string;
}

// App State
export interface AppState {
  // File System
  files: VirtualFile[];
  activeFile: EditorFile | null;
  openTabs: OpenTab[];
  
  // Local FS
  localFolderHandle: FileSystemDirectoryHandle | null;
  useLocalFS: boolean;
  
  // WebContainer
  containerStatus: ContainerStatus;
  previewUrl: string | null;
  terminalLines: TerminalLine[];
  
  // UI
  sidebarOpen: boolean;
  terminalOpen: boolean;
  previewOpen: boolean;
}

// Language mapping
export const LANGUAGE_MAP: Record<string, string> = {
  'js': 'javascript',
  'jsx': 'javascript',
  'ts': 'typescript',
  'tsx': 'typescript',
  'py': 'python',
  'go': 'go',
  'rs': 'rust',
  'html': 'html',
  'css': 'css',
  'scss': 'scss',
  'json': 'json',
  'md': 'markdown',
  'xml': 'xml',
  'yaml': 'yaml',
  'yml': 'yaml',
  'sh': 'shell',
  'txt': 'plaintext',
};

export function getLanguageFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  return LANGUAGE_MAP[ext] || 'plaintext';
}

// Default template files
export const DEFAULT_PROJECT_FILES: VirtualFile[] = [
  {
    name: 'package.json',
    path: '/package.json',
    type: 'file',
    content: JSON.stringify({
      name: 'vite-app',
      private: true,
      version: '0.0.0',
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview'
      },
      dependencies: {
        react: '^18.2.0',
        'react-dom': '^18.2.0'
      },
      devDependencies: {
        '@types/react': '^18.2.43',
        '@types/react-dom': '^18.2.17',
        '@vitejs/plugin-react': '^4.2.1',
        vite: '^5.0.8'
      }
    }, null, 2),
    language: 'json'
  },
  {
    name: 'vite.config.js',
    path: '/vite.config.js',
    type: 'file',
    content: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    strictPort: true,
    hmr: {
      host: true,
      protocol: 'ws',
      clientPort: 3000
    }
  }
})`,
    language: 'javascript'
  },
  {
    name: 'index.html',
    path: '/index.html',
    type: 'file',
    content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,
    language: 'html'
  },
  {
    name: 'src',
    path: '/src',
    type: 'directory',
    children: [
      {
        name: 'main.jsx',
        path: '/src/main.jsx',
        type: 'file',
        content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
        language: 'javascript'
      },
      {
        name: 'App.jsx',
        path: '/src/App.jsx',
        type: 'file',
        content: `import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR!
        </p>
      </div>
    </div>
  )
}

export default App`,
        language: 'javascript'
      },
      {
        name: 'App.css',
        path: '/src/App.css',
        type: 'file',
        content: `body{
  justify-content: center;
  align-items: center;
}

.App {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.card {
  padding: 2em;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  cursor: pointer;
  transition: border-color 0.25s;
  color: white;
}

button:hover {
  border-color: #646cff;
}`,
        language: 'css'
      },
      {
        name: 'index.css',
        path: '/src/index.css',
        type: 'file',
        content: `:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a {
  font-weight: 500;
  color: #646cff;
  text-decoration: inherit;
}
a:hover {
  color: #535bf2;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

h1 {
  font-size: 3.2em;
  line-height: 1.1;
}

@media (prefers-color-scheme: light) {
  :root {
    color: #213547;
    background-color: #ffffff;
  }
  a:hover {
    color: #747bff;
  }
}`,
        language: 'css'
      }
    ]
  }
];
