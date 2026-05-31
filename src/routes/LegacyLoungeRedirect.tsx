import { Navigate, useLocation } from 'react-router-dom';
import { LOUNGE_PATH } from '@/constants/app';

export const LegacyLoungeRedirect = () => {
  const location = useLocation();
  const nextPath = location.pathname.replace(/^\/playground/, LOUNGE_PATH);

  return <Navigate to={`${nextPath}${location.search}${location.hash}`} replace />;
};
