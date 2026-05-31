import { GlobalLoading } from '../GlobalLoading';

interface PageLoadingProps {
  label?: string;
}

export const PageLoading = ({ label = '화면을 불러오고 있습니다.' }: PageLoadingProps) => <GlobalLoading label={label} />;
