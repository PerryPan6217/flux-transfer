/**
 * Backend Service Interface
 * 
 * This file defines the interface for communicating with the Go/Wails backend.
 * All methods are async and return Promises to accommodate the Wails bridge.
 */

import type { Host, FileItem } from '@/types';

// Host Management
export interface HostService {
  /** Test SSH connection to a host */
  testConnection(host: Host): Promise<{ success: boolean; error?: string }>;
  
  /** Import hosts from WinSCP INI file */
  importWinSCPHosts(filePath: string): Promise<{ hosts: Host[]; errors: string[] }>;
  
  /** Export hosts to file */
  exportHosts(hosts: Host[], format: 'json' | 'csv'): Promise<string>;
}

// SSH Terminal
export interface SSHService {
  /** Create new SSH session */
  createSession(hostId: string): Promise<{ sessionId: string; error?: string }>;
  
  /** Close SSH session */
  closeSession(sessionId: string): Promise<void>;
  
  /** Send data to terminal */
  sendData(sessionId: string, data: string): Promise<void>;
  
  /** Resize terminal */
  resize(sessionId: string, cols: number, rows: number): Promise<void>;
  
  /** Set up data callback */
  onData(sessionId: string, callback: (data: string) => void): void;
  
  /** Set up connection status callback */
  onStatusChange(sessionId: string, callback: (status: 'connected' | 'disconnected' | 'error', error?: string) => void): void;
}

// SFTP File Transfer
export interface SFTPService {
  /** Create SFTP session */
  createSession(hostId: string): Promise<{ sessionId: string; error?: string }>;
  
  /** Close SFTP session */
  closeSession(sessionId: string): Promise<void>;
  
  /** List directory contents */
  listDirectory(sessionId: string, path: string): Promise<{ files: FileItem[]; error?: string }>;
  
  /** Upload file */
  uploadFile(sessionId: string, localPath: string, remotePath: string, onProgress?: (progress: number) => void): Promise<{ success: boolean; error?: string }>;
  
  /** Download file */
  downloadFile(sessionId: string, remotePath: string, localPath: string, onProgress?: (progress: number) => void): Promise<{ success: boolean; error?: string }>;
  
  /** Delete file or directory */
  delete(sessionId: string, path: string, recursive?: boolean): Promise<{ success: boolean; error?: string }>;
  
  /** Rename file or directory */
  rename(sessionId: string, oldPath: string, newPath: string): Promise<{ success: boolean; error?: string }>;
  
  /** Create directory */
  createDirectory(sessionId: string, path: string): Promise<{ success: boolean; error?: string }>;
  
  /** Get file content for editing */
  readFile(sessionId: string, path: string): Promise<{ content: string; error?: string }>;
  
  /** Write file content */
  writeFile(sessionId: string, path: string, content: string): Promise<{ success: boolean; error?: string }>;
  
  /** Get file/directory info */
  getInfo(sessionId: string, path: string): Promise<{ info: FileItem; error?: string }>;
  
  /** Change file permissions */
  chmod(sessionId: string, path: string, mode: string): Promise<{ success: boolean; error?: string }>;
  
  /** Change file owner */
  chown(sessionId: string, path: string, owner: string, group: string): Promise<{ success: boolean; error?: string }>;
}

// Port Forwarding
export interface PortForwardingService {
  /** Start port forwarding rule */
  startRule(ruleId: string): Promise<{ success: boolean; error?: string }>;
  
  /** Stop port forwarding rule */
  stopRule(ruleId: string): Promise<void>;
  
  /** Get rule status */
  getStatus(ruleId: string): Promise<{ active: boolean; localAddress?: string; error?: string }>;
  
  /** List all active rules */
  listActiveRules(): Promise<string[]>;
}

// AI/GitHub Copilot
export interface AIService {
  /** Initiate GitHub device flow login */
  initiateLogin(): Promise<{ deviceCode: string; userCode: string; verificationUri: string; expiresIn: number }>;
  
  /** Poll for login completion */
  pollLogin(deviceCode: string): Promise<{ success: boolean; token?: string; refreshToken?: string; expiresIn?: number; error?: string }>;
  
