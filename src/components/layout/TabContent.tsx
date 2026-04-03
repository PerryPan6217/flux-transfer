import { useAppStore } from '@/store';
import { HomePage } from '@/pages/HomePage';
import { ConnectionHub } from '@/pages/ConnectionHub';
import { PortForwarding } from '@/pages/PortForwarding';
import { AIAssistance } from '@/pages/AIAssistance';
import { SettingsPage } from '@/pages/SettingsPage';
import { TerminalPanel } from '@/components/terminal/TerminalPanel';
import { SFTPBrowser } from '@/components/sftp/SFTPBrowser';
import { cn } from '@/lib/utils';

export function TabContent() {
  const { tabs, activeTabId } = useAppStore();

  const renderContent = (tab: typeof tabs[0]) => {
    switch (tab.type) {
      case 'home':
        return <HomePage />;
      case 'hub':
        return <ConnectionHub />;
      case 'port':
        return <PortForwarding />;
      case 'ai':
        return <AIAssistance />;
      case 'settings':
        return <SettingsPage />;
      case 'ssh':
        return <TerminalPanel hostId={tab.hostId} hostName={tab.hostName} />;
      case 'sftp':
        return <SFTPBrowser hostId={tab.hostId} hostName={tab.hostName} />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="relative w-full h-full">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={cn(
            "absolute inset-0 overflow-auto",
            tab.id === activeTabId ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          )}
        >
          {renderContent(tab)}
        </div>
      ))}
    </div>
  );
}
