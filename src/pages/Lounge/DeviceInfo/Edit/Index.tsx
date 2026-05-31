import type React from 'react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { RefreshCw } from 'lucide-react'
import { Button, FixedBottomActions, Input, Select, TextArea, toast } from '@/components'
import { deviceReportApi, getUserMessage } from '@/apis'
import { DEVICE_INFO_PATH } from '@/constants/app'
import type { SelectOption } from '@/components'
import type { DeviceOrientation, DeviceReportRecord } from '@/types/domain'
import { usePageLoadingEffect } from '@/hooks'
import { useUnsavedChanges } from '@/hooks'
import { useAuthStore } from '@/stores/authStore'
import { canEditAuthoredRecord } from '@/utils/recordPermission'
import { DIRECT_INPUT_VALUE, getCurrentDeviceSnapshot, isIosUserAgent } from '../utils'

const toOptions = (values: string[]): SelectOption[] => [
  ...values.map((value) => ({ value, label: value })),
  { value: DIRECT_INPUT_VALUE, label: '직접 입력' },
]

const orientationOptions: SelectOption[] = [
  { value: 'portrait', label: '세로' },
  { value: 'landscape', label: '가로' },
]

const DeviceInfoEdit = () => {
  const { deviceReportId = '' } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [report, setReport] = useState<DeviceReportRecord | null>(null)
  const [manufacturers, setManufacturers] = useState<string[]>([])
  const [models, setModels] = useState<string[]>([])
  const [manufacturerMode, setManufacturerMode] = useState(DIRECT_INPUT_VALUE)
  const [modelMode, setModelMode] = useState(DIRECT_INPUT_VALUE)
  const [manufacturerInput, setManufacturerInput] = useState('')
  const [modelInput, setModelInput] = useState('')
  const [screenWidth, setScreenWidth] = useState(0)
  const [screenHeight, setScreenHeight] = useState(0)
  const [windowWidthMin, setWindowWidthMin] = useState(0)
  const [windowWidthMax, setWindowWidthMax] = useState(0)
  const [windowHeightMin, setWindowHeightMin] = useState(0)
  const [windowHeightMax, setWindowHeightMax] = useState(0)
  const [devicePixelRatio, setDevicePixelRatio] = useState(1)
  const [orientation, setOrientation] = useState<DeviceOrientation>('portrait')
  const [userAgent, setUserAgent] = useState('')
  const [displaySetting, setDisplaySetting] = useState(0)
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const manufacturer =
    manufacturerMode === DIRECT_INPUT_VALUE ? manufacturerInput.trim() : manufacturerMode
  const model = modelMode === DIRECT_INPUT_VALUE ? modelInput.trim() : modelMode
  const iosDevice = isIosUserAgent(userAgent)
  const dirty = Boolean(
    report &&
    (manufacturer !== report.manufacturer ||
      model !== report.model ||
      screenWidth !== report.screenWidth ||
      screenHeight !== report.screenHeight ||
      windowWidthMin !== report.windowWidthMin ||
      windowWidthMax !== report.windowWidthMax ||
      windowHeightMin !== report.windowHeightMin ||
      windowHeightMax !== report.windowHeightMax ||
      devicePixelRatio !== report.devicePixelRatio ||
      orientation !== report.orientation ||
      userAgent !== report.userAgent ||
      displaySetting !== report.displaySetting ||
      description !== (report.description ?? '')),
  )
  const { confirmLeave } = useUnsavedChanges(dirty && !submitting)
  usePageLoadingEffect(loading, '디바이스 정보를 불러오고 있습니다.')

  useEffect(() => {
    void deviceReportApi
      .listManufacturers()
      .then(setManufacturers)
      .catch(() => setManufacturers([]))
  }, [])

  useEffect(() => {
    void deviceReportApi
      .listModels(manufacturerMode === DIRECT_INPUT_VALUE ? undefined : manufacturerMode)
      .then(setModels)
      .catch(() => setModels([]))
  }, [manufacturerMode])

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
      .then((nextReport) => {
        setReport(nextReport)
        setManufacturerMode(DIRECT_INPUT_VALUE)
        setModelMode(DIRECT_INPUT_VALUE)
        setManufacturerInput(nextReport.manufacturer)
        setModelInput(nextReport.model)
        setScreenWidth(nextReport.screenWidth)
        setScreenHeight(nextReport.screenHeight)
        setWindowWidthMin(nextReport.windowWidthMin)
        setWindowWidthMax(nextReport.windowWidthMax)
        setWindowHeightMin(nextReport.windowHeightMin)
        setWindowHeightMax(nextReport.windowHeightMax)
        setDevicePixelRatio(nextReport.devicePixelRatio)
        setOrientation(nextReport.orientation)
        setUserAgent(nextReport.userAgent)
        setDisplaySetting(nextReport.displaySetting)
        setDescription(nextReport.description ?? '')
      })
      .catch((loadError) => setError(getUserMessage(loadError)))
      .finally(() => setLoading(false))
  }, [deviceReportId])

  useEffect(() => {
    if (iosDevice) {
      setDisplaySetting(0)
    }
  }, [iosDevice])

  const handleCancel = async () => {
    if (await confirmLeave()) {
      navigate(`${DEVICE_INFO_PATH}/${deviceReportId}`)
    }
  }

  const handleManufacturerChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setManufacturerMode(event.target.value)
    setModelMode(DIRECT_INPUT_VALUE)
    setModelInput('')
  }

  const handleMeasureWindowSize = () => {
    const snapshot = getCurrentDeviceSnapshot()

    setWindowWidthMin(snapshot.windowWidth)
    setWindowWidthMax(snapshot.windowWidth)
    setWindowHeightMin(snapshot.windowHeight)
    setWindowHeightMax(snapshot.windowHeight)
    setOrientation(snapshot.orientation)
    toast('현재 윈도우 사이즈를 다시 측정했습니다.', { tone: 'success' })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!manufacturer || !model) {
      toast('제조사와 모델을 입력해주세요.', { tone: 'warning' })
      return
    }

    if (
      screenWidth <= 0 ||
      screenHeight <= 0 ||
      windowWidthMin <= 0 ||
      windowWidthMax <= 0 ||
      windowHeightMin <= 0 ||
      windowHeightMax <= 0 ||
      devicePixelRatio <= 0 ||
      windowWidthMin > windowWidthMax ||
      windowHeightMin > windowHeightMax
    ) {
      toast('스크린/윈도우 사이즈와 ratio 값을 확인해주세요.', { tone: 'warning' })
      return
    }

    setSubmitting(true)

    try {
      const nextReport = await deviceReportApi.updateReport({
        reportId: deviceReportId,
        manufacturer,
        model,
        screenWidth,
        screenHeight,
        windowWidthMin,
        windowWidthMax,
        windowHeightMin,
        windowHeightMax,
        devicePixelRatio,
        orientation,
        userAgent,
        displaySetting: iosDevice ? 0 : displaySetting,
        description,
      })

      toast('디바이스 정보를 수정했습니다.', { tone: 'success' })
      navigate(`${DEVICE_INFO_PATH}/${nextReport.id}`, { replace: true })
    } catch (submitError) {
      toast(getUserMessage(submitError), { tone: 'danger' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return null
  }

  if (error || !report) {
    return (
      <section className="container write-page">
        <p className="board-page__message">{error ?? '디바이스 정보를 찾을 수 없습니다.'}</p>
        <Link className="button-link" to={DEVICE_INFO_PATH}>
          목록으로
        </Link>
      </section>
    )
  }

  if (!canEditAuthoredRecord(report, user)) {
    return (
      <section className="container write-page">
        <p className="board-page__message">수정 권한이 없습니다.</p>
        <Link className="button-link" to={`${DEVICE_INFO_PATH}/${report.id}`}>
          상세로
        </Link>
      </section>
    )
  }

  return (
    <section className="container write-page device-write">
      <header className="write-page__header">
        <span className="board-page__eyebrow">디바이스정보</span>
        <h2>디바이스정보 수정</h2>
        <p>자동으로 등록된 측정값도 필요하면 직접 수정할 수 있습니다.</p>
      </header>

      <form className="write-page__form" onSubmit={handleSubmit}>
        <Select
          label="제조사"
          value={manufacturerMode}
          onChange={handleManufacturerChange}
          options={toOptions(manufacturers)}
        />
        {manufacturerMode === DIRECT_INPUT_VALUE ? (
          <Input
            label="제조사 직접입력"
            value={manufacturerInput}
            onChange={(event) => setManufacturerInput(event.target.value)}
            required
          />
        ) : null}

        <Select
          label="모델"
          value={modelMode}
          onChange={(event) => setModelMode(event.target.value)}
          options={toOptions(models)}
        />
        {modelMode === DIRECT_INPUT_VALUE ? (
          <Input
            label="모델 직접입력"
            value={modelInput}
            onChange={(event) => setModelInput(event.target.value)}
            required
          />
        ) : null}

        <section className="device-measure device-measure--editable" aria-label="측정값 수정">
          <Input
            label="스크린 width"
            type="number"
            min={1}
            value={screenWidth}
            onChange={(event) => setScreenWidth(Number(event.target.value || 0))}
          />
          <Input
            label="스크린 height"
            type="number"
            min={1}
            value={screenHeight}
            onChange={(event) => setScreenHeight(Number(event.target.value || 0))}
          />
          <Input
            label="윈도우 width 최소"
            type="number"
            min={1}
            value={windowWidthMin}
            onChange={(event) => setWindowWidthMin(Number(event.target.value || 0))}
          />
          <Input
            label="윈도우 width 최대"
            type="number"
            min={1}
            value={windowWidthMax}
            onChange={(event) => setWindowWidthMax(Number(event.target.value || 0))}
          />
          <Input
            label="윈도우 height 최소"
            type="number"
            min={1}
            value={windowHeightMin}
            onChange={(event) => setWindowHeightMin(Number(event.target.value || 0))}
          />
          <Input
            label="윈도우 height 최대"
            type="number"
            min={1}
            value={windowHeightMax}
            onChange={(event) => setWindowHeightMax(Number(event.target.value || 0))}
          />
          <Input
            label="ratio"
            type="number"
            min={0.1}
            step="0.001"
            value={devicePixelRatio}
            onChange={(event) => setDevicePixelRatio(Number(event.target.value || 0))}
          />
          <Select
            label="스크린방향"
            value={orientation}
            onChange={(event) => setOrientation(event.target.value as DeviceOrientation)}
            options={orientationOptions}
          />
          <div className="device-measure__action">
            <Button
              type="button"
              variant="outline"
              tone="neutral"
              leftIcon={<RefreshCw size={16} />}
              onClick={handleMeasureWindowSize}
            >
              윈도우 사이즈 다시 측정
            </Button>
          </div>
        </section>

        <Input
          label="userAgent"
          value={userAgent}
          onChange={(event) => setUserAgent(event.target.value)}
        />
        <Input
          label="디스플레이설정"
          type="number"
          min={iosDevice ? 0 : 1}
          value={displaySetting}
          disabled={iosDevice}
          onChange={(event) => setDisplaySetting(Number(event.target.value || 0))}
          description="Android 등 설정의 화면 크기/표시 크기 단계 기준입니다. 설정에서 가장 왼쪽을 1로 보고 현재 단계를 입력합니다. iPhone나 iPad등 설정을 바꿀수 없을경우 0으로 입력해주세요."
        />
        <TextArea
          label="추가설명"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={1000}
          rows={5}
        />

        <FixedBottomActions>
          <Button type="button" variant="outline" tone="neutral" onClick={handleCancel}>
            취소
          </Button>
          <Button type="submit" loading={submitting}>
            저장
          </Button>
        </FixedBottomActions>
      </form>
    </section>
  )
}

export default DeviceInfoEdit
