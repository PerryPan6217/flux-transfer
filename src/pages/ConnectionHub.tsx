import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Terminal, 
  Folder, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Server,
  Key,
  Lock,
  Upload,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Host } from '@/types';

const emptyHost: Omit<Host, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '',
  host: '',
  port: 22,
  username: '',
  authType: 'password',
  password: '',
  privateKey: '',
  passphrase: '',
  group: '',
  tags: []
};

// Parse WinSCP INI format
const parseWinSCPIni = (content: string): Partial<Host>[] => {
  const hosts: Partial<Host>[] = [];
  const sessions = content.split(/\[Sessions\\/).slice(1);
  
  for (const session of sessions) {
    const lines = session.split('\n');
    const sessionName = lines[0].replace(']', '');
    const host: Partial<Host> = {
      name: sessionName,
      port: 22,
      authType: 'password'
    };
    
    for (const line of lines) {
      if (line.startsWith('HostName=')) {
        host.host = line.split('=')[1];
      } else if (line.startsWith('PortNumber=')) {
        host.port = parseInt(line.split('=')[1]) || 22;
      } else if (line.startsWith('UserName=')) {
        host.username = line.split('=')[1];
      } else if (line.startsWith('PublicKeyFile=')) {
        host.authType = 'key';
      }
    }
    
    if (host.host && host.username) {
      hosts.push(host);
    }
  }
  
  return hosts;
};

export function ConnectionHub() {
  const { t } = useTranslation();
  const { hosts, addHost, updateHost, deleteHost, addTab, setActiveTab } = useAppStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [editingHost, setEditingHost] = useState<Host | null>(null);
  const [hostToDelete, setHostToDelete] = useState<Host | null>(null);
  const [formData, setFormData] = useState(emptyHost);
  const [importContent, setImportContent] = useState('');
  const [importedHosts, setImportedHosts] = useState<Partial<Host>[]>([]);
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredHosts = hosts.filter(host => 
    host.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    host.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
    host.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    host.group?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddHost = () => {
    setEditingHost(null);
    setFormData(emptyHost);
    setIsDialogOpen(true);
  };

  const handleEditHost = (host: Host) => {
    setEditingHost(host);
    setFormData({
      name: host.name,
      host: host.host,
      port: host.port,
      username: host.username,
      authType: host.authType,
      password: host.password || '',
      privateKey: host.privateKey || '',
      passphrase: host.passphrase || '',
      group: host.group || '',
      tags: host.tags || []
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (host: Host) => {
    setHostToDelete(host);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (hostToDelete) {
      deleteHost(hostToDelete.id);
      setIsDeleteDialogOpen(false);
      setHostToDelete(null);
    }
  };

  const handleSaveHost = () => {
    if (editingHost) {
      updateHost(editingHost.id, formData);
    } else {
      addHost(formData);
    }
    setIsDialogOpen(false);
  };

  const handleConnectSSH = (host: Host) => {
    const tabId = `ssh-${host.id}-${Date.now()}`;
    addTab({
      id: tabId,
      label: `${host.name} (SSH)`,
      type: 'ssh',
      closable: true,
      hostId: host.id,
      hostName: host.name
    });
    setActiveTab(tabId);
    updateHost(host.id, { lastConnected: new Date() });
  };

  const handleConnectSFTP = (host: Host) => {
    const tabId = `sftp-${host.id}-${Date.now()}`;
    addTab({
      id: tabId,
      label: `${host.name} (SFTP)`,
      type: 'sftp',
      closable: true,
      hostId: host.id,
      hostName: host.name
    });
    setActiveTab(tabId);
    updateHost(host.id, { lastConnected: new Date() });
  };

  // WinSCP Import handlers
  const handleImportClick = () => {
    setImportContent('');
    setImportedHosts([]);
    setImportError('');
    setIsImportDialogOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportContent(content);
      processImportContent(content);
    };
    reader.readAsText(file);
  };

  const processImportContent = (content: string) => {
    try {
      setImportError('');
      const parsed = parseWinSCPIni(content);
      if (parsed.length === 0) {
        setImportError('No valid sessions found in the file');
      }
      setImportedHosts(parsed);
    } catch (err) {
      setImportError('Failed to parse file. Please ensure it is a valid WinSCP INI file.');
      setImportedHosts([]);
    }
  };

  const handleImportHosts = () => {
    for (const host of importedHosts) {
      if (host.name && host.host && host.username) {
        addHost({
          ...emptyHost,
          name: host.name,
          host: host.host,
          port: host.port || 22,
          username: host.username,
          authType: host.authType || 'password',
          group: 'Imported'
        });
      }
    }
    setIsImportDialogOpen(false);
  };

  const groups = [...new Set(hosts.map(h => h.group).filter(Boolean))];

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">{t('hub.title')}</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('hub.searchHosts')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Button variant="outline" onClick={handleImportClick}>
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button onClick={handleAddHost}>
            <Plus className="w-4 h-4 mr-2" />
            {t('hub.newHost')}
          </Button>
        </div>
      </div>

      {/* Hosts Table */}
      {filteredHosts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <Server className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium mb-2">{t('hub.noHosts')}</h3>
            <p className="text-muted-foreground mb-4">{t('hub.addFirstHost')}</p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={handleImportClick}>
                <Upload className="w-4 h-4 mr-2" />
                Import from WinSCP
              </Button>
              <Button onClick={handleAddHost}>
                <Plus className="w-4 h-4 mr-2" />
                {t('hub.newHost')}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="backdrop-blur-sm bg-card/80">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('hub.table.name')}</TableHead>
                <TableHead>{t('hub.table.address')}</TableHead>
                <TableHead>{t('hub.table.user')}</TableHead>
                <TableHead>{t('hub.table.group')}</TableHead>
                <TableHead className="text-right">{t('hub.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHosts.map((host) => (
                <TableRow key={host.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110",
                        host.group === 'Production' ? 'bg-red-500/10 text-red-500' :
                        host.group === 'Development' ? 'bg-green-500/10 text-green-500' :
                        host.group === 'Imported' ? 'bg-purple-500/10 text-purple-500' :
                        'bg-primary/10 text-primary'
                      )}>
                        <Server className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-medium">{host.name}</div>
                        {host.tags && host.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {host.tags.map((tag, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm text-muted-foreground">
                      {host.host}:{host.port}
                    </code>
                  </TableCell>
                  <TableCell>{host.username}</TableCell>
                  <TableCell>
                    {host.group && (
                      <Badge variant="outline">{host.group}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleConnectSSH(host)}
                        title={t('hub.connectSSH')}
                        className="hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <Terminal className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleConnectSFTP(host)}
                        title={t('hub.connectSFTP')}
                        className="hover:bg-green-500/10 hover:text-green-500 transition-colors"
                      >
                        <Folder className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="backdrop-blur-md bg-popover/95">
                          <DropdownMenuItem onClick={() => handleEditHost(host)}>
                            <Edit className="w-4 h-4 mr-2" />
                            {t('hub.editHost')}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(host)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {t('hub.deleteHost')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Add/Edit Host Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto backdrop-blur-md bg-card/95">
          <DialogHeader>
            <DialogTitle>
              {editingHost ? t('hub.editHost') : t('hub.newHost')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('hub.form.name')}</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="My Server"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('hub.form.group')}</Label>
                <Input
                  value={formData.group}
                  onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                  placeholder="Production"
                  list="groups"
                />
                <datalist id="groups">
                  {groups.map(g => <option key={g} value={g} />)}
                </datalist>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>{t('hub.form.host')}</Label>
                <Input
                  value={formData.host}
                  onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                  placeholder="192.168.1.100"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('hub.form.port')}</Label>
                <Input
                  type="number"
                  value={formData.port}
                  onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) || 22 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('hub.form.username')}</Label>
              <Input
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="root"
              />
            </div>

            <div className="space-y-2">
              <Label>{t('hub.form.authType')}</Label>
              <Select
                value={formData.authType}
                onValueChange={(v: 'password' | 'key') => setFormData({ ...formData, authType: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="password">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      {t('hub.form.authPassword')}
                    </div>
                  </SelectItem>
                  <SelectItem value="key">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      {t('hub.form.authKey')}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.authType === 'password' ? (
              <div className="space-y-2">
                <Label>{t('hub.form.password')}</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>{t('hub.form.privateKey')}</Label>
                  <textarea
                    value={formData.privateKey}
                    onChange={(e) => setFormData({ ...formData, privateKey: e.target.value })}
                    placeholder="-----BEGIN OPENSSH PRIVATE KEY-----"
                    className="w-full h-24 px-3 py-2 rounded-md border border-input bg-transparent text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('hub.form.passphrase')}</Label>
                  <Input
                    type="password"
                    value={formData.passphrase}
                    onChange={(e) => setFormData({ ...formData, passphrase: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>{t('hub.form.tags')}</Label>
              <Input
                value={formData.tags?.join(', ')}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                placeholder="server, production, ubuntu"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={handleSaveHost}
              disabled={!formData.name || !formData.host || !formData.username}
            >
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="backdrop-blur-md bg-card/95">
          <DialogHeader>
            <DialogTitle>{t('hub.confirmDelete')}</DialogTitle>
            <DialogDescription>{t('hub.deleteWarning')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              {t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import WinSCP Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto backdrop-blur-md bg-card/95">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Import from WinSCP
            </DialogTitle>
            <DialogDescription>
              Import sessions from WinSCP configuration file (WinSCP.ini)
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* File upload */}
            <div className="space-y-2">
              <Label>WinSCP Configuration File</Label>
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept=".ini,.txt"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Select your WinSCP.ini file or paste the content below
              </p>
            </div>

            {/* Paste content */}
            <div className="space-y-2">
              <Label>Or paste configuration content</Label>
              <textarea
                value={importContent}
                onChange={(e) => {
                  setImportContent(e.target.value);
                  processImportContent(e.target.value);
                }}
                placeholder="[Sessions\\MyServer]&#10;HostName=192.168.1.100&#10;PortNumber=22&#10;UserName=root"
                className="w-full h-32 px-3 py-2 rounded-md border border-input bg-transparent text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Error message */}
            {importError && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{importError}</span>
              </div>
            )}

            {/* Preview imported hosts */}
            {importedHosts.length > 0 && (
              <div className="space-y-2">
                <Label>Found {importedHosts.length} session(s):</Label>
                <div className="max-h-48 overflow-y-auto border border-border rounded-lg">
                  {importedHosts.map((host, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-3 border-b border-border last:border-b-0 hover:bg-accent/50"
                    >
                      <div className="flex items-center gap-3">
                        <Server className="w-4 h-4 text-primary" />
                        <div>
                          <div className="font-medium text-sm">{host.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {host.username}@{host.host}:{host.port}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {host.authType === 'key' ? 'Key' : 'Password'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              <X className="w-4 h-4 mr-2" />
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={handleImportHosts}
              disabled={importedHosts.length === 0}
            >
              <Check className="w-4 h-4 mr-2" />
              Import {importedHosts.length > 0 && `(${importedHosts.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
