import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Terminal, 
  Power, 
  PowerOff, 
  Trash, 
  Copy, 
  ClipboardPaste,
  MoreVertical,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Terminal as XTerm } from '@xterm/xterm';

interface TerminalPanelProps {
  hostId?: string;
  hostName?: string;
}

export function TerminalPanel({ hostId, hostName }: TerminalPanelProps) {
  const { t } = useTranslation();
  const { settings } = useAppStore();
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showAICompletion, setShowAICompletion] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');

  useEffect(() => {
    if (!terminalRef.current) return;

    // Dynamic import for xterm
    const initTerminal = async () => {
      const { Terminal } = await import('@xterm/xterm');
      const { FitAddon } = await import('@xterm/addon-fit');
      
      const term = new Terminal({
        cursorBlink: true,
        theme: {
          background: '#0f172a',
          foreground: '#e2e8f0',
          cursor: '#0ea5e9',
          black: '#000000',
          red: '#ef4444',
          green: '#22c55e',
          yellow: '#eab308',
          blue: '#3b82f6',
          magenta: '#d946ef',
          cyan: '#06b6d4',
          white: '#ffffff',
          brightBlack: '#475569',
          brightRed: '#f87171',
          brightGreen: '#4ade80',
          brightYellow: '#facc15',
          brightBlue: '#60a5fa',
          brightMagenta: '#e879f9',
          brightCyan: '#22d3ee',
          brightWhite: '#f8fafc'
        },
        fontFamily: settings.terminalFontFamily,
        fontSize: settings.terminalFontSize,
        scrollback: 10000,
        allowProposedApi: true
      });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      
      if (terminalRef.current) {
        term.open(terminalRef.current);
        fitAddon.fit();
      }
      
      xtermRef.current = term;

      // Welcome message
      term.writeln('\x1b[1;36m[NovaSSH Terminal]\x1b[0m Ready for connection');
      term.writeln(`Host: ${hostName || 'Unknown'} (${hostId || 'N/A'})`);
      term.writeln('');
      term.write('\x1b[1;32m➜\x1b[0m ');

      // Handle input
      let currentLine = '';
      term.onData((data) => {
        const code = data.charCodeAt(0);
        
        // Handle special keys
        if (code === 13) { // Enter
          term.writeln('');
          // Simulate command execution
          if (currentLine.trim()) {
            simulateCommand(currentLine.trim(), term);
          }
          currentLine = '';
          term.write('\x1b[1;32m➜\x1b[0m ');
          setShowAICompletion(false);
        } else if (code === 127) { // Backspace
          if (currentLine.length > 0) {
            currentLine = currentLine.slice(0, -1);
            term.write('\b \b');
          }
        } else if (code === 9) { // Tab - AI completion
          if (aiSuggestion) {
            const remaining = aiSuggestion.slice(currentLine.length);
            term.write(remaining);
            currentLine = aiSuggestion;
            setShowAICompletion(false);
          }
        } else if (code >= 32 && code <= 126) { // Printable characters
          currentLine += data;
          term.write(data);
          
          // Simulate AI completion
          if (currentLine.length > 2) {
            simulateAICompletion(currentLine);
          }
        }
      });

      // Handle resize
      const handleResize = () => {
        fitAddon.fit();
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        term.dispose();
      };
    };

    initTerminal();
  }, [hostId, hostName, settings.terminalFontFamily, settings.terminalFontSize]);

  const simulateCommand = (command: string, term: XTerm) => {
    const responses: Record<string, string> = {
      'ls': 'Desktop  Documents  Downloads  Music  Pictures  Videos',
      'pwd': '/home/user',
      'whoami': 'user',
      'uname -a': 'Linux ubuntu 5.15.0-100-generic #110-Ubuntu SMP...',
      'df -h': 'Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1       100G   45G   55G  45% /',
      'free -h': '              total        used        free\nMem:           16Gi       4.2Gi        11Gi'
    };

    const response = responses[command] || `Command not found: ${command}`;
    term.writeln(response);
  };

  const simulateAICompletion = (input: string) => {
    const completions: Record<string, string> = {
      'ls': 'ls -la',
      'cd': 'cd /var/www',
      'git': 'git status',
      'doc': 'docker ps',
      'ssh': 'ssh user@host'
    };

    for (const [prefix, completion] of Object.entries(completions)) {
      if (input.startsWith(prefix) && input !== completion) {
        setAiSuggestion(completion);
        setShowAICompletion(true);
        return;
      }
    }
    setShowAICompletion(false);
  };

  const handleConnect = () => {
    setIsConnecting(true);
    // Simulate connection
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
      if (xtermRef.current) {
        xtermRef.current.writeln('');
        xtermRef.current.writeln('\x1b[1;32m[Connected]\x1b[0m SSH session established');
        xtermRef.current.writeln('');
        xtermRef.current.write('\x1b[1;32muser@server\x1b[0m:\x1b[1;34m~\x1b[0m$ ');
      }
    }, 1500);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    if (xtermRef.current) {
      xtermRef.current.writeln('');
      xtermRef.current.writeln('\x1b[1;31m[Disconnected]\x1b[0m Session closed');
      xtermRef.current.writeln('');
      xtermRef.current.write('\x1b[1;32m➜\x1b[0m ');
    }
  };

  const handleClear = () => {
    xtermRef.current?.clear();
  };

  const handleCopy = () => {
    const selection = xtermRef.current?.getSelection();
    if (selection) {
      navigator.clipboard.writeText(selection);
    }
  };

  const handlePaste = async () => {
    const text = await navigator.clipboard.readText();
    xtermRef.current?.paste(text);
  };

  return (
    <div className="h-full flex flex-col bg-[#0f172a]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-primary" />
          <span className="font-medium">{hostName || 'Terminal'}</span>
          <div className={cn(
            "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs",
            isConnected ? 'bg-green-500/10 text-green-500' : 
            isConnecting ? 'bg-yellow-500/10 text-yellow-500' :
            'bg-gray-500/10 text-gray-500'
          )}>
            <div className={cn(
              "w-1.5 h-1.5 rounded-full",
              isConnected && "bg-green-500",
              isConnecting && "bg-yellow-500 animate-pulse",
              !isConnected && !isConnecting && "bg-gray-500"
            )} />
            {isConnected ? t('terminal.connected') : isConnecting ? t('terminal.connecting') : t('terminal.disconnected')}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {!isConnected ? (
            <Button 
              size="sm" 
              onClick={handleConnect}
              disabled={isConnecting}
            >
              <Power className="w-4 h-4 mr-1" />
              {isConnecting ? t('terminal.connecting') : t('terminal.reconnect')}
            </Button>
          ) : (
            <Button 
              size="sm" 
              variant="destructive"
              onClick={handleDisconnect}
            >
              <PowerOff className="w-4 h-4 mr-1" />
              {t('terminal.disconnect')}
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCopy}>
                <Copy className="w-4 h-4 mr-2" />
                {t('terminal.copy')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePaste}>
                <ClipboardPaste className="w-4 h-4 mr-2" />
                {t('terminal.paste')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => xtermRef.current?.selectAll()}>
                <Copy className="w-4 h-4 mr-2" />
                {t('terminal.selectAll')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleClear}>
                <Trash className="w-4 h-4 mr-2" />
                {t('terminal.clear')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Terminal */}
      <div className="flex-1 relative overflow-hidden">
        <div ref={terminalRef} className="absolute inset-0 p-2" />
        
        {/* AI Completion Hint */}
        {showAICompletion && (
          <div className="absolute bottom-4 left-4 bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
            <Zap className="w-3 h-3" />
            <span>Press Tab to complete: {aiSuggestion}</span>
          </div>
        )}
      </div>
    </div>
  );
}
