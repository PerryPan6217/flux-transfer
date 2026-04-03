import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Bot, 
  Send, 
  Github, 
  Loader2, 
  Copy, 
  Check,
  Sparkles,
  Terminal,
  Code,
  MessageSquare,
  Trash2,
  LogOut,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

const suggestions = [
  { icon: Terminal, text: 'How do I check disk usage?' },
  { icon: Code, text: 'Explain this error: Permission denied' },
  { icon: MessageSquare, text: 'Help me write a bash script' },
  { icon: Zap, text: 'Optimize this command' },
];

export function AIAssistance() {
  const { t } = useTranslation();
  const { 
    aiConfig, 
    setAIConfig, 
    chatMessages, 
    addChatMessage, 
    clearChatMessages,
    isAILoggedIn 
  } = useAppStore();
  
  const [inputMessage, setInputMessage] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setTimeout(() => {
      setAIConfig({
        enabled: true,
        token: 'mock-token-' + Date.now(),
        refreshToken: 'mock-refresh-token',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        selectedModel: 'gpt4',
        availableModels: ['gpt4', 'chat', 'claude']
      });
      setIsLoggingIn(false);
    }, 2000);
  };

  const handleLogout = () => {
    setAIConfig({
      enabled: false,
      token: undefined,
      refreshToken: undefined,
      expiresAt: undefined,
      selectedModel: 'gpt4',
      availableModels: ['gpt4', 'chat', 'claude']
    });
    clearChatMessages();
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    addChatMessage({
      role: 'user',
      content: inputMessage,
      model: aiConfig.selectedModel
    });

    setTimeout(() => {
      addChatMessage({
        role: 'assistant',
        content: `I'll help you with that. Here's what I found:\n\n\`\`\`bash\n# Example command\n${inputMessage.toLowerCase().includes('disk') ? 'df -h' : 'ls -la'}\n\`\`\`\n\nThis command will show you the information you requested. Let me know if you need more details!`,
        model: aiConfig.selectedModel
      });
    }, 1000);

    setInputMessage('');
  };

  const handleCopyMessage = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSuggestionClick = (text: string) => {
    setInputMessage(text);
  };

  // Login Screen
  if (!isAILoggedIn()) {
    return (
      <div className="h-full flex items-center justify-center p-6 animate-fadeIn">
        <Card className="max-w-md w-full border border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-500">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
              <Bot className="w-10 h-10 text-primary" />
            </div>
            
            <h2 className="text-2xl font-bold mb-2">{t('ai.loginTitle')}</h2>
            <p className="text-muted-foreground mb-8">
              {t('ai.loginDescription')}
            </p>

            <Button 
              size="lg" 
              className="w-full hover:shadow-lg hover:shadow-primary/20 transition-shadow"
              onClick={handleLogin}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('ai.loggingIn')}
                </>
              ) : (
                <>
                  <Github className="w-4 h-4 mr-2" />
                  {t('ai.authenticate')}
                </>
              )}
            </Button>

            <div className="mt-6 text-sm text-muted-foreground">
              <p>Supported models:</p>
              <div className="flex justify-center gap-2 mt-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary">GPT-4</Badge>
                <Badge variant="secondary" className="bg-purple-500/10 text-purple-500">Claude</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Chat Interface
  return (
    <div className="h-full flex flex-col animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center animate-pulse-glow">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">{t('ai.title')}</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Connected
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Select
            value={aiConfig.selectedModel}
            onValueChange={(v) => setAIConfig({ selectedModel: v })}
          >
            <SelectTrigger className="w-40 bg-card/50 backdrop-blur-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt4">{t('ai.models.gpt4')}</SelectItem>
              <SelectItem value="chat">{t('ai.models.chat')}</SelectItem>
              <SelectItem value="claude">{t('ai.models.claude')}</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="ghost" size="icon" onClick={clearChatMessages} className="hover:bg-destructive/10 hover:text-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
          
          <Button variant="ghost" size="icon" onClick={handleLogout} className="hover:bg-muted">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          {/* Welcome Message */}
          {chatMessages.length === 0 && (
            <div className="text-center py-8 animate-fadeInUp">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">
                {t('ai.chat.welcomeMessage')}
              </h3>
              
              {/* Suggestions */}
              <div className="grid grid-cols-2 gap-3 mt-6 max-w-lg mx-auto">
                {suggestions.map((suggestion, i) => {
                  const Icon = suggestion.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => handleSuggestionClick(suggestion.text)}
                      className="flex items-center gap-3 p-3 text-left rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary hover:bg-primary/5 transition-all duration-200 hover:shadow-lg hover:shadow-primary/10"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <Icon className="w-4 h-4 text-primary" />
                      <span className="text-sm">{suggestion.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {chatMessages.map((message, index) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 animate-fadeInUp",
                message.role === 'user' ? 'flex-row-reverse' : ''
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                message.role === 'user' ? 'bg-primary/10' : 'bg-primary'
              )}>
                {message.role === 'user' ? (
                  <div className="w-4 h-4 rounded-full bg-primary" />
                ) : (
                  <Bot className="w-4 h-4 text-primary-foreground" />
                )}
              </div>
              
              <div className={cn(
                "max-w-[80%] rounded-2xl p-4 backdrop-blur-sm",
                message.role === 'user' 
                  ? 'bg-primary text-primary-foreground rounded-tr-none' 
                  : 'bg-muted/80 rounded-tl-none'
              )}>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {message.content.split('\n').map((line, i) => {
                    if (line.startsWith('```')) {
                      return null;
                    }
                    if (line.startsWith('#')) {
                      return <h4 key={i} className="font-bold mt-2">{line.replace('#', '').trim()}</h4>;
                    }
                    return <p key={i} className="mb-1">{line}</p>;
                  })}
                </div>
                
                {/* Code blocks */}
                {message.content.includes('```') && (
                  <div className="mt-2 relative">
                    <pre className="bg-black/50 rounded-lg p-3 overflow-x-auto">
                      <code className="text-sm font-mono text-green-400">
                        {message.content.match(/```[\s\S]*?```/)?.[0]?.replace(/```/g, '')}
                      </code>
                    </pre>
                    <button
                      onClick={() => handleCopyMessage(
                        message.content.match(/```[\s\S]*?```/)?.[0]?.replace(/```/g, '') || '',
                        message.id
                      )}
                      className="absolute top-2 right-2 p-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      {copiedId === message.id ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                )}
                
                <div className={cn(
                  "text-xs mt-2",
                  message.role === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground'
                )}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={t('ai.chat.placeholder')}
            className="flex-1 bg-background/50 backdrop-blur-sm"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            className="hover:shadow-lg hover:shadow-primary/20 transition-shadow"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
