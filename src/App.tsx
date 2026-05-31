import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { PageLoadingOverlay } from '@/components';
import { AppRoutes } from '@/routes/AppRoutes';
import { useAuthStore } from '@/stores/authStore';
import { initializeThemeAttributes } from '@/stores/themeStore';

function App() {
  const initializeAuth = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initializeThemeAttributes();
    void initializeAuth();
  }, [initializeAuth]);

  return (
    <BrowserRouter>
      <AppRoutes />
      <PageLoadingOverlay />
    </BrowserRouter>
  );
}

export default App;
