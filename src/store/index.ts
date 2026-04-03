import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  Host, 
  PortForwardingRule, 
  Tab, 
  ChatMessage, 
  AIConfig, 
  AppSettings,
  FileItem,
  ThemeMode,
  Language
} from '@/types';

interface AppState {
  // Tabs
  tabs: Tab[];
  activeTabId: string;
  addTab: (tab: Omit<Tab, 'id'> & { id?: string }) => string;
  closeTab: (id: string) => void;
  closeAllTabs: () => void;
  closeOtherTabs: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTab: (id: string, updates: Partial<Tab>) => void;
  
  // Hosts
  hosts: Host[];
  addHost: (host: Omit<Host, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateHost: (id: string, updates: Partial<Host>) => void;
  deleteHost: (id: string) => void;
  getHostById: (id: string) => Host | undefined;
  
  // Port Forwarding
  portRules: PortForwardingRule[];
  addPortRule: (rule: Omit<PortForwardingRule, 'id'>) => string;
  updatePortRule: (id: string, updates: Partial<PortForwardingRule>) => void;
  deletePortRule: (id: string) => void;
  togglePortRule: (id: string) => void;
  
  // AI
  aiConfig: AIConfig;
  setAIConfig: (config: Partial<AIConfig>) => void;
  chatMessages: ChatMessage[];
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChatMessages: () => void;
  isAILoggedIn: () => boolean;
  
  // Settings
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  resetSettings: () => void;
  
  // SFTP
  sftpSessions: Map<string, {
    currentPath: string;
    files: FileItem[];
    selectedFiles: Set<string>;
  }>;
  updateSftpSession: (sessionId: string, updates: Partial<{
    currentPath: string;
    files: FileItem[];
    selectedFiles: Set<string>;
  }>) => void;
  
  // Terminal
  terminalSessions: Map<string, {
    connected: boolean;
    cwd: string;
  }>;
  updateTerminalSession: (sessionId: string, updates: Partial<{
    connected: boolean;
    cwd: string;
  }>) => void;
}

const defaultSettings: AppSettings = {
  theme: 'system',
  language: 'system',
  uiFontSize: 'medium',
  terminalFontSize: 14,
  terminalFontFamily: 'JetBrains Mono, monospace',
  showHiddenFiles: false,
  confirmBeforeDelete: true,
  autoSaveSessions: true
};

const defaultAIConfig: AIConfig = {
  enabled: false,
  selectedModel: 'gpt4',
  availableModels: ['gpt4', 'chat', 'claude']
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Tabs
      tabs: [
        { id: 'home', label: 'Home', type: 'home', closable: false },
        { id: 'hub', label: 'Connection Hub', type: 'hub', closable: false },
        { id: 'port', label: 'Port Forwarding', type: 'port', closable: false },
        { id: 'ai', label: 'AI Assistance', type: 'ai', closable: false },
        { id: 'settings', label: 'Settings', type: 'settings', closable: false }
      ],
      activeTabId: 'home',
      
      addTab: (tab) => {
        const id = tab.id || `${tab.type}-${Date.now()}`;
        const existingTab = get().tabs.find(t => t.id === id);
        if (existingTab) {
          set({ activeTabId: id });
          return id;
        }
        set(state => ({
          tabs: [...state.tabs, { ...tab, id }],
          activeTabId: id
        }));
        return id;
      },
      
      closeTab: (id) => {
        const tab = get().tabs.find(t => t.id === id);
        if (!tab?.closable) return;
        
        set(state => {
          const newTabs = state.tabs.filter(t => t.id !== id);
          let newActiveId = state.activeTabId;
          if (state.activeTabId === id) {
            const index = state.tabs.findIndex(t => t.id === id);
            newActiveId = state.tabs[Math.max(0, index - 1)]?.id || 'home';
          }
          return { tabs: newTabs, activeTabId: newActiveId };
        });
      },
      
      closeAllTabs: () => {
        set(state => ({
          tabs: state.tabs.filter(t => !t.closable),
          activeTabId: 'home'
        }));
      },
      
      closeOtherTabs: (id) => {
        set(state => ({
          tabs: state.tabs.filter(t => !t.closable || t.id === id),
          activeTabId: id
        }));
      },
      
      setActiveTab: (id) => set({ activeTabId: id }),
      
      updateTab: (id, updates) => {
        set(state => ({
          tabs: state.tabs.map(t => t.id === id ? { ...t, ...updates } : t)
        }));
      },
      
      // Hosts
      hosts: [
        {
          id: 'demo-1',
          name: 'Ubuntu Server',
          host: '192.168.1.100',
          port: 22,
          username: 'root',
          authType: 'password',
          group: 'Production',
          tags: ['ubuntu', 'server'],
          lastConnected: new Date(Date.now() - 86400000),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'demo-2',
          name: 'Development VM',
          host: '10.0.0.5',
          port: 22,
          username: 'developer',
          authType: 'key',
          group: 'Development',
          tags: ['dev', 'vm'],
          lastConnected: new Date(Date.now() - 172800000),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      
      addHost: (host) => {
        const id = `host-${Date.now()}`;
        set(state => ({
          hosts: [...state.hosts, { 
            ...host, 
            id, 
            createdAt: new Date(), 
            updatedAt: new Date() 
          }]
        }));
        return id;
      },
      
      updateHost: (id, updates) => {
        set(state => ({
          hosts: state.hosts.map(h => 
            h.id === id ? { ...h, ...updates, updatedAt: new Date() } : h
          )
        }));
      },
      
      deleteHost: (id) => {
        set(state => ({
          hosts: state.hosts.filter(h => h.id !== id)
        }));
      },
      
      getHostById: (id) => {
        return get().hosts.find(h => h.id === id);
      },
      
      // Port Forwarding
      portRules: [],
      
      addPortRule: (rule) => {
        const id = `rule-${Date.now()}`;
        set(state => ({
          portRules: [...state.portRules, { ...rule, id }]
        }));
        return id;
      },
      
      updatePortRule: (id, updates) => {
        set(state => ({
          portRules: state.portRules.map(r => 
            r.id === id ? { ...r, ...updates } : r
          )
        }));
      },
      
      deletePortRule: (id) => {
        set(state => ({
          portRules: state.portRules.filter(r => r.id !== id)
        }));
      },
      
      togglePortRule: (id) => {
        set(state => ({
          portRules: state.portRules.map(r => 
            r.id === id ? { ...r, enabled: !r.enabled } : r
          )
        }));
      },
      
      // AI
      aiConfig: defaultAIConfig,
      chatMessages: [],
      
      setAIConfig: (config) => {
        set(state => ({
          aiConfig: { ...state.aiConfig, ...config }
        }));
      },
      
      addChatMessage: (message) => {
        const newMessage: ChatMessage = {
          ...message,
          id: `msg-${Date.now()}`,
          timestamp: new Date()
        };
        set(state => ({
          chatMessages: [...state.chatMessages, newMessage]
        }));
      },
      
      clearChatMessages: () => {
        set({ chatMessages: [] });
      },
      
      isAILoggedIn: () => {
        const { aiConfig } = get();
        if (!aiConfig.enabled || !aiConfig.token) return false;
        if (aiConfig.expiresAt && new Date() > aiConfig.expiresAt) return false;
        return true;
      },
      
      // Settings
      settings: defaultSettings,
      
      updateSettings: (newSettings) => {
        set(state => ({
          settings: { ...state.settings, ...newSettings }
        }));
      },
      
      resetSettings: () => {
        set({ settings: defaultSettings });
      },
      
      // SFTP Sessions
      sftpSessions: new Map(),
      
      updateSftpSession: (sessionId, updates) => {
        set(state => {
          const newSessions = new Map(state.sftpSessions);
          const current = newSessions.get(sessionId) || {
            currentPath: '/',
            files: [],
            selectedFiles: new Set()
          };
          newSessions.set(sessionId, { ...current, ...updates });
          return { sftpSessions: newSessions };
        });
      },
      
      // Terminal Sessions
      terminalSessions: new Map(),
      
      updateTerminalSession: (sessionId, updates) => {
        set(state => {
          const newSessions = new Map(state.terminalSessions);
          const current = newSessions.get(sessionId) || {
            connected: false,
            cwd: '~'
          };
          newSessions.set(sessionId, { ...current, ...updates });
          return { terminalSessions: newSessions };
        });
      }
    }),
    {
      name: 'novassh-storage',
      partialize: (state) => ({
        hosts: state.hosts,
        portRules: state.portRules,
        aiConfig: state.aiConfig,
        settings: state.settings,
        chatMessages: state.chatMessages.slice(-100) // Keep last 100 messages
      })
    }
  )
);

// Theme hook
export const useTheme = () => {
  const { settings, updateSettings } = useAppStore();
  
  const setTheme = (theme: ThemeMode) => {
    updateSettings({ theme });
    applyTheme(theme);
  };
  
  return {
    theme: settings.theme,
    setTheme
  };
};

// Language hook
export const useLanguage = () => {
  const { settings, updateSettings } = useAppStore();
  
  const setLanguage = (language: Language) => {
    updateSettings({ language });
  };
  
  return {
    language: settings.language,
    setLanguage
  };
};

// Apply theme to document
export const applyTheme = (theme: ThemeMode) => {
  const root = window.document.documentElement;
  root.classList.remove('light', 'dark');
  
  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    root.classList.add(systemTheme);
  } else {
    root.classList.add(theme);
  }
};
