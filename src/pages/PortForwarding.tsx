import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  Route, 
  Edit, 
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PortForwardingRule } from '@/types';

const emptyRule: Omit<PortForwardingRule, 'id'> = {
  name: '',
  hostId: '',
  type: 'local',
  localPort: 8080,
  localHost: 'localhost',
  remotePort: 80,
  remoteHost: 'localhost',
  enabled: false
};

export function PortForwarding() {
  const { t } = useTranslation();
  const { hosts, portRules, addPortRule, updatePortRule, deletePortRule, togglePortRule } = useAppStore();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PortForwardingRule | null>(null);
  const [ruleToDelete, setRuleToDelete] = useState<PortForwardingRule | null>(null);
  const [formData, setFormData] = useState(emptyRule);

  const handleAddRule = () => {
    setEditingRule(null);
    setFormData(emptyRule);
    setIsDialogOpen(true);
  };

  const handleEditRule = (rule: PortForwardingRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      hostId: rule.hostId,
      type: rule.type,
      localPort: rule.localPort,
      localHost: rule.localHost || 'localhost',
      remotePort: rule.remotePort,
      remoteHost: rule.remoteHost || 'localhost',
      enabled: rule.enabled
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (rule: PortForwardingRule) => {
    setRuleToDelete(rule);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (ruleToDelete) {
      deletePortRule(ruleToDelete.id);
      setIsDeleteDialogOpen(false);
      setRuleToDelete(null);
    }
  };

  const handleSaveRule = () => {
    if (editingRule) {
      updatePortRule(editingRule.id, formData);
    } else {
      addPortRule(formData);
    }
    setIsDialogOpen(false);
  };

  const getHostName = (hostId: string) => {
    return hosts.find(h => h.id === hostId)?.name || hostId;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'local': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'remote': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'dynamic': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fadeInUp">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Route className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t('portForwarding.title')}</h1>
            <p className="text-sm text-muted-foreground">
              Manage SSH port forwarding rules
            </p>
          </div>
        </div>
        <Button onClick={handleAddRule} className="hover:shadow-lg hover:shadow-primary/20 transition-shadow">
          <Plus className="w-4 h-4 mr-2" />
          {t('portForwarding.newRule')}
        </Button>
      </div>

      {/* Rules Table */}
      {portRules.length === 0 ? (
        <Card className="border-dashed border-border/50 bg-card/50 backdrop-blur-sm animate-fadeInUp" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-12 text-center">
            <Route className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium mb-2">{t('portForwarding.noRules')}</h3>
            <p className="text-muted-foreground mb-4">{t('portForwarding.addFirstRule')}</p>
            <Button onClick={handleAddRule}>
              <Plus className="w-4 h-4 mr-2" />
              {t('portForwarding.newRule')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-border/50 bg-card/80 backdrop-blur-sm animate-fadeInUp" style={{ animationDelay: '100ms' }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('portForwarding.table.name')}</TableHead>
                <TableHead>{t('portForwarding.table.type')}</TableHead>
                <TableHead>{t('portForwarding.table.local')}</TableHead>
                <TableHead>{t('portForwarding.table.remote')}</TableHead>
                <TableHead>{t('portForwarding.table.status')}</TableHead>
                <TableHead className="text-right">{t('portForwarding.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {portRules.map((rule, index) => (
                <TableRow 
                  key={rule.id} 
                  className={cn(
                    "group transition-all duration-200",
                    rule.enabled && "bg-green-500/5"
                  )}
                  style={{ animationDelay: `${150 + index * 50}ms` }}
                >
                  <TableCell>
                    <div className="font-medium">{rule.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {getHostName(rule.hostId)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("border", getTypeColor(rule.type))}>
                      {t(`portForwarding.types.${rule.type}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm bg-muted px-2 py-0.5 rounded">
                      {rule.localHost}:{rule.localPort}
                    </code>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm bg-muted px-2 py-0.5 rounded">
                      {rule.remoteHost}:{rule.remotePort}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={() => togglePortRule(rule.id)}
                      />
                      <span className={cn(
                        "text-sm font-medium",
                        rule.enabled ? "text-green-500" : "text-muted-foreground"
                      )}>
                        {rule.enabled ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditRule(rule)}
                        className="hover:bg-primary/10"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(rule)}
                        className="hover:bg-destructive/10 text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Add/Edit Rule Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg backdrop-blur-md bg-card/95">
          <DialogHeader>
            <DialogTitle>
              {editingRule ? t('portForwarding.editRule') : t('portForwarding.newRule')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('portForwarding.form.name')}</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Web Server Forward"
              />
            </div>

            <div className="space-y-2">
              <Label>Host</Label>
              <Select
                value={formData.hostId}
                onValueChange={(v) => setFormData({ ...formData, hostId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a host" />
                </SelectTrigger>
                <SelectContent>
                  {hosts.map((host) => (
                    <SelectItem key={host.id} value={host.id}>
                      {host.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('portForwarding.form.type')}</Label>
              <Select
                value={formData.type}
                onValueChange={(v: 'local' | 'remote' | 'dynamic') => setFormData({ ...formData, type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">{t('portForwarding.types.local')}</SelectItem>
                  <SelectItem value="remote">{t('portForwarding.types.remote')}</SelectItem>
                  <SelectItem value="dynamic">{t('portForwarding.types.dynamic')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('portForwarding.form.localPort')}</Label>
                <Input
                  type="number"
                  value={formData.localPort}
                  onChange={(e) => setFormData({ ...formData, localPort: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('portForwarding.form.localHost')}</Label>
                <Input
                  value={formData.localHost}
                  onChange={(e) => setFormData({ ...formData, localHost: e.target.value })}
                  placeholder="localhost"
                />
              </div>
            </div>

            {formData.type !== 'dynamic' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('portForwarding.form.remotePort')}</Label>
                  <Input
                    type="number"
                    value={formData.remotePort}
                    onChange={(e) => setFormData({ ...formData, remotePort: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('portForwarding.form.remoteHost')}</Label>
                  <Input
                    value={formData.remoteHost}
                    onChange={(e) => setFormData({ ...formData, remoteHost: e.target.value })}
                    placeholder="localhost"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Switch
                checked={formData.enabled}
                onCheckedChange={(v) => setFormData({ ...formData, enabled: v })}
              />
              <Label className="mb-0">{t('portForwarding.form.enabled')}</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={handleSaveRule}
              disabled={!formData.name || !formData.hostId}
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
            <DialogTitle>{t('portForwarding.deleteRule')}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this rule? This action cannot be undone.
            </DialogDescription>
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
    </div>
  );
}
