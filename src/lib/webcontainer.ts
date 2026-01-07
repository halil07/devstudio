import { WebContainer } from '@webcontainer/api';
import type { TerminalLine } from '../types';

export class WebContainerManager {
  private webcontainer: WebContainer | null = null;
  private process: any = null;
  private onOutputCallback: ((line: TerminalLine) => void) | undefined;
  private onUrlChangeCallback: ((url: string) => void) | undefined;
  private serverUrl: string | null = null;
  private webContainerUrl: string | null = null;
  private containerId: string | null = null;
  private serverReadyUnsubscribe: (() => void) | null = null;

  async boot(): Promise<void> {
    if (this.webcontainer) {
      return;
    }

    this.addLine('Initializing WebContainer...', 'info');
    this.webcontainer = await WebContainer.boot();

    const wc = this.webcontainer as any;

    // server-ready event'ine abone ol
    if (wc.on) {
      this.serverReadyUnsubscribe = wc.on('server-ready', (port: number, url: string) => {
        this.addLine(`Server ready on port ${port}: ${url}`, 'info');
        this.serverUrl = url;
        if (this.onUrlChangeCallback) {
          this.onUrlChangeCallback(url);
        }
      });
    }

    this.addLine(`WebContainer ready!`, 'info');
  }

  async mountFiles(files: Record<string, { file: { contents: string } }>): Promise<void> {
    if (!this.webcontainer) {
      await this.boot();
    }

    if (this.webcontainer) {
      this.addLine('Mounting files...', 'info');

      // WebContainer mount yerine fs.writeFile kullan
      const fs = this.webcontainer.fs;

      // Dizinleri önceden oluştur
      const dirs = new Set<string>();
      for (const path of Object.keys(files)) {
        const dirPath = path.substring(0, path.lastIndexOf('/'));
        if (dirPath && !dirs.has(dirPath)) {
          dirs.add(dirPath);
        }
      }

      // Dizinleri oluştur (alfabetik sırada, iç içe olanlar için)
      const sortedDirs = Array.from(dirs).sort();
      for (const dir of sortedDirs) {
        try {
          await fs.mkdir(dir, { recursive: true });
        } catch (e) {
          // Dizin zaten var olabilir, yoksay
        }
      }

      // Dosyaları yaz (alfabetik sırada)
      const sortedFiles = Object.keys(files).sort();
      for (const path of sortedFiles) {
        try {
          await fs.writeFile(path, files[path].file.contents);
        } catch (e) {
          this.addLine(`Failed to write ${path}: ${e}`, 'stderr');
        }
      }

      this.addLine('Files mounted successfully', 'info');
    }
  }

  async installDependencies(): Promise<void> {
    if (!this.webcontainer) return;

    this.addLine('Installing dependencies...', 'info');
    
    const installProcess = await this.webcontainer.spawn('pnpm', ['install']);
    
    installProcess.output.pipeTo(new WritableStream({
      write: (data: string) => {
        this.addLine(data, 'stdout');
      }
    }));

    const exitCode = await installProcess.exit;
    
    if (exitCode === 0) {
      this.addLine('Dependencies installed successfully!', 'info');
    } else {
      this.addLine('Failed to install dependencies', 'stderr');
    }
  }

  async startDevServer(): Promise<void> {
    if (!this.webcontainer) return;

    this.addLine('Starting dev server...', 'info');

    // server-ready event'i URL'yi verecek
    this.process = await this.webcontainer.spawn('pnpm', ['run', 'dev']);

    this.process.output.pipeTo(new WritableStream({
      write: (data: string) => {
        this.addLine(data, 'stdout');
      }
    }));
  }

  async stop(): Promise<void> {
    if (this.process) {
      try {
        await this.process.kill();
        this.addLine('Dev server stopped', 'info');
      } catch (e) {
        // Process might have already exited
      }
      this.process = null;
    }

    this.serverUrl = null;

    if (this.onUrlChangeCallback) {
      this.onUrlChangeCallback('');
    }
  }

  setOutputCallback(callback: (line: TerminalLine) => void): void {
    this.onOutputCallback = callback;
  }

  setUrlChangeCallback(callback: (url: string) => void): void {
    this.onUrlChangeCallback = callback;
  }

  private addLine(content: string, type: string): void {
    if (this.onOutputCallback) {
      this.onOutputCallback({
        id: Date.now() + '-' + Math.random(),
        content,
        type: type as 'stdout' | 'stderr' | 'command' | 'info',
        timestamp: Date.now()
      });
    }
  }

  isReady(): boolean {
    return this.webcontainer !== null;
  }

  // WebContainer'daki dosyayı güncelle
  async writeFile(path: string, content: string): Promise<void> {
    if (!this.webcontainer) return;

    try {
      const fs = this.webcontainer.fs;
      await fs.writeFile(path, content);
      this.addLine(`Updated in WebContainer: ${path}`, 'info');
    } catch (e) {
      this.addLine(`Failed to update ${path}: ${e}`, 'stderr');
    }
  }

  async cleanup(): Promise<void> {
    await this.stop();

    // server-ready listener'ı temizle
    if (this.serverReadyUnsubscribe) {
      this.serverReadyUnsubscribe();
      this.serverReadyUnsubscribe = null;
    }

    this.webcontainer = null;
  }
}

export const webContainerManager = new WebContainerManager();