  /** Refresh access token */
  refreshToken(refreshToken: string): Promise<{ success: boolean; token?: string; expiresIn?: number; error?: string }>;
  
  /** Send chat message */
  sendMessage(message: string, model: string, context?: string[]): Promise<{ response: string; error?: string }>;
  
  /** Get command suggestions */
  getCommandSuggestions(partialCommand: string, cwd: string): Promise<{ suggestions: string[]; error?: string }>;
  
  /** Stream chat response */
  streamMessage(message: string, model: string, onChunk: (chunk: string) => void): Promise<void>;
}

// System/Settings
export interface SystemService {
  /** Get system info */
  getSystemInfo(): Promise<{ platform: string; arch: string; version: string }>;
  
  /** Check for updates */
  checkForUpdates(): Promise<{ hasUpdate: boolean; version?: string; downloadUrl?: string }>;
  
  /** Get available fonts */
  getAvailableFonts(): Promise<string[]>;
  
  /** Open external link */
  openExternal(url: string): Promise<void>;
  
  /** Show item in folder */
  showItemInFolder(path: string): Promise<void>;
}

// Main Backend Interface
export interface BackendAPI {
  host: HostService;
  ssh: SSHService;
  sftp: SFTPService;
  portForwarding: PortForwardingService;
  ai: AIService;
  system: SystemService;
}

// Mock implementation for development
export const mockBackend: BackendAPI = {
  host: {
    testConnection: async () => ({ success: true }),
    importWinSCPHosts: async () => ({ hosts: [], errors: [] }),
    exportHosts: async () => '',
  },
  ssh: {
    createSession: async () => ({ sessionId: 'mock-' + Date.now() }),
    closeSession: async () => {},
    sendData: async () => {},
    resize: async () => {},
    onData: () => {},
    onStatusChange: () => {},
  },
  sftp: {
    createSession: async () => ({ sessionId: 'mock-' + Date.now() }),
    closeSession: async () => {},
    listDirectory: async () => ({ files: [], error: undefined }),
    uploadFile: async () => ({ success: true }),
    downloadFile: async () => ({ success: true }),
    delete: async () => ({ success: true }),
    rename: async () => ({ success: true }),
    createDirectory: async () => ({ success: true }),
    readFile: async () => ({ content: '', error: undefined }),
    writeFile: async () => ({ success: true }),
    getInfo: async () => ({ info: {} as FileItem, error: undefined }),
    chmod: async () => ({ success: true }),
    chown: async () => ({ success: true }),
  },
  portForwarding: {
    startRule: async () => ({ success: true }),
    stopRule: async () => {},
    getStatus: async () => ({ active: false }),
    listActiveRules: async () => [],
  },
  ai: {
    initiateLogin: async () => ({ 
      deviceCode: 'mock-device-code', 
      userCode: 'ABCD-1234', 
      verificationUri: 'https://github.com/login/device', 
      expiresIn: 900 
    }),
    pollLogin: async () => ({ success: true, token: 'mock-token', refreshToken: 'mock-refresh', expiresIn: 3600 }),
    refreshToken: async () => ({ success: true, token: 'mock-token', expiresIn: 3600 }),
    sendMessage: async () => ({ response: 'Mock AI response' }),
    getCommandSuggestions: async () => ({ suggestions: [] }),
    streamMessage: async () => {},
  },
  system: {
    getSystemInfo: async () => ({ platform: 'mock', arch: 'x64', version: '1.0.0' }),
    checkForUpdates: async () => ({ hasUpdate: false }),
    getAvailableFonts: async () => ['JetBrains Mono', 'Fira Code', 'Consolas'],
    openExternal: async () => {},
    showItemInFolder: async () => {},
  },
};

// Global backend instance (will be injected by Wails)
declare global {
  interface Window {
    backend?: BackendAPI;
    go?: {
      main: {
        App: BackendAPI;
      };
    };
  }
}

/** Get the backend API instance */
export function getBackend(): BackendAPI {
  // In Wails environment, backend is available via window.go.main.App
  if (window.go?.main?.App) {
    return window.go.main.App;
  }
  
  // Fallback to mock for development
  console.warn('Backend not available, using mock implementation');
  return mockBackend;
}

export default getBackend;
