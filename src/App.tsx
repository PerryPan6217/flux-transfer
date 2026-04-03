import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import { MainLayout } from '@/components/layout/MainLayout';
import { applyTheme } from '@/store';
import './App.css';

function App() {
  useEffect(() => {
    // Apply initial theme
    applyTheme('system');
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      applyTheme('system');
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <MainLayout />
    </I18nextProvider>
  );
}

export default App;
