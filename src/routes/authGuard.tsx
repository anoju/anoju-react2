import { Navigate, useLocation } from 'react-router-dom';
import { LOGIN_PATH } from '@/constants/app';
import { PageLoading } from '@/components';
import { useAuthStore } from '@/stores/authStore';
import type { AppRouteConfig } from './types';

interface AuthGuardProps {
  route: AppRouteConfig;
  children: React.ReactNode;
}

export const AuthGuard = ({ route, children }: AuthGuardProps) => {
  const location = useLocation();
  const { status, user } = useAuthStore();

  if (!route.requiresAuth && !route.adminOnly && !route.roles?.length) {
    return <>{children}</>;
  }

  if (status === 'initializing') {
    return <PageLoading label="인증 상태를 확인하고 있습니다." />;
  }

  if (status === 'anonymous' || (status === 'authenticated' && route.requiresAuth && !user?.id)) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`${LOGIN_PATH}?redirect=${redirect}`} replace />;
  }

  if (status === 'emailUnverified') {
    return <Navigate to={`${LOGIN_PATH}?reason=email-unverified`} replace />;
  }

  if (status === 'suspended' || status === 'withdrawn') {
    return <Navigate to={`${LOGIN_PATH}?reason=${status}`} replace />;
  }

  if (route.requiresAuth && status !== 'authenticated') {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`${LOGIN_PATH}?redirect=${redirect}`} replace />;
  }

  if (route.adminOnly && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  if (route.roles?.length && user?.role && !route.roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
