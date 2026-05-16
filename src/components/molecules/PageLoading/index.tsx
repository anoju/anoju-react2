import { Spinner } from '@/components/atoms';

interface PageLoadingProps {
  label?: string;
}

export const PageLoading = ({ label = '화면을 불러오고 있습니다.' }: PageLoadingProps) => (
  <div className="page-loading" role="status" aria-live="polite">
    <Spinner size="lg" label={label} />
    <p className="page-loading__text">{label}</p>
  </div>
);
