import type { VirtualFile } from '../types';
import { DEFAULT_PROJECT_FILES } from '../types';

export class VirtualFileSystem {
  private files: Map<string, VirtualFile>;

  constructor(initialFiles: VirtualFile[] = DEFAULT_PROJECT_FILES) {
    this.files = new Map();
    this.loadFiles(initialFiles);
  }

  private loadFiles(files: VirtualFile[], parentPath = '') {
    for (const file of files) {
      // Eğer path mutlak (/ ile başlıyorsa) parentPath eklemeye gerek yok
      const fullPath = file.path.startsWith('/')
        ? file.path.slice(1) // başındaki /'ı kaldır
        : parentPath + file.path;

      this.files.set(fullPath, { ...file, path: fullPath });

      if (file.children) {
        // Children için bu path'i parent olarak kullan
        this.loadFiles(file.children, fullPath + '/');
      }
    }
  }

  getFile(path: string): VirtualFile | undefined {
    return this.files.get(path);
  }

  setFileContent(path: string, content: string): void {
    const file = this.files.get(path);
    if (file) {
      file.content = content;
      this.files.set(path, file);
    }
  }

  createFile(path: string, name: string, content = '', language = 'plaintext'): void {
    const fullPath = path + '/' + name;
    const newFile: VirtualFile = {
      name,
      path: fullPath,
      content,
      type: 'file',
      language,
    };
    this.files.set(fullPath, newFile);
  }

  deleteFile(path: string): void {
    this.files.delete(path);
  }

  getAllFiles(): VirtualFile[] {
    return Array.from(this.files.values()).filter(f => f.type === 'file');
  }

  getDirectoryTree(): VirtualFile[] {
    // Root seviyesindeki öğeleri bul: path'de / içermeyenler
    const rootFiles = Array.from(this.files.values()).filter(f => !f.path.includes('/'));
    return this.buildTree(rootFiles);
  }

  private buildTree(files: VirtualFile[]): VirtualFile[] {
    return files.map(file => {
      if (file.type === 'directory' || this.hasChildren(file.path)) {
        const children = Array.from(this.files.values())
          .filter(f => f.path.startsWith(file.path + '/') && f.path.split('/').length === file.path.split('/').length + 1);
        return { ...file, children: this.buildTree(children) };
      }
      return file;
    });
  }

  private hasChildren(path: string): boolean {
    return Array.from(this.files.keys()).some(key => key.startsWith(path + '/'));
  }

  toWebContainerFiles(): Record<string, { file: { contents: string } }> {
    const result: Record<string, { file: { contents: string } }> = {};
    for (const [path, file] of this.files) {
      if (file.type === 'file' && file.content !== undefined) {
        const webPath = path.startsWith('/') ? path.slice(1) : path;
        result[webPath] = {
          file: { contents: file.content }
        };
      }
    }
    return result;
  }

  clear(): void {
    this.files.clear();
  }

  // LocalFS'ten gelen dosyalarla virtualFS'i güncelle
  loadFromFiles(files: VirtualFile[]): void {
    this.clear();
    this.loadFiles(files);
  }

  reset(): void {
    this.clear();
    this.loadFiles(DEFAULT_PROJECT_FILES);
  }
}

export const virtualFS = new VirtualFileSystem();
