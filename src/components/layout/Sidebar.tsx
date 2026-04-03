import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Server, 
  Route, 
  Bot, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Terminal
} from 'lucide-react';

const navItems = [
  { id: 'home', icon: Home, labelKey: 'nav.home' },
  { id: 'hub', icon: Server, labelKey: 'nav.connectionHub' },
  { id: 'port', icon: Route, labelKey: 'nav.portForwarding' },
  { id: 'ai', icon: Bot, labelKey: 'nav.aiAssistance' },
  { id: 'settings', icon: Settings, labelKey: 'nav.settings' },
] as const;

export function Sidebar() {
  const { t } = useTranslation();
  const { activeTabId, setActiveTab, tabs } = useAppStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleNavClick = (id: string) => {
    const existingTab = tabs.find(t => t.id === id);
    if (existingTab) {
      setActiveTab(id);
    }
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside 
      className={cn(
        "flex flex-col bg-sidebar/80 backdrop-blur-xl border-r border-sidebar-border z-20 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "p-4 flex items-center h-16 border-b border-sidebar-border transition-all duration-300",
        isCollapsed ? "justify-center" : "justify-start gap-3"
      )}>
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
          <Terminal className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className={cn(
          "font-semibold text-sidebar-foreground whitespace-nowrap transition-all duration-300",
          isCollapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
        )}>
          {t('app.name')}
        </span>
      </div>

      {/* Toggle Button */}
      <div className="absolute -right-3 top-20 z-30">
        <Button
          variant="secondary"
          size="icon"
          onClick={toggleSidebar}
          className="w-6 h-6 rounded-full shadow-md border border-border bg-card hover:bg-accent transition-all duration-200 hover:scale-110"
        >
          {isCollapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 mt-2">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeTabId === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                isCollapsed ? "justify-center" : "justify-start",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
              style={{
                animationDelay: `${index * 50}ms`
              }}
            >
              {/* Active indicator glow */}
              {isActive && (
                <div className="absolute inset-0 bg-primary/5 animate-pulse rounded-xl" />
              )}
              
              <Icon className={cn(
                "w-5 h-5 transition-all duration-200 flex-shrink-0 relative z-10",
                isActive && "scale-110",
                !isCollapsed && "group-hover:translate-x-0.5"
              )} />
              
              <span className={cn(
                "font-medium text-sm whitespace-nowrap transition-all duration-300 relative z-10",
                isCollapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
              )}>
                {t(item.labelKey)}
              </span>
              
              {/* Active dot */}
              {isActive && !isCollapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse relative z-10" />
              )}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
                  {t(item.labelKey)}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className={cn(
        "p-4 border-t border-sidebar-border transition-all duration-300",
        isCollapsed ? "flex justify-center" : ""
      )}>
        <div className={cn(
          "flex items-center gap-2 text-xs text-sidebar-foreground/50 transition-all duration-300",
          isCollapsed ? "flex-col" : ""
        )}>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          {!isCollapsed && <span>Ready</span>}
        </div>
      </div>
    </aside>
  );
}
