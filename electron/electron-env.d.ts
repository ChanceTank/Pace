/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬─┬ dist
     * │ │ └── index.html
     * │ │
     * │ ├─┬ dist-electron
     * │ │ ├── main.js
     * │ │ └── preload.js
     * │
     * ```
     */
    APP_ROOT: string
    /** /dist/ or /public/ */
    VITE_PUBLIC: string
  }
}

// Used in Renderer process, expose in `preload.ts`
interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  timestamp: string;
}

interface ElectronAPI {
  saveData: (data: TodoItem[]) => Promise<{ success: boolean; error?: string }>;
  loadData: () => Promise<TodoItem[]>;
}

interface Window {
  ipcRenderer: import('electron').IpcRenderer
  isElectron: boolean
  electronAPI: ElectronAPI
}
