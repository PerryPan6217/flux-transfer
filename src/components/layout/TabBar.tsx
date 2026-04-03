import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';
import { X, Terminal, Folder, Home, Server, Route, Bot, Settings } from 'lucide-react';
import { useRef } from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

const iconMap = {
  home: Home,
  hub: Server,
  port: Route,
  ai: Bot,
  settings: Settings,
  ssh: Terminal,
  sftp: Folder,
};

export function TabBar() {
  const { t } = useTranslation();
  const { tabs, activeTabId, setActiveTab, closeTab, closeAllTabs, closeOtherTabs } = useAppStore();
  const tabBarRef = useRef<HTMLDivElement>(null);

  const handleClose = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    closeTab(id);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (tabBarRef.current) {
      tabBarRef.current.scrollLeft += e.deltaY;
    }
  };

  if (tabs.length === 0) return null;

  return (
    <div 
      ref={tabBarRef}
      onWheel={handleWheel}
      className="flex h-11 bg-card/80 backdrop-blur-md border-b border-border overflow-x-auto scrollbar-hide px-1"
    >
      {tabs.map((tab, index) => {
        const Icon = iconMap[tab.type] || Server;
        const isActive = activeTabId === tab.id;

        return (
          <ContextMenu key={tab.id}>
            <ContextMenuTrigger asChild>
              <div
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "group flex items-center gap-2 min-w-[120px] max-w-[200px] h-9 px-3 mt-1.5 rounded-t-lg cursor-pointer transition-all duration-200 border-b-2 select-none relative overflow-hidden animate-slideIn",
                  isActive 
                    ? "bg-background/80 backdrop-blur-sm border-primary text-foreground font-medium shadow-sm" 
                    : "bg-transparent border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <Icon className={cn(
                  "w-4 h-4 flex-shrink-0 transition-transform duration-200 relative z-10",
                  isActive && "scale-110"
                )} />
                <span className="truncate flex-1 text-sm relative z-10">{tab.label}</span>
                {tab.closable && (
                  <button
                    onClick={(e) => handleClose(e, tab.id)}
                    className={cn(
                      "p-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-destructive/10 hover:text-destructive relative z-10",
                      isActive && "opacity-100"
                    )}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                
                {/* Active indicator line */}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary animate-fadeIn" />
                )}
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent className="backdrop-blur-md bg-popover/95">
              {tab.closable && (
                <>
                  <ContextMenuItem onClick={() => closeTab(tab.id)}>
                    {t('common.close')}
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => closeOtherTabs(tab.id)}>
                    {t('common.close')} {t('common.other')}
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                </>
              )}
              <ContextMenuItem onClick={() => closeAllTabs()}>
                {t('common.close')} {t('common.all')}
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        );
      })}
    </div>
  );
}
