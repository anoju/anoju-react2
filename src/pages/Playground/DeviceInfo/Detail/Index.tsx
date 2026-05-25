import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MonitorSmartphone, Pencil, Trash2 } from 'lucide-react'
import { Button, ShareButton, confirm, toast } from '@/components'
import { deviceReportApi, getUserMessage } from '@/apis'
import { DEVICE_INFO_PATH } from '@/constants/app'
import type { DeviceReportRecord } from '@/types/domain'
import { formatRelativeTime } from '@/utils/community'
import { canEditAuthoredRecord } from '@/utils/recordPermission'
import { useAuthStore } from '@/stores/authStore'
import { formatScreenSize, formatWindowSize, getOrientationLabel } from '../utils'

const DeviceInfoDetail = () => {
  const { deviceReportId } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [report, setReport] = useState<DeviceReportRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const shareUrl = useMemo(() => (typeof window === 'undefined' ? '' : window.location.href), [])

  useEffect(() => {
    if (!deviceReportId) {
      setError('디바이스 정보를 찾을 수 없습니다.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    void deviceReportApi
      .getReport(deviceReportId)
      .then(setReport)
      .catch((loadError) => setError(getUserMessage(loadError)))
      .finally(() => setLoading(false))
  }, [deviceReportId])

  const handleHideReport = async () => {
    if (!report) {
      return
    }

    const confirmed = await confirm('디바이스 정보를 목록에서 숨김 처리할까요?', {
      title: '삭제 확인',
      confirmLabel: '삭제',
      tone: 'danger',
    })

    if (!confirmed) {
      return
    }

    setDeleting(true)

    try {
      await deviceReportApi.hideReport(report.id)
      toast('디바이스 정보를 숨김 처리했습니다.', { tone: 'success' })
      navigate(DEVICE_INFO_PATH, { replace: true })
    } catch (deleteError) {
      toast(getUserMessage(deleteError), { tone: 'danger' })
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return <section className="container board-page">디바이스 정보를 불러오고 있습니다.</section>
  }

  if (error || !report) {
    return (
      <section className="container board-page">
        <p className="board-page__message">{error ?? '디바이스 정보를 찾을 수 없습니다.'}</p>
        <Link to={DEVICE_INFO_PATH} className="text-link">
          목록으로 돌아가기
        </Link>
      </section>
    )
  }

  return (
    <article className="container device-detail">
      <header className="device-detail__header">
        <div className="device-detail__title-icon" aria-hidden="true">
          <MonitorSmartphone size={24} />
        </div>
        <div>
          <span className="board-page__eyebrow">디바이스정보</span>
          <h2>
            {report.manufacturer} {report.model}
          </h2>
          <p>{formatRelativeTime(report.created)} 등록</p>
        </div>
      </header>

      <dl className="device-detail__grid">
        <div>
          <dt>제조사</dt>
          <dd>{report.manufacturer}</dd>
        </div>
        <div>
          <dt>모델</dt>
          <dd>{report.model}</dd>
        </div>
        <div>
          <dt>스크린 사이즈</dt>
          <dd>{formatScreenSize(report)}</dd>
        </div>
        <div>
          <dt>윈도우 사이즈</dt>
          <dd>{formatWindowSize(report)}</dd>
        </div>
        <div>
          <dt>ratio</dt>
          <dd>{report.devicePixelRatio}</dd>
        </div>
        <div>
          <dt>스크린방향</dt>
          <dd>{getOrientationLabel(report.orientation)}</dd>
        </div>
        <div>
          <dt>디스플레이설정</dt>
          <dd>
            <strong>{report.displaySetting}</strong>
            <span className="device-detail__hint">
              Android 등 설정의 화면 크기/표시 크기 단계 기준입니다. 설정에서 가장 왼쪽을 1로 보고 현재 단계를
              입력합니다. iPhone나 iPad등 설정을 바꿀수 없을경우 0으로 입력해주세요.
            </span>
          </dd>
        </div>
        <div className="device-detail__row--wide">
          <dt>userAgent</dt>
          <dd>{report.userAgent}</dd>
        </div>
        {report.description ? (
          <div className="device-detail__row--wide">
            <dt>추가설명</dt>
            <dd>{report.description}</dd>
          </div>
        ) : null}
      </dl>

      <div className="admin-actions device-detail__actions">
        {canEditAuthoredRecord(report, user) ? (
          <Button
            type="button"
            variant="outline"
            tone="neutral"
            size="lg"
            leftIcon={<Pencil size={16} />}
            onClick={() => navigate(`${DEVICE_INFO_PATH}/${report.id}/edit`)}
          >
            수정
          </Button>
        ) : null}
        {canEditAuthoredRecord(report, user) && !report.deleted && report.status !== 'hidden' ? (
          <Button
            type="button"
            variant="outline"
            tone="danger"
            size="lg"
            loading={deleting}
            leftIcon={<Trash2 size={16} />}
            onClick={() => void handleHideReport()}
          >
            삭제
          </Button>
        ) : null}
        <ShareButton
          title={`${report.manufacturer} ${report.model} 디바이스정보`}
          text="모바일 웹 해상도 정보를 확인해보세요."
          url={shareUrl}
          className="device-detail__share"
        />
      </div>
    </article>
  )
}

export default DeviceInfoDetail
