import { useCallback, useEffect, useState } from 'react';
import type React from 'react';
import { Search } from 'lucide-react';
import { Button, Input, Select, TextArea } from '@/components/atoms';
import { DataList } from '@/components/molecules';
import { showConfirm, toast } from '@/components/feedback';
import { getUserMessage, reportApi } from '@/apis';
import { useAuthStore } from '@/stores/authStore';
import type { ReportRecord, ReportStatus } from '@/types/domain';
import { formatRelativeTime } from '@/utils/community';
import { reportReasonLabels, reportStatusLabels } from '../constants';

const statusOptions = [
  { value: '', label: '전체 상태' },
  ...Object.entries(reportStatusLabels).map(([value, label]) => ({ value, label })),
];

const getReporterName = (report: ReportRecord) =>
  report.expand?.reporter?.nickname ?? report.expand?.reporter?.email ?? report.reporter;

const Reports = () => {
  const adminUser = useAuthStore((state) => state.user);
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [status, setStatus] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [memoDrafts, setMemoDrafts] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const loadReports = useCallback(
    async (nextPage = 1) => {
      if (nextPage === 1) {
        setLoadingInitial(true);
      } else {
        setLoadingMore(true);
      }

      setError(null);

      try {
        const result = await reportApi.listReports({
          page: nextPage,
          perPage: 12,
          status,
          keyword,
        });
        setReports((current) => (nextPage === 1 ? result.items : [...current, ...result.items]));
        setPage(result.page);
        setTotalPages(result.totalPages);
        setMemoDrafts((current) => ({
          ...current,
          ...Object.fromEntries(result.items.map((report) => [report.id, report.adminMemo ?? ''])),
        }));
      } catch (loadError) {
        setError(getUserMessage(loadError));
      } finally {
        setLoadingInitial(false);
        setLoadingMore(false);
      }
    },
    [keyword, status],
  );

  useEffect(() => {
    void loadReports(1);
  }, [loadReports]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void loadReports(1);
  };

  const handleStatusUpdate = async (report: ReportRecord, nextStatus: ReportStatus) => {
    const confirmed = await showConfirm(`신고 상태를 '${reportStatusLabels[nextStatus]}'로 변경할까요?`, {
      title: '신고 처리',
      confirmLabel: '변경',
    });

    if (!confirmed) {
      return;
    }

    setSubmittingId(report.id);

    try {
      const updated = await reportApi.updateStatus(report.id, {
        status: nextStatus,
        handledBy: adminUser?.id,
        resolution: reportStatusLabels[nextStatus],
        adminMemo: memoDrafts[report.id] ?? '',
      });
      setReports((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      toast('신고 상태를 변경했습니다.', { tone: 'success' });
    } catch (updateError) {
      toast(getUserMessage(updateError), { tone: 'danger' });
    } finally {
      setSubmittingId(null);
    }
  };

  const handleHideTarget = async (report: ReportRecord) => {
    const confirmed = await showConfirm('신고 대상을 숨김 처리할까요?', {
      title: '신고 대상 숨김',
      confirmLabel: '숨김 처리',
    });

    if (!confirmed) {
      return;
    }

    setSubmittingId(report.id);

    try {
      await reportApi.hideTarget(report);
      const updated = await reportApi.updateStatus(report.id, {
        status: 'resolved',
        handledBy: adminUser?.id,
        resolution: '신고 대상 숨김 처리',
        adminMemo: memoDrafts[report.id] ?? '',
      });
      setReports((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      toast('신고 대상을 숨김 처리했습니다.', { tone: 'success' });
    } catch (hideError) {
      toast(getUserMessage(hideError), { tone: 'danger' });
    } finally {
      setSubmittingId(null);
    }
  };

  const handleDeleteTarget = async (report: ReportRecord) => {
    const confirmed = await showConfirm('신고 대상을 영구 삭제할까요? 이 작업은 되돌릴 수 없습니다.', {
      title: '신고 대상 영구 삭제',
      confirmLabel: '영구 삭제',
      tone: 'danger',
    });

    if (!confirmed) {
      return;
    }

    setSubmittingId(report.id);

    try {
      await reportApi.deleteTarget(report);
      const updated = await reportApi.updateStatus(report.id, {
        status: 'resolved',
        handledBy: adminUser?.id,
        resolution: '신고 대상 영구 삭제',
        adminMemo: memoDrafts[report.id] ?? '',
      });
      setReports((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      toast('신고 대상을 영구 삭제했습니다.', { tone: 'success' });
    } catch (deleteError) {
      toast(getUserMessage(deleteError), { tone: 'danger' });
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <section className="container admin-page">
      <header className="admin-page__header">
        <span className="board-page__eyebrow">Admin</span>
        <h2>신고 관리</h2>
        <p>접수된 신고를 검토하고 숨김, 삭제, 회원 정지 같은 후속 조치를 기록합니다.</p>
      </header>

      <form className="admin-filter" onSubmit={handleSearchSubmit}>
        <Input
          label="검색"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="대상 id, 상세 내용, 관리자 메모"
          leftIcon={<Search size={16} />}
        />
        <Select label="상태" value={status} options={statusOptions} onChange={(event) => setStatus(event.target.value)} />
        <Button type="submit">검색</Button>
      </form>

      <DataList
        items={reports}
        getKey={(report) => report.id}
        renderItem={(report) => (
          <article className="admin-list-card">
            <header className="admin-list-card__header">
              <span>
                <strong>{report.targetType}</strong>
                <small>{report.targetId}</small>
              </span>
              <em data-state={report.status}>{reportStatusLabels[report.status]}</em>
            </header>

            <dl className="admin-meta-list">
              <div>
                <dt>신고자</dt>
                <dd>{getReporterName(report)}</dd>
              </div>
              <div>
                <dt>사유</dt>
                <dd>{reportReasonLabels[report.reason]}</dd>
              </div>
              <div>
                <dt>접수</dt>
                <dd>{formatRelativeTime(report.created)}</dd>
              </div>
            </dl>

            {report.detail ? <p className="admin-list-card__body">{report.detail}</p> : null}

            <TextArea
              label="관리자 메모"
              value={memoDrafts[report.id] ?? ''}
              rows={3}
              onChange={(event) =>
                setMemoDrafts((current) => ({
                  ...current,
                  [report.id]: event.target.value,
                }))
              }
            />

            <div className="admin-list-card__actions">
              <Button
                type="button"
                size="sm"
                variant="outline"
                loading={submittingId === report.id}
                onClick={() => void handleStatusUpdate(report, 'reviewing')}
              >
                검토 중
              </Button>
              <Button
                type="button"
                size="sm"
                tone="warning"
                variant="outline"
                loading={submittingId === report.id}
                onClick={() => void handleHideTarget(report)}
              >
                대상 숨김
              </Button>
              <Button
                type="button"
                size="sm"
                tone="danger"
                variant="outline"
                loading={submittingId === report.id}
                onClick={() => void handleDeleteTarget(report)}
              >
                대상 삭제
              </Button>
              <Button
                type="button"
                size="sm"
                tone="success"
                loading={submittingId === report.id}
                onClick={() => void handleStatusUpdate(report, 'resolved')}
              >
                처리 완료
              </Button>
              <Button
                type="button"
                size="sm"
                tone="neutral"
                variant="outline"
                loading={submittingId === report.id}
                onClick={() => void handleStatusUpdate(report, 'rejected')}
              >
                기각
              </Button>
            </div>
          </article>
        )}
        loadingInitial={loadingInitial}
        loadingMore={loadingMore}
        hasMore={page < totalPages}
        error={error}
        emptyTitle="접수된 신고가 없습니다."
        onLoadMore={() => void loadReports(page + 1)}
        onRetry={() => void loadReports(1)}
      />
    </section>
  );
};

export default Reports;
