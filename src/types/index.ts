// Types for NovaSSH Client

export interface Host {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  authType: 'password' | 'key';
  password?: string;
  privateKey?: string;
  passphrase?: string;
  group?: string;
  tags?: string[];
  lastConnected?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PortForwardingRule {
  id: string;
  name: string;
  hostId: string;
  type: 'local' | 'remote' | 'dynamic';
  localPort: number;
  localHost?: string;
  remotePort: number;
  remoteHost?: string;
  enabled: boolean;
}

export interface Tab {
  id: string;
  label: string;
  type: 'home' | 'hub' | 'port' | 'ai' | 'settings' | 'ssh' | 'sftp';
  closable: boolean;
  hostId?: string;
  hostName?: string;
  data?: Record<string, any>;
}

export interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'directory' | 'symlink';
  size: number;
  modifiedAt: Date;
  permissions: string;
  owner: string;
  group: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  model?: string;
}

export interface AIConfig {
  enabled: boolean;
  token?: string;
  refreshToken?: string;
  expiresAt?: Date;
  selectedModel: string;
  availableModels: string[];
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'zh-CN' | 'zh-TW' | 'system';
  uiFontSize: 'small' | 'medium' | 'large';
  terminalFontSize: number;
  terminalFontFamily: string;
  showHiddenFiles: boolean;
  confirmBeforeDelete: boolean;
  autoSaveSessions: boolean;
}

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  disabled?: boolean;
  divider?: boolean;
  danger?: boolean;
  action?: () => void;
  children?: ContextMenuItem[];
}

export type NavItem = {
  id: string;
  label: string;
  icon: string;
  type: 'home' | 'hub' | 'port' | 'ai' | 'settings';
};

export interface TerminalSession {
  id: string;
  hostId: string;
  connected: boolean;
  cwd: string;
}

export interface SFTPSession {
  id: string;
  hostId: string;
  currentPath: string;
  connected: boolean;
}

export type ThemeMode = 'light' | 'dark' | 'system';
export type Language = 'en' | 'zh-CN' | 'zh-TW' | 'system';
