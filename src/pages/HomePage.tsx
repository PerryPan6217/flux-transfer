import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Terminal, 
  Folder, 
  Plus, 
  Clock, 
  ArrowRight,
  Server,
  Zap,
  Activity,
  Globe,
  Cpu
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function HomePage() {
  const { t } = useTranslation();
  const { hosts, addTab, setActiveTab } = useAppStore();

  // Get recently connected hosts (sorted by lastConnected)
  const recentHosts = [...hosts]
    .filter(h => h.lastConnected)
    .sort((a, b) => (b.lastConnected?.getTime() || 0) - (a.lastConnected?.getTime() || 0))
    .slice(0, 6);

  const handleConnectSSH = (hostId: string, hostName: string) => {
    const tabId = `ssh-${hostId}-${Date.now()}`;
    addTab({
      id: tabId,
      label: `${hostName} (SSH)`,
      type: 'ssh',
      closable: true,
      hostId,
      hostName
    });
    setActiveTab(tabId);
  };

  const handleConnectSFTP = (hostId: string, hostName: string) => {
    const tabId = `sftp-${hostId}-${Date.now()}`;
    addTab({
      id: tabId,
      label: `${hostName} (SFTP)`,
      type: 'sftp',
      closable: true,
      hostId,
      hostName
    });
    setActiveTab(tabId);
  };

  const goToHub = () => {
    setActiveTab('hub');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fadeIn">
      {/* Welcome Section */}
      <div className="mb-8 animate-fadeInUp">
        <h1 className="text-3xl font-bold mb-2">{t('home.welcome')} ✨</h1>
        <p className="text-muted-foreground">{t('home.welcomeSubtitle')}</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card 
          className="cursor-pointer border border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group animate-fadeInUp"
          style={{ animationDelay: '50ms' }}
          onClick={goToHub}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="font-medium">{t('hub.newHost')}</div>
              <div className="text-sm text-muted-foreground">{t('home.quickConnect')}</div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer border border-border/50 bg-card/80 backdrop-blur-sm hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 group animate-fadeInUp"
          style={{ animationDelay: '100ms' }}
          onClick={goToHub}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 group-hover:scale-110 transition-all duration-300">
              <Terminal className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <div className="font-medium">SSH Terminal</div>
              <div className="text-sm text-muted-foreground">Quick SSH access</div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer border border-border/50 bg-card/80 backdrop-blur-sm hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 group animate-fadeInUp"
          style={{ animationDelay: '150ms' }}
          onClick={goToHub}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 group-hover:scale-110 transition-all duration-300">
              <Folder className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <div className="font-medium">SFTP Browser</div>
              <div className="text-sm text-muted-foreground">File transfer</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Connections */}
      <div className="animate-fadeInUp" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {t('home.recentConnections')}
          </h2>
          {recentHosts.length > 0 && (
            <Button variant="ghost" size="sm" onClick={goToHub}>
              {t('common.viewAll')}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>

        {recentHosts.length === 0 ? (
          <Card className="border-dashed border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <Server className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2">{t('home.noRecentConnections')}</h3>
              <p className="text-muted-foreground mb-4">{t('home.startByAdding')}</p>
              <Button onClick={goToHub}>
                <Plus className="w-4 h-4 mr-2" />
                {t('home.goToHub')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentHosts.map((host, index) => (
              <Card 
                key={host.id} 
                className="group border border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 animate-fadeInUp"
                style={{ animationDelay: `${250 + index * 50}ms` }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                        host.group === 'Production' ? 'bg-red-500/10 text-red-500' :
                        host.group === 'Development' ? 'bg-green-500/10 text-green-500' :
                        'bg-primary/10 text-primary'
                      )}>
                        <Server className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium">{host.name}</div>
                        <div className="text-sm text-muted-foreground font-mono">
                          {host.username}@{host.host}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleConnectSSH(host.id, host.name)}
                        className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                        title="Connect SSH"
                      >
                        <Terminal className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleConnectSFTP(host.id, host.name)}
                        className="p-2 rounded-lg hover:bg-green-500/10 text-green-500 transition-colors"
                        title="Connect SFTP"
                      >
                        <Folder className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {host.group || 'Default'}
                    </span>
                    <span>
                      {host.lastConnected && (
                        new Date(host.lastConnected).toLocaleDateString()
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 animate-fadeInUp" style={{ animationDelay: '400ms' }}>
        <Card className="border border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/30 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Server className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Saved Hosts</span>
            </div>
            <div className="text-2xl font-bold">{hosts.length}</div>
          </CardContent>
        </Card>
        <Card className="border border-border/50 bg-card/80 backdrop-blur-sm hover:border-green-500/30 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Active Sessions</span>
            </div>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
        <Card className="border border-border/50 bg-card/80 backdrop-blur-sm hover:border-blue-500/30 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Port Forwards</span>
            </div>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
        <Card className="border border-border/50 bg-card/80 backdrop-blur-sm hover:border-purple-500/30 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-muted-foreground">Version</span>
            </div>
            <div className="text-2xl font-bold">v1.0</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
