import { useEffect } from 'react';
import { useAppStore, applyTheme } from '@/store';
import { Sidebar } from './Sidebar';
import { TabBar } from './TabBar';
import { TabContent } from './TabContent';
import { cn } from '@/lib/utils';

export function MainLayout() {
  const { settings } = useAppStore();

  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

  useEffect(() => {
    // Apply font size
    const root = document.documentElement;
    root.classList.remove('text-ui-sm', 'text-ui-md', 'text-ui-lg');
    root.classList.add(`text-ui-${settings.uiFontSize}`);
  }, [settings.uiFontSize]);

  return (
    <div className={cn(
      "h-screen w-screen overflow-hidden flex bg-background text-foreground",
      `text-ui-${settings.uiFontSize}`
    )}>
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 bg-background/50">
        <TabBar />
        <div className="flex-1 overflow-hidden relative">
          <TabContent />
        </div>
      </main>
    </div>
  );
}
