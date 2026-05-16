import { Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/templates/AppLayout';
import { AuthGuard } from './authGuard';
import { routeConfig } from './routeConfig';

export const AppRoutes = () => (
  <Routes>
    {routeConfig.map((route) => (
      <Route
        key={route.id}
        path={route.path}
        element={
          <AuthGuard route={route}>
            <AppLayout route={route}>{route.element}</AppLayout>
          </AuthGuard>
        }
      />
    ))}
  </Routes>
);
