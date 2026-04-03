import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { 
  Folder, 
  FileText, 
  ArrowUp, 
  RefreshCw, 
  Plus,
  Upload,
  Download,
  Edit,
  Trash2,
  Eye,
  Info,
  Scissors,
  Copy,
  ClipboardPaste,
  Image,
  Music,
  Video,
  Archive,
  Code,
  MoreVertical,
  Search,
  Lock,
  Check,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FileItem } from '@/types';

interface SFTPBrowserProps {
  hostId?: string;
  hostName?: string;
}

// Mock file data
const mockFiles: FileItem[] = [
  { name: 'public', path: '/var/www/public', type: 'directory', size: 0, modifiedAt: new Date(), permissions: 'drwxr-xr-x', owner: 'www-data', group: 'www-data' },
  { name: 'src', path: '/var/www/src', type: 'directory', size: 0, modifiedAt: new Date(), permissions: 'drwxr-xr-x', owner: 'www-data', group: 'www-data' },
  { name: 'node_modules', path: '/var/www/node_modules', type: 'directory', size: 0, modifiedAt: new Date(), permissions: 'drwxr-xr-x', owner: 'www-data', group: 'www-data' },
  { name: 'package.json', path: '/var/www/package.json', type: 'file', size: 2456, modifiedAt: new Date(), permissions: '-rw-r--r--', owner: 'www-data', group: 'www-data' },
  { name: 'README.md', path: '/var/www/README.md', type: 'file', size: 1234, modifiedAt: new Date(), permissions: '-rw-r--r--', owner: 'www-data', group: 'www-data' },
  { name: 'index.js', path: '/var/www/index.js', type: 'file', size: 3456, modifiedAt: new Date(), permissions: '-rw-r--r--', owner: 'www-data', group: 'www-data' },
  { name: 'config.yml', path: '/var/www/config.yml', type: 'file', size: 890, modifiedAt: new Date(), permissions: '-rw-r--r--', owner: 'www-data', group: 'www-data' },
  { name: 'logo.png', path: '/var/www/logo.png', type: 'file', size: 12500, modifiedAt: new Date(), permissions: '-rw-r--r--', owner: 'www-data', group: 'www-data' },
  { name: '.env', path: '/var/www/.env', type: 'file', size: 234, modifiedAt: new Date(), permissions: '-rw-------', owner: 'www-data', group: 'www-data' },
  { name: '.gitignore', path: '/var/www/.gitignore', type: 'file', size: 123, modifiedAt: new Date(), permissions: '-rw-r--r--', owner: 'www-data', group: 'www-data' },
];

const getFileIcon = (file: FileItem) => {
  if (file.type === 'directory') return Folder;
  
  const ext = file.name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'svg':
      return Image;
    case 'mp3':
    case 'wav':
    case 'ogg':
      return Music;
    case 'mp4':
    case 'avi':
    case 'mkv':
      return Video;
    case 'zip':
    case 'tar':
    case 'gz':
    case 'rar':
      return Archive;
    case 'js':
    case 'ts':
    case 'jsx':
    case 'tsx':
    case 'py':
    case 'go':
    case 'rs':
    case 'java':
    case 'cpp':
    case 'c':
      return Code;
    default:
      return FileText;
  }
};

