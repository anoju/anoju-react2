import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, FixedBottomActions, Input, Select, TextArea, toast } from '@/components';
import { deviceReportApi, getUserMessage } from '@/apis';
import { DEVICE_INFO_PATH } from '@/constants/app';
import type { SelectOption } from '@/components';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import {
  DIRECT_INPUT_VALUE,
  formatScreenSize,
  formatWindowSize,
  getCurrentDeviceSnapshot,
  getOrientationLabel,
  isIosUserAgent,
} from '../utils';

const toOptions = (values: string[]): SelectOption[] => [
  ...values.map((value) => ({ value, label: value })),
  { value: DIRECT_INPUT_VALUE, label: '직접 입력' },
];

const DeviceInfoWrite = () => {
  const navigate = useNavigate();
  const initialSnapshot = useMemo(() => getCurrentDeviceSnapshot(), []);
  const [manufacturers, setManufacturers] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [manufacturerMode, setManufacturerMode] = useState(DIRECT_INPUT_VALUE);
  const [modelMode, setModelMode] = useState(DIRECT_INPUT_VALUE);
  const [manufacturerInput, setManufacturerInput] = useState('');
  const [modelInput, setModelInput] = useState('');
  const [description, setDescription] = useState('');
  const [screenWidth, setScreenWidth] = useState(initialSnapshot.screenWidth);
  const [screenHeight, setScreenHeight] = useState(initialSnapshot.screenHeight);
  const [windowWidthMin, setWindowWidthMin] = useState(initialSnapshot.windowWidth);
  const [windowWidthMax, setWindowWidthMax] = useState(initialSnapshot.windowWidth);
  const [windowHeightMin, setWindowHeightMin] = useState(initialSnapshot.windowHeight);
  const [windowHeightMax, setWindowHeightMax] = useState(initialSnapshot.windowHeight);
  const [devicePixelRatio, setDevicePixelRatio] = useState(initialSnapshot.devicePixelRatio);
  const [orientation, setOrientation] = useState(initialSnapshot.orientation);
  const [userAgent, setUserAgent] = useState(initialSnapshot.userAgent);
  const [displaySetting, setDisplaySetting] = useState(isIosUserAgent(initialSnapshot.userAgent) ? 0 : 1);
  const [submitting, setSubmitting] = useState(false);
  const iosDevice = isIosUserAgent(userAgent);
  const manufacturer = manufacturerMode === DIRECT_INPUT_VALUE ? manufacturerInput.trim() : manufacturerMode;
  const model = modelMode === DIRECT_INPUT_VALUE ? modelInput.trim() : modelMode;
  const dirty = Boolean(manufacturer || model || description.trim());
  const { confirmLeave } = useUnsavedChanges(dirty && !submitting);

  const measuredReport = {
    screenWidth,
    screenHeight,
    windowWidthMin,
    windowWidthMax,
    windowHeightMin,
    windowHeightMax,
  };

  useEffect(() => {
    void deviceReportApi.listManufacturers().then(setManufacturers).catch(() => setManufacturers([]));
  }, []);

  useEffect(() => {
    void deviceReportApi.listModels(manufacturerMode === DIRECT_INPUT_VALUE ? undefined : manufacturerMode)
      .then(setModels)
      .catch(() => setModels([]));
  }, [manufacturerMode]);

  useEffect(() => {
    const updateMeasurement = () => {
      const snapshot = getCurrentDeviceSnapshot();

      setScreenWidth(snapshot.screenWidth);
      setScreenHeight(snapshot.screenHeight);
      setWindowWidthMin((current) => Math.min(current || snapshot.windowWidth, snapshot.windowWidth));
      setWindowWidthMax((current) => Math.max(current || snapshot.windowWidth, snapshot.windowWidth));
      setWindowHeightMin((current) => Math.min(current || snapshot.windowHeight, snapshot.windowHeight));
      setWindowHeightMax((current) => Math.max(current || snapshot.windowHeight, snapshot.windowHeight));
      setDevicePixelRatio(snapshot.devicePixelRatio);
      setOrientation(snapshot.orientation);
      setUserAgent(snapshot.userAgent);
    };

    window.addEventListener('resize', updateMeasurement);
    window.addEventListener('orientationchange', updateMeasurement);

    return () => {
      window.removeEventListener('resize', updateMeasurement);
      window.removeEventListener('orientationchange', updateMeasurement);
    };
  }, []);

  useEffect(() => {
    if (iosDevice) {
      setDisplaySetting(0);
    }
  }, [iosDevice]);

  const handleCancel = async () => {
    if (await confirmLeave()) {
      navigate(DEVICE_INFO_PATH);
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
      const report = await deviceReportApi.createReport({
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
      });

      toast('디바이스 정보를 등록했습니다.', { tone: 'success' });
      navigate(`${DEVICE_INFO_PATH}/${report.id}`, { replace: true });
    } catch (error) {
      toast(getUserMessage(error), { tone: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container write-page device-write">
      <header className="write-page__header">
        <span className="board-page__eyebrow">디바이스정보</span>
        <h2>디바이스정보 작성</h2>
        <p>현재 브라우저에서 확인한 웹 해상도를 자동으로 기록합니다.</p>
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
            placeholder="예: Samsung, Apple"
            required
          />
        ) : null}

        <Select label="모델" value={modelMode} onChange={(event) => setModelMode(event.target.value)} options={toOptions(models)} />
        {modelMode === DIRECT_INPUT_VALUE ? (
          <Input
            label="모델 직접입력"
            value={modelInput}
            onChange={(event) => setModelInput(event.target.value)}
            placeholder="예: Galaxy S24, iPhone 15"
            required
          />
        ) : null}

        <section className="device-measure" aria-label="자동 측정값">
          <div className="device-measure__item">
            <span>스크린 사이즈</span>
            <strong>{formatScreenSize(measuredReport)}</strong>
          </div>
          <div className="device-measure__item">
            <span>윈도우 사이즈</span>
            <strong>{formatWindowSize(measuredReport)}</strong>
          </div>
          <div className="device-measure__item">
            <span>ratio</span>
            <strong>{devicePixelRatio}</strong>
          </div>
          <div className="device-measure__item">
            <span>스크린방향</span>
            <strong>{getOrientationLabel(orientation)}</strong>
          </div>
        </section>

        <Input label="userAgent" value={userAgent} readOnly />
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
          placeholder="브라우저 상태, 주소창 노출 여부처럼 함께 보면 좋은 내용을 적어주세요."
        />

        <FixedBottomActions>
          <Button type="button" variant="outline" tone="neutral" onClick={handleCancel}>
            취소
          </Button>
          <Button type="submit" loading={submitting}>
            등록
          </Button>
        </FixedBottomActions>
      </form>
    </section>
  );
};

export default DeviceInfoWrite;
