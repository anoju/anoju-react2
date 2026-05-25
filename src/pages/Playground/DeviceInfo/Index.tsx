import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronRight, MonitorSmartphone, Plus, Search } from 'lucide-react';
import { DataList, FloatingActionButton, FloatingActions, Input, Select, toast } from '@/components';
import { deviceReportApi, getUserMessage } from '@/apis';
import { DEVICE_INFO_PATH, DEVICE_INFO_WRITE_PATH, LOGIN_PATH } from '@/constants/app';
import type { DeviceReportRecord } from '@/types/domain';
import type { SelectOption } from '@/components';
import { useAuthStore } from '@/stores/authStore';
import { formatRelativeTime } from '@/utils/community';
import { formatWindowSize, getOrientationLabel } from './utils';

const PER_PAGE = 20;

const toOptions = (values: string[]): SelectOption[] => values.map((value) => ({ value, label: value }));

const DeviceInfo = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [keywordInput, setKeywordInput] = useState(searchParams.get('keyword') ?? '');
  const [reports, setReports] = useState<DeviceReportRecord[]>([]);
  const [manufacturers, setManufacturers] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const manufacturer = searchParams.get('manufacturer') ?? '';
  const model = searchParams.get('model') ?? '';
  const keyword = searchParams.get('keyword') ?? '';

  const manufacturerOptions = useMemo(() => toOptions(manufacturers), [manufacturers]);
  const modelOptions = useMemo(() => toOptions(models), [models]);

  const loadReports = useCallback(
    async (nextPage = 1) => {
      if (nextPage === 1) {
        setLoadingInitial(true);
      } else {
        setLoadingMore(true);
      }

      setError(null);

      try {
        const result = await deviceReportApi.listReports({
          page: nextPage,
          perPage: PER_PAGE,
          manufacturer,
          model,
          keyword,
        });

        setReports((currentReports) => (nextPage === 1 ? result.items : [...currentReports, ...result.items]));
        setPage(result.page);
        setTotalPages(result.totalPages);
      } catch (loadError) {
        setError(getUserMessage(loadError));
      } finally {
        setLoadingInitial(false);
        setLoadingMore(false);
      }
    },
    [keyword, manufacturer, model],
  );

  useEffect(() => {
    void loadReports(1);
  }, [loadReports]);

  useEffect(() => {
    void deviceReportApi.listManufacturers().then(setManufacturers).catch(() => setManufacturers([]));
  }, []);

  useEffect(() => {
    void deviceReportApi.listModels(manufacturer).then(setModels).catch(() => setModels([]));
  }, [manufacturer]);

  useEffect(() => {
    setKeywordInput(keyword);
  }, [keyword]);

  const updateSearchParams = (next: { manufacturer?: string; model?: string; keyword?: string }) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(next).forEach(([key, value]) => {
      if (value?.trim()) {
        params.set(key, value.trim());
      } else {
        params.delete(key);
      }
    });

    if ('manufacturer' in next) {
      params.delete('model');
    }

    params.delete('page');
    params.delete('cursor');
    setSearchParams(params);
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateSearchParams({ keyword: keywordInput });
  };

  const handleWriteClick = () => {
    if (!isAuthenticated) {
      const redirect = encodeURIComponent(location.pathname);
      toast('디바이스정보 작성은 이메일 인증을 완료한 회원만 가능합니다.', { tone: 'warning' });
      navigate(`${LOGIN_PATH}?redirect=${redirect}`);
    }
  };

  return (
    <section className="container board-page device-page">
      <header className="board-page__header">
        <div>
          <span className="board-page__eyebrow">playground</span>
          <h2>디바이스정보</h2>
          <p>모바일 기기별 웹 해상도와 표시 설정을 함께 모아봅니다.</p>
        </div>
      </header>

      <form className="board-page__search" onSubmit={handleSearchSubmit}>
        <Input
          label="검색"
          value={keywordInput}
          onChange={(event) => setKeywordInput(event.target.value)}
          placeholder="모델, 제조사, 설명 검색"
          leftIcon={<Search size={16} />}
        />
      </form>

      <div className="device-filter">
        <Select
          label="제조사"
          value={manufacturer}
          onChange={(event) => updateSearchParams({ manufacturer: event.target.value })}
          placeholder="전체 제조사"
          options={manufacturerOptions}
        />
        <Select
          label="모델"
          value={model}
          onChange={(event) => updateSearchParams({ model: event.target.value })}
          placeholder="전체 모델"
          options={modelOptions}
        />
      </div>

      <DataList
        items={reports}
        getKey={(report) => report.id}
        mode="loadMore"
        loadingInitial={loadingInitial}
        loadingMore={loadingMore}
        hasMore={page < totalPages}
        error={error}
        emptyTitle="아직 디바이스 정보가 없습니다."
        emptyDescription="현재 기기의 웹 해상도를 첫 데이터로 남겨보세요."
        onLoadMore={() => void loadReports(page + 1)}
        onRetry={() => void loadReports(1)}
        renderItem={(report) => (
          <Link to={`${DEVICE_INFO_PATH}/${report.id}`} className="device-list-item">
            <span className="device-list-item__icon" aria-hidden="true">
              <MonitorSmartphone size={20} />
            </span>
            <span className="device-list-item__body">
              <span className="device-list-item__title">
                {report.manufacturer} {report.model}
              </span>
              <span className="device-list-item__spec-grid">
                <span>
                  <small>윈도우</small>
                  <strong>{formatWindowSize(report)}</strong>
                </span>
                <span>
                  <small>ratio</small>
                  <strong>{report.devicePixelRatio}</strong>
                </span>
                <span>
                  <small>방향</small>
                  <strong>{getOrientationLabel(report.orientation)}</strong>
                </span>
                <span>
                  <small>표시설정</small>
                  <strong>{report.displaySetting}</strong>
                </span>
              </span>
              <span className="device-list-item__meta">{formatRelativeTime(report.created)} 등록</span>
            </span>
            <ChevronRight className="device-list-item__arrow" size={18} aria-hidden="true" />
          </Link>
        )}
      />

      <FloatingActions label="디바이스정보 주요 액션">
        {isAuthenticated ? (
          <FloatingActionButton label="디바이스정보 작성" to={DEVICE_INFO_WRITE_PATH} icon={<Plus size={24} />} />
        ) : (
          <FloatingActionButton label="디바이스정보 작성" icon={<Plus size={24} />} onClick={handleWriteClick} />
        )}
      </FloatingActions>
    </section>
  );
};

export default DeviceInfo;
