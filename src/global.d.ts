declare global {
  interface Window {
    showDirectoryPicker?: (options?: {
      mode?: 'read' | 'readwrite';
      id?: string;
    }) => Promise<FileSystemDirectoryHandle>;
  }

  interface FileSystemDirectoryHandle {
    name: string;
    kind: 'directory';
    isSameEntry(other: FileSystemDirectoryHandle): Promise<boolean>;
    values(): AsyncIterableIterator<FileSystemHandle>;
    getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<FileSystemDirectoryHandle>;
    getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>;
    removeEntry(name: string, options?: { recursive?: boolean }): Promise<void>;
    queryPermission?(options?: { mode?: 'read' | 'readwrite' }): Promise<PermissionState>;
    requestPermission?(options?: { mode?: 'read' | 'readwrite' }): Promise<PermissionState>;
  }

  interface FileSystemFileHandle {
    name: string;
    kind: 'file';
    isSameEntry(other: FileSystemFileHandle): Promise<boolean>;
    getFile(): Promise<File>;
    createWritable(): Promise<FileSystemWritableFileStream>;
  }

  interface FileSystemHandle {
    name: string;
    kind: 'file' | 'directory';
    isSameEntry(other: FileSystemHandle): Promise<boolean>;
  }

  interface FileSystemWritableFileStream extends WritableStream {
    write(data: string | Uint8Array | Blob | WriteParams): Promise<void>;
    seek(position: number): Promise<void>;
    truncate(size: number): Promise<void>;
    close(): Promise<void>;
  }

  interface WriteParams {
    type?: 'write' | 'seek' | 'truncate';
    data?: string | Uint8Array | Blob;
    position?: number;
    size?: number;
  }

  type PermissionState = 'granted' | 'denied' | 'prompt';
}

export {};
