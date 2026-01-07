import type { VirtualFile } from '../types';

export interface LocalFSFile {
  handle: FileSystemFileHandle;
  name: string;
  path: string;
  content?: string;
  modified: boolean;
}

export class LocalFileSystem {
  private directoryHandle: FileSystemDirectoryHandle | null = null;
  private fileHandles: Map<string, FileSystemFileHandle> = new Map();
  private files: Map<string, LocalFSFile> = new Map();
  private ignorePatterns: string[] = [];

  // .gitignore dosyasını oku ve pattern'leri parse et
  private async parseGitignore(dirHandle: FileSystemDirectoryHandle): Promise<void> {
    this.ignorePatterns = [];
    try {
      const gitignoreFile = await dirHandle.getFileHandle('.gitignore');
      const file = await gitignoreFile.getFile();
      const content = await file.text();

      // Satır satır parse et
      for (const line of content.split('\n')) {
        const trimmed = line.trim();

        // Boş satırları ve yorumları atla
        if (!trimmed || trimmed.startsWith('#')) continue;

        // Negation pattern'leri (! ile başlayan) şimdilik desteklemiyoruz
        if (trimmed.startsWith('!')) continue;

        // Pattern'i ekle
        this.ignorePatterns.push(trimmed);
      }
    } catch (e) {
      // .gitignore yoksa sessizce devam et
    }
  }

  // Bir path'in gitignore pattern'leri ile eşleşip eşleşmediğini kontrol et
  private isIgnored(name: string, path: string): boolean {
    // .git klasörünü her zaman ignore et
    if (name === '.git' || path.startsWith('.git/')) {
      return true;
    }

    for (const pattern of this.ignorePatterns) {
      // Wildcard pattern (örn: *.log)
      if (pattern.startsWith('*.')) {
        const ext = pattern.slice(1); // *.log -> .log
        if (name.endsWith(ext)) return true;
      }

      // Direkt klasör/dosya ismi eşleşmesi
      if (pattern === name) return true;

      // Path içeren pattern (örn: .vscode/*)
      if (pattern.includes('/')) {
        const patternParts = pattern.split('/').filter(p => p && p !== '*');
        const pathParts = path.split('/').filter(p => p);

        // Pattern'in başı ile path'in başı eşleşiyor mu?
        if (patternParts[0] && pathParts[0] === patternParts[0]) return true;
      }
    }
    return false;
  }

  async openFolder(): Promise<VirtualFile[] | null> {
    try {
      if (!window.showDirectoryPicker) {
        throw new Error('File System Access API not supported');
      }

      this.directoryHandle = await window.showDirectoryPicker({
        mode: 'readwrite',
        id: 'devstudio-project'
      });

      // Clear previous state
      this.fileHandles.clear();
      this.files.clear();

      // .gitignore dosyasını oku
      if (this.directoryHandle) {
        await this.parseGitignore(this.directoryHandle);

        // Load all files from directory
        const files = await this.loadDirectory('', this.directoryHandle);
        return files;
      }
      return null;
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Failed to open folder:', error);
      }
      return null;
    }
  }

  private async loadDirectory(
    path: string,
    handle: FileSystemDirectoryHandle
  ): Promise<VirtualFile[]> {
    const files: VirtualFile[] = [];

    for await (const entry of handle.values()) {
      const entryPath = path ? `${path}/${entry.name}` : entry.name;

      // Gitignore pattern'lerine göre kontrol et
      if (this.isIgnored(entry.name, entryPath)) {
        continue;
      }

      if (entry.kind === 'file') {
        const fileHandle = entry as FileSystemFileHandle;
        this.fileHandles.set(entryPath, fileHandle);

        const file = await fileHandle.getFile();
        const content = await this.readFileContent(file);

        this.files.set(entryPath, {
          handle: fileHandle,
          name: entry.name,
          path: entryPath,
          content,
          modified: false
        });

        const ext = entry.name.split('.').pop()?.toLowerCase() || '';
        files.push({
          name: entry.name,
          path: entryPath,
          content,
          type: 'file',
          language: this.getLanguageFromExtension(ext)
        });
      } else if (entry.kind === 'directory') {
        const dirHandle = entry as FileSystemDirectoryHandle;
        const children = await this.loadDirectory(entryPath, dirHandle);

        files.push({
          name: entry.name,
          path: entryPath,
          type: 'directory',
          children
        });
      }
    }

    return files;
  }

  private async readFileContent(file: File): Promise<string> {
    const text = await file.text();
    return text;
  }

  private getLanguageFromExtension(ext: string): string {
    const languageMap: Record<string, string> = {
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
    };
    return languageMap[ext] || 'plaintext';
  }

  async writeFile(path: string, content: string): Promise<boolean> {
    try {
      const handle = this.fileHandles.get(path);
      if (!handle) {
        // Create new file
        if (this.directoryHandle) {
          const newHandle = await this.createFileInPath(path, content);
          if (newHandle) {
            this.fileHandles.set(path, newHandle);
            return true;
          }
        }
        return false;
      }

      // Write to existing file
      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();

      // Update local state
      const localFile = this.files.get(path);
      if (localFile) {
        localFile.content = content;
        localFile.modified = false;
      }

      return true;
    } catch (error) {
      console.error('Failed to write file:', error);
      return false;
    }
  }

  private async createFileInPath(path: string, content: string): Promise<FileSystemFileHandle | null> {
    if (!this.directoryHandle) return null;

    const parts = path.split('/');
    const fileName = parts.pop() || '';

    let currentDir = this.directoryHandle;

    // Navigate/create directories
    for (const part of parts) {
      if (part === '') continue;
      try {
        currentDir = await currentDir.getDirectoryHandle(part, { create: true });
      } catch (e) {
        console.error('Failed to create directory:', part);
        return null;
      }
    }

    // Create the file
    try {
      const fileHandle = await currentDir.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();

      return fileHandle;
    } catch (e) {
      console.error('Failed to create file:', fileName);
      return null;
    }
  }

  async createFile(path: string, name: string, content = ''): Promise<boolean> {
    const fullPath = path ? `${path}/${name}` : name;
    return await this.writeFile(fullPath, content);
  }

  async deleteFile(path: string): Promise<boolean> {
    try {
      const parts = path.split('/');
      const fileName = parts.pop();

      if (!fileName || !this.directoryHandle) return false;

      let currentDir = this.directoryHandle;

      // Navigate to parent directory
      for (const part of parts) {
        if (part === '') continue;
        currentDir = await currentDir.getDirectoryHandle(part);
      }

      await currentDir.removeEntry(fileName);

      // Update local state
      this.fileHandles.delete(path);
      this.files.delete(path);

      return true;
    } catch (error) {
      console.error('Failed to delete file:', error);
      return false;
    }
  }

  getFile(path: string): LocalFSFile | undefined {
    return this.files.get(path);
  }

  getAllFiles(): LocalFSFile[] {
    return Array.from(this.files.values());
  }

  isConnected(): boolean {
    return this.directoryHandle !== null;
  }

  clear(): void {
    this.directoryHandle = null;
    this.fileHandles.clear();
    this.files.clear();
    this.ignorePatterns = [];
  }
}

export const localFS = new LocalFileSystem();
