import type React from 'react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, FixedBottomActions, Input, Select, TextArea, toast } from '@/components';
import { deviceReportApi, getUserMessage } from '@/apis';
import { DEVICE_INFO_PATH } from '@/constants/app';
import type { SelectOption } from '@/components';
import type { DeviceReportRecord } from '@/types/domain';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { useAuthStore } from '@/stores/authStore';
import { canEditAuthoredRecord } from '@/utils/recordPermission';
import { DIRECT_INPUT_VALUE, formatScreenSize, formatWindowSize, getOrientationLabel, isIosUserAgent } from '../utils';

const toOptions = (values: string[]): SelectOption[] => [
  ...values.map((value) => ({ value, label: value })),
  { value: DIRECT_INPUT_VALUE, label: '직접 입력' },
];

const DeviceInfoEdit = () => {
  const { deviceReportId = '' } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [report, setReport] = useState<DeviceReportRecord | null>(null);
  const [manufacturers, setManufacturers] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [manufacturerMode, setManufacturerMode] = useState(DIRECT_INPUT_VALUE);
  const [modelMode, setModelMode] = useState(DIRECT_INPUT_VALUE);
  const [manufacturerInput, setManufacturerInput] = useState('');
  const [modelInput, setModelInput] = useState('');
  const [displaySetting, setDisplaySetting] = useState(0);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const manufacturer = manufacturerMode === DIRECT_INPUT_VALUE ? manufacturerInput.trim() : manufacturerMode;
  const model = modelMode === DIRECT_INPUT_VALUE ? modelInput.trim() : modelMode;
  const iosDevice = isIosUserAgent(report?.userAgent ?? '');
  const dirty = Boolean(
    report &&
      (manufacturer !== report.manufacturer ||
        model !== report.model ||
        displaySetting !== report.displaySetting ||
        description !== (report.description ?? '')),
  );
  const { confirmLeave } = useUnsavedChanges(dirty && !submitting);

  useEffect(() => {
    void deviceReportApi.listManufacturers().then(setManufacturers).catch(() => setManufacturers([]));
  }, []);

  useEffect(() => {
    void deviceReportApi.listModels(manufacturerMode === DIRECT_INPUT_VALUE ? undefined : manufacturerMode)
      .then(setModels)
      .catch(() => setModels([]));
  }, [manufacturerMode]);

  useEffect(() => {
    if (!deviceReportId) {
      setError('디바이스 정보를 찾을 수 없습니다.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    void deviceReportApi.getReport(deviceReportId)
      .then((nextReport) => {
        setReport(nextReport);
        setManufacturerMode(DIRECT_INPUT_VALUE);
        setModelMode(DIRECT_INPUT_VALUE);
        setManufacturerInput(nextReport.manufacturer);
        setModelInput(nextReport.model);
        setDisplaySetting(nextReport.displaySetting);
        setDescription(nextReport.description ?? '');
      })
      .catch((loadError) => setError(getUserMessage(loadError)))
      .finally(() => setLoading(false));
  }, [deviceReportId]);

  useEffect(() => {
    if (iosDevice) {
      setDisplaySetting(0);
    }
  }, [iosDevice]);

  const handleCancel = async () => {
    if (await confirmLeave()) {
      navigate(`${DEVICE_INFO_PATH}/${deviceReportId}`);
    }
  };

  const handleManufacturerChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setManufacturerMode(event.target.value);
    setModelMode(DIRECT_INPUT_VALUE);
    setModelInput('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!manufacturer || !model) {
      toast('제조사와 모델을 입력해주세요.', { tone: 'warning' });
      return;
    }

    setSubmitting(true);

    try {
      const nextReport = await deviceReportApi.updateReport({
        reportId: deviceReportId,
        manufacturer,
        model,
        displaySetting: iosDevice ? 0 : displaySetting,
        description,
      });

      toast('디바이스 정보를 수정했습니다.', { tone: 'success' });
      navigate(`${DEVICE_INFO_PATH}/${nextReport.id}`, { replace: true });
    } catch (submitError) {
      toast(getUserMessage(submitError), { tone: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <section className="container write-page">디바이스 정보를 불러오고 있습니다.</section>;
  }

  if (error || !report) {
    return (
      <section className="container write-page">
        <p className="board-page__message">{error ?? '디바이스 정보를 찾을 수 없습니다.'}</p>
        <Link className="button-link" to={DEVICE_INFO_PATH}>
          목록으로
        </Link>
      </section>
    );
  }

  if (!canEditAuthoredRecord(report, user)) {
    return (
      <section className="container write-page">
        <p className="board-page__message">수정 권한이 없습니다.</p>
        <Link className="button-link" to={`${DEVICE_INFO_PATH}/${report.id}`}>
          상세로
        </Link>
      </section>
    );
  }

  return (
    <section className="container write-page device-write">
      <header className="write-page__header">
        <span className="board-page__eyebrow">디바이스정보</span>
        <h2>디바이스정보 수정</h2>
        <p>측정값은 작성 당시 값으로 보존하고, 식별 정보와 설명을 수정합니다.</p>
      </header>

      <form className="write-page__form" onSubmit={handleSubmit}>
        <Select label="제조사" value={manufacturerMode} onChange={handleManufacturerChange} options={toOptions(manufacturers)} />
        {manufacturerMode === DIRECT_INPUT_VALUE ? (
          <Input
            label="제조사 직접입력"
            value={manufacturerInput}
            onChange={(event) => setManufacturerInput(event.target.value)}
            required
          />
        ) : null}

        <Select label="모델" value={modelMode} onChange={(event) => setModelMode(event.target.value)} options={toOptions(models)} />
        {modelMode === DIRECT_INPUT_VALUE ? (
          <Input label="모델 직접입력" value={modelInput} onChange={(event) => setModelInput(event.target.value)} required />
        ) : null}

        <section className="device-measure" aria-label="저장된 측정값">
          <div className="device-measure__item">
            <span>스크린 사이즈</span>
            <strong>{formatScreenSize(report)}</strong>
          </div>
          <div className="device-measure__item">
            <span>윈도우 사이즈</span>
            <strong>{formatWindowSize(report)}</strong>
          </div>
          <div className="device-measure__item">
            <span>ratio</span>
            <strong>{report.devicePixelRatio}</strong>
          </div>
          <div className="device-measure__item">
            <span>스크린방향</span>
            <strong>{getOrientationLabel(report.orientation)}</strong>
          </div>
        </section>

        <Input label="userAgent" value={report.userAgent} readOnly />
        <Input
          label="디스플레이설정"
          type="number"
          min={iosDevice ? 0 : 1}
          value={displaySetting}
          disabled={iosDevice}
          onChange={(event) => setDisplaySetting(Number(event.target.value || 0))}
          description="Android 설정의 화면 크기/표시 크기 단계 기준입니다. 가장 왼쪽을 1로 보고 현재 단계를 입력합니다. iPhone은 0으로 고정됩니다."
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
  );
};

export default DeviceInfoEdit;