const formatSize = (bytes: number): string => {
  if (bytes === 0) return '-';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// Parse permission string to checkboxes
const parsePermissions = (perms: string) => {
  const isDir = perms.startsWith('d');
  const mode = perms.slice(1);
  return {
    isDirectory: isDir,
    owner: {
      read: mode[0] === 'r',
      write: mode[1] === 'w',
      execute: mode[2] === 'x' || mode[2] === 's',
    },
    group: {
      read: mode[3] === 'r',
      write: mode[4] === 'w',
      execute: mode[5] === 'x' || mode[5] === 's',
    },
    others: {
      read: mode[6] === 'r',
      write: mode[7] === 'w',
      execute: mode[8] === 'x' || mode[8] === 't',
    },
  };
};

// Build permission string from checkboxes
const buildPermissions = (perms: ReturnType<typeof parsePermissions>): string => {
  let mode = perms.isDirectory ? 'd' : '-';
  mode += perms.owner.read ? 'r' : '-';
  mode += perms.owner.write ? 'w' : '-';
  mode += perms.owner.execute ? 'x' : '-';
  mode += perms.group.read ? 'r' : '-';
  mode += perms.group.write ? 'w' : '-';
  mode += perms.group.execute ? 'x' : '-';
  mode += perms.others.read ? 'r' : '-';
  mode += perms.others.write ? 'w' : '-';
  mode += perms.others.execute ? 'x' : '-';
  return mode;
};

export function SFTPBrowser({ hostId, hostName }: SFTPBrowserProps) {
  const { t } = useTranslation();
  const { settings } = useAppStore();
  const [currentPath, setCurrentPath] = useState('/var/www');
  const [files, setFiles] = useState<FileItem[]>(mockFiles);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewFile, setViewFile] = useState<FileItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [filesToDelete, setFilesToDelete] = useState<FileItem[]>([]);
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  const [fileToEditPermissions, setFileToEditPermissions] = useState<FileItem | null>(null);
  const [permissions, setPermissions] = useState(parsePermissions('drwxr-xr-x'));
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const filteredFiles = files.filter(f => {
    if (!settings.showHiddenFiles && f.name.startsWith('.')) return false;
    if (searchQuery) {
      return f.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      console.log('Files to upload:', droppedFiles);
      alert(`${droppedFiles.length} file(s) ready to upload via backend`);
    }
  }, []);

  const handleFileClick = (file: FileItem, e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      const newSelected = new Set(selectedFiles);
      if (newSelected.has(file.name)) {
        newSelected.delete(file.name);
      } else {
        newSelected.add(file.name);
      }
      setSelectedFiles(newSelected);
    } else if (e.shiftKey) {
      const fileNames = filteredFiles.map(f => f.name);
      const lastIndex = fileNames.findIndex(name => selectedFiles.has(name));
      const currentIndex = fileNames.indexOf(file.name);
      
      if (lastIndex !== -1) {
        const start = Math.min(lastIndex, currentIndex);
        const end = Math.max(lastIndex, currentIndex);
        const newSelected = new Set(selectedFiles);
        for (let i = start; i <= end; i++) {
          newSelected.add(fileNames[i]);
        }
        setSelectedFiles(newSelected);
      }
    } else {
      setSelectedFiles(new Set([file.name]));
    }
  };

  const handleDoubleClick = (file: FileItem) => {
    if (file.type === 'directory') {
      setCurrentPath(file.path);
    } else {
      setViewFile(file);
    }
  };

  const handleContextMenuAction = (action: string, file: FileItem) => {
    switch (action) {
      case 'preview':
        setViewFile(file);
        break;
      case 'edit':
        break;
      case 'download':
        break;
      case 'delete':
        setFilesToDelete([file]);
        setIsDeleteDialogOpen(true);
        break;
      case 'rename':
        break;
      case 'properties':
        break;
      case 'permissions':
        setFileToEditPermissions(file);
        setPermissions(parsePermissions(file.permissions));
        setIsPermissionsDialogOpen(true);
        break;
    }
  };

  const confirmDelete = () => {
    setFiles(files.filter(f => !filesToDelete.some(d => d.name === f.name)));
    setIsDeleteDialogOpen(false);
    setFilesToDelete([]);
    setSelectedFiles(new Set());
  };

  const savePermissions = () => {
    if (fileToEditPermissions) {
      const newPerms = buildPermissions(permissions);
      setFiles(files.map(f => 
        f.name === fileToEditPermissions.name 
          ? { ...f, permissions: newPerms }
          : f
      ));
      setIsPermissionsDialogOpen(false);
      setFileToEditPermissions(null);
    }
  };

  const togglePermission = (category: 'owner' | 'group' | 'others', perm: 'read' | 'write' | 'execute') => {
    setPermissions(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [perm]: !prev[category][perm]
      }
    }));
  };

  const pathParts = currentPath.split('/').filter(Boolean);

  const PermissionRow = ({ 
    label, 
    perms, 
    category 
  }: { 
    label: string; 
    perms: { read: boolean; write: boolean; execute: boolean }; 
    category: 'owner' | 'group' | 'others';
  }) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-medium w-20">{label}</span>
      <div className="flex gap-2">
        <button
          onClick={() => togglePermission(category, 'read')}
          className={cn(
            "px-3 py-1.5 rounded-md text-xs font-mono transition-all",
            perms.read 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          Read
        </button>
        <button
          onClick={() => togglePermission(category, 'write')}
          className={cn(
            "px-3 py-1.5 rounded-md text-xs font-mono transition-all",
            perms.write 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          Write
        </button>
        <button
          onClick={() => togglePermission(category, 'execute')}
          className={cn(
            "px-3 py-1.5 rounded-md text-xs font-mono transition-all",
            perms.execute 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          Execute
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setCurrentPath('/')}>
            <ArrowUp className="w-4 h-4" />
          </Button>
          
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => setCurrentPath('/')}>
                  /
                </BreadcrumbLink>
              </BreadcrumbItem>
              {pathParts.map((part, i) => (
                <span key={i} className="flex items-center">
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink onClick={() => setCurrentPath('/' + pathParts.slice(0, i + 1).join('/'))}>
                      {part}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </span>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-48 h-8"
            />
          </div>
          
          <Button variant="ghost" size="icon">
            <RefreshCw className="w-4 h-4" />
          </Button>
          
          <Button variant="ghost" size="icon">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* File List */}
      <div 
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "flex-1 overflow-hidden relative",
          isDragging && "bg-primary/10 border-2 border-dashed border-primary"
        )}
      >
        {/* Drag Overlay */}
        {isDragging && (
          <div className="absolute inset-0 bg-primary/10 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
            <div className="text-center">
              <Upload className="w-16 h-16 mx-auto mb-4 text-primary animate-bounce" />
              <p className="text-lg font-medium text-primary">{t('sftp.dragOverlay')}</p>
            </div>
          </div>
        )}

        <ScrollArea className="h-full">
          <div className="p-2">
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 px-4 py-2 text-sm font-medium text-muted-foreground border-b border-border">
              <div className="col-span-5">{t('sftp.table.name')}</div>
              <div className="col-span-2">{t('sftp.table.size')}</div>
              <div className="col-span-2">{t('sftp.table.modified')}</div>
              <div className="col-span-2">{t('sftp.table.permissions')}</div>
              <div className="col-span-1"></div>
            </div>

            {/* Files */}
            {filteredFiles.map((file) => {
              const Icon = getFileIcon(file);
              const isSelected = selectedFiles.has(file.name);

              return (
                <ContextMenu key={file.name}>
                  <ContextMenuTrigger>
                    <div
                      onClick={(e) => handleFileClick(file, e)}
                      onDoubleClick={() => handleDoubleClick(file)}
                      className={cn(
                        "grid grid-cols-12 gap-2 px-4 py-2 text-sm items-center cursor-pointer transition-all hover:bg-accent/50 rounded-lg",
                        isSelected && "bg-primary/10"
                      )}
                    >
                      <div className="col-span-5 flex items-center gap-2">
                        <Icon className={cn(
                          "w-5 h-5",
                          file.type === 'directory' ? 'text-yellow-500' : 'text-blue-500'
                        )} />
                        <span className={cn(
                          file.name.startsWith('.') && "text-muted-foreground"
                        )}>
                          {file.name}
                        </span>
                      </div>
                      <div className="col-span-2 text-muted-foreground">
                        {formatSize(file.size)}
                      </div>
                      <div className="col-span-2 text-muted-foreground">
                        {file.modifiedAt.toLocaleDateString()}
                      </div>
                      <div className="col-span-2 font-mono text-xs text-muted-foreground">
                        {file.permissions}
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <MoreVertical className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </ContextMenuTrigger>
                  
                  <ContextMenuContent className="w-52 backdrop-blur-md bg-popover/95">
                    {file.type === 'file' && (
                      <>
                        <ContextMenuItem onClick={() => handleContextMenuAction('preview', file)}>
                          <Eye className="w-4 h-4 mr-2" />
                          {t('contextMenu.preview')}
                        </ContextMenuItem>
                        <ContextMenuItem onClick={() => handleContextMenuAction('edit', file)}>
                          <Edit className="w-4 h-4 mr-2" />
                          {t('contextMenu.edit')}
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                      </>
                    )}
                    
                    <ContextMenuItem onClick={() => handleContextMenuAction('download', file)}>
                      <Download className="w-4 h-4 mr-2" />
                      {t('contextMenu.download')}
                    </ContextMenuItem>
                    
                    <ContextMenuSub>
                      <ContextMenuSubTrigger>
                        <Upload className="w-4 h-4 mr-2" />
                        {t('contextMenu.upload')}
                      </ContextMenuSubTrigger>
                      <ContextMenuSubContent className="backdrop-blur-md bg-popover/95">
                        <ContextMenuItem>Upload File</ContextMenuItem>
                        <ContextMenuItem>Upload Folder</ContextMenuItem>
                      </ContextMenuSubContent>
                    </ContextMenuSub>
                    
                    <ContextMenuSeparator />
                    
                    <ContextMenuItem>
                      <Scissors className="w-4 h-4 mr-2" />
                      Cut
                    </ContextMenuItem>
                    <ContextMenuItem>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </ContextMenuItem>
                    <ContextMenuItem>
                      <ClipboardPaste className="w-4 h-4 mr-2" />
                      Paste
                    </ContextMenuItem>
                    
                    <ContextMenuSeparator />
                    
                    <ContextMenuItem>
                      <Edit className="w-4 h-4 mr-2" />
                      {t('contextMenu.rename')}
                    </ContextMenuItem>
                    
                    {/* Permissions option for directories */}
                    {file.type === 'directory' && (
                      <ContextMenuItem onClick={() => handleContextMenuAction('permissions', file)}>
                        <Lock className="w-4 h-4 mr-2" />
                        Permissions
                      </ContextMenuItem>
                    )}
                    
                    <ContextMenuItem onClick={() => handleContextMenuAction('properties', file)}>
                      <Info className="w-4 h-4 mr-2" />
                      {t('contextMenu.properties')}
                    </ContextMenuItem>
                    
                    <ContextMenuSeparator />
                    
                    {file.type === 'directory' && (
                      <>
                        <ContextMenuItem>
                          <Folder className="w-4 h-4 mr-2" />
                          {t('contextMenu.newFolder')}
                        </ContextMenuItem>
                        <ContextMenuItem>
                          <FileText className="w-4 h-4 mr-2" />
                          {t('contextMenu.newFile')}
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                      </>
                    )}
                    
                    <ContextMenuItem 
                      onClick={() => handleContextMenuAction('delete', file)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t('contextMenu.delete')}
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-card/80 backdrop-blur-md border-t border-border text-sm">
        <div className="flex items-center gap-4">
          <span>{filteredFiles.length} items</span>
          {selectedFiles.size > 0 && (
            <Badge variant="secondary">
              {selectedFiles.size} selected
            </Badge>
          )}
        </div>
        <div className="text-muted-foreground">
          {hostName || 'Remote'} ({hostId || 'N/A'})
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!viewFile} onOpenChange={() => setViewFile(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] backdrop-blur-md bg-card/95">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {viewFile && getFileIcon(viewFile)({ className: 'w-5 h-5' })}
              {viewFile?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-auto max-h-[50vh]">
            <pre>// File preview would be loaded here
// Path: {viewFile?.path}
// Size: {formatSize(viewFile?.size || 0)}
// 
// This is a placeholder for the actual file content
// that would be fetched from the backend.</pre>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewFile(null)}>
              Close
            </Button>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="backdrop-blur-md bg-card/95">
          <DialogHeader>
            <DialogTitle>{t('sftp.confirmDelete')}</DialogTitle>
            <DialogDescription>{t('sftp.deleteWarning')}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {filesToDelete.map(f => (
              <div key={f.name} className="flex items-center gap-2 py-1">
                {getFileIcon(f)({ className: 'w-4 h-4' })}
                <span>{f.name}</span>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              {t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
        <DialogContent className="max-w-md backdrop-blur-md bg-card/95">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Edit Permissions
            </DialogTitle>
            <DialogDescription>
              {fileToEditPermissions?.type === 'directory' ? 'Directory' : 'File'}: {fileToEditPermissions?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            {/* Current permissions display */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">Current:</span>
              <code className="font-mono text-sm">{buildPermissions(permissions)}</code>
            </div>

            {/* Permission toggles */}
            <div className="space-y-2">
              <PermissionRow 
                label="Owner" 
                perms={permissions.owner} 
                category="owner" 
              />
              <PermissionRow 
                label="Group" 
                perms={permissions.group} 
                category="group" 
              />
              <PermissionRow 
                label="Others" 
                perms={permissions.others} 
                category="others" 
              />
            </div>

            {/* Numeric representation */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">Numeric:</span>
              <code className="font-mono text-lg font-bold">
                {(permissions.owner.read ? 4 : 0) + (permissions.owner.write ? 2 : 0) + (permissions.owner.execute ? 1 : 0)}
                {(permissions.group.read ? 4 : 0) + (permissions.group.write ? 2 : 0) + (permissions.group.execute ? 1 : 0)}
                {(permissions.others.read ? 4 : 0) + (permissions.others.write ? 2 : 0) + (permissions.others.execute ? 1 : 0)}
              </code>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPermissionsDialogOpen(false)}>
              <X className="w-4 h-4 mr-2" />
              {t('common.cancel')}
            </Button>
            <Button onClick={savePermissions}>
              <Check className="w-4 h-4 mr-2" />
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
