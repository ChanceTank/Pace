/// <reference types="vite/client" />

interface TodoItem {
    id: string;
    text: string;
    completed: boolean;
    timestamp: string;
}

interface Window {
    ipcRenderer: {
        on: (channel: string, listener: (event: unknown, ...args: unknown[]) => void) => void;
        off: (channel: string, listener: (event: unknown, ...args: unknown[]) => void) => void;
        send: (channel: string, ...args: unknown[]) => void;
        invoke: (channel: string, ...args: unknown[]) => void;
    };
    isElectron?: boolean;
    electronAPI?: {
        saveData: (data: TodoItem[]) => Promise<{ success: boolean; error?: string }>;
        loadData: () => Promise<TodoItem[]>;
    };
}
