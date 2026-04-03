import { useTranslation } from 'react-i18next';
import { useAppStore, useTheme, useLanguage, applyTheme } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Palette, 
  Globe, 
  FolderOpen, 
  Terminal,
  RotateCcw,
  Moon,
  Sun,
  Monitor,
  Check,
  Aperture
} from 'lucide-react';
import { cn } from '@/lib/utils';
import i18n from '@/i18n';

export function SettingsPage() {
  const { t } = useTranslation();
  const { settings, updateSettings, resetSettings } = useAppStore();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    updateSettings({ theme: newTheme });
  };

  const handleLanguageChange = (newLanguage: 'en' | 'zh-CN' | 'zh-TW' | 'system') => {
    setLanguage(newLanguage);
    updateSettings({ language: newLanguage });
    
    if (newLanguage === 'system') {
      const systemLang = navigator.language;
      if (systemLang.startsWith('zh')) {
        i18n.changeLanguage(systemLang === 'zh-TW' ? 'zh-TW' : 'zh-CN');
      } else {
        i18n.changeLanguage('en');
      }
    } else {
      i18n.changeLanguage(newLanguage);
    }
  };

  const handleReset = () => {
    resetSettings();
    applyTheme('system');
    i18n.changeLanguage('en');
  };

  // Calculate UI font size in pixels for display
  const getUIFontSizePx = (size: string) => {
    switch (size) {
      case 'small': return 13;
      case 'medium': return 14;
      case 'large': return 16;
      default: return 14;
    }
  };

  // Convert slider value (0-2) to size string
  const sliderToSize = (value: number): 'small' | 'medium' | 'large' => {
    const sizes: ('small' | 'medium' | 'large')[] = ['small', 'medium', 'large'];
    return sizes[value] || 'medium';
  };

  // Convert size string to slider value
  const sizeToSlider = (size: string): number => {
    const sizes = ['small', 'medium', 'large'];
    return sizes.indexOf(size) !== -1 ? sizes.indexOf(size) : 1;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="w-4 h-4 mr-2" />
          {t('settings.advanced.resetSettings')}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Appearance */}
        <Card className="backdrop-blur-sm bg-card/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Palette className="w-5 h-5 text-primary" />
              {t('settings.appearance.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Theme */}
            <div className="space-y-3">
              <Label>{t('settings.appearance.theme')}</Label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleThemeChange('light')}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:scale-[1.02]",
                    theme === 'light' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <Sun className="w-6 h-6" />
                  <span className="text-sm font-medium">{t('settings.appearance.themeLight')}</span>
                  {theme === 'light' && <Check className="w-4 h-4 text-primary" />}
                </button>
                
                <button
                  onClick={() => handleThemeChange('dark')}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:scale-[1.02]",
                    theme === 'dark' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <Moon className="w-6 h-6" />
                  <span className="text-sm font-medium">{t('settings.appearance.themeDark')}</span>
                  {theme === 'dark' && <Check className="w-4 h-4 text-primary" />}
                </button>
                
                <button
                  onClick={() => handleThemeChange('system')}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:scale-[1.02]",
                    theme === 'system' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <Monitor className="w-6 h-6" />
                  <span className="text-sm font-medium">{t('settings.appearance.themeSystem')}</span>
                  {theme === 'system' && <Check className="w-4 h-4 text-primary" />}
                </button>
              </div>
            </div>

            {/* UI Font Size - Slider */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>{t('settings.appearance.uiFontSize')}</Label>
                <span className="text-sm text-muted-foreground">
                  {getUIFontSizePx(settings.uiFontSize)}px
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground">{t('settings.appearance.fontSmall')}</span>
                <Slider
                  value={[sizeToSlider(settings.uiFontSize)]}
                  onValueChange={([v]) => updateSettings({ uiFontSize: sliderToSize(v) })}
                  min={0}
                  max={2}
                  step={1}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground">{t('settings.appearance.fontLarge')}</span>
              </div>
              <div className="flex justify-between px-1">
                <div className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  settings.uiFontSize === 'small' ? "bg-primary" : "bg-muted"
                )} />
                <div className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  settings.uiFontSize === 'medium' ? "bg-primary" : "bg-muted"
                )} />
                <div className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  settings.uiFontSize === 'large' ? "bg-primary" : "bg-muted"
                )} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terminal */}
        <Card className="backdrop-blur-sm bg-card/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Terminal className="w-5 h-5 text-primary" />
              {t('settings.terminal.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>{t('settings.terminal.fontSize')}</Label>
                <span className="text-sm text-muted-foreground">{settings.terminalFontSize}px</span>
              </div>
              <Slider
                value={[settings.terminalFontSize]}
                onValueChange={([v]) => updateSettings({ terminalFontSize: v })}
                min={10}
                max={24}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>10px</span>
                <span>17px</span>
                <span>24px</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label>{t('settings.terminal.fontFamily')}</Label>
              <Input
                value={settings.terminalFontFamily}
                onChange={(e) => updateSettings({ terminalFontFamily: e.target.value })}
                className="font-mono"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>{t('settings.terminal.cursorBlink')}</Label>
              <Switch
                checked={true}
                onCheckedChange={() => {}}
              />
            </div>
          </CardContent>
        </Card>

        {/* Language */}
        <Card className="backdrop-blur-sm bg-card/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="w-5 h-5 text-primary" />
              {t('settings.language.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Label>{t('settings.language.displayLanguage')}</Label>
              <Select
                value={language}
                onValueChange={handleLanguageChange}
              >
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">{t('settings.language.en')}</SelectItem>
                  <SelectItem value="zh-CN">{t('settings.language.zhCN')}</SelectItem>
                  <SelectItem value="zh-TW">{t('settings.language.zhTW')}</SelectItem>
                  <SelectItem value="system">{t('settings.language.system')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* SFTP */}
        <Card className="backdrop-blur-sm bg-card/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FolderOpen className="w-5 h-5 text-primary" />
              {t('settings.sftp.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>{t('settings.sftp.showHiddenFiles')}</Label>
                <p className="text-sm text-muted-foreground">Show files starting with .</p>
              </div>
              <Switch
                checked={settings.showHiddenFiles}
                onCheckedChange={(v) => updateSettings({ showHiddenFiles: v })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>{t('settings.sftp.confirmDelete')}</Label>
                <p className="text-sm text-muted-foreground">Show confirmation before deleting files</p>
              </div>
              <Switch
                checked={settings.confirmBeforeDelete}
                onCheckedChange={(v) => updateSettings({ confirmBeforeDelete: v })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Advanced */}
        <Card className="backdrop-blur-sm bg-card/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Aperture className="w-5 h-5 text-primary" />
              {t('settings.advanced.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>{t('settings.advanced.autoSaveSessions')}</Label>
                <p className="text-sm text-muted-foreground">Automatically save session state</p>
              </div>
              <Switch
                checked={settings.autoSaveSessions}
                onCheckedChange={(v) => updateSettings({ autoSaveSessions: v })}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
