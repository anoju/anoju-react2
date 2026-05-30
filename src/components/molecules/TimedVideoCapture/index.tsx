import { Camera, ImagePlus, RotateCcw, Square, Video, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button, IconButton } from '@/components/atoms';
import { BottomSheet } from '@/components/feedback';
import { useTimedVideoRecorder } from '@/hooks/useTimedVideoRecorder';
import type { TimedVideoResult } from '@/types/mediaCapture';

interface TimedVideoCaptureProps {
  label?: string;
  durationMs?: number;
  onChange?: (result: TimedVideoResult | null) => void;
}

export const TimedVideoCapture = ({ label = '5초 순간 영상', durationMs = 5000, onChange }: TimedVideoCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCaptureOpen, setIsCaptureOpen] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [fallbackResult, setFallbackResult] = useState<TimedVideoResult | null>(null);
  const { status, stream, result: recorderResult, errorMessage, isSupported, requestCamera, startRecording, stopRecording, reset } =
    useTimedVideoRecorder({ durationMs });
  const result = recorderResult ?? fallbackResult;
  const isBusy = status === 'requesting' || status === 'recording';
  const shouldShowGuide = !result && status === 'error';

  useEffect(() => {
    if (!videoRef.current) return;

    // live preview는 src가 아니라 srcObject로 연결해야 권한을 받은 카메라 stream을 바로 볼 수 있습니다.
    videoRef.current.srcObject = stream;
  }, [stream]);

  useEffect(() => {
    onChange?.(result);
  }, [onChange, result]);

  const handleOpenPicker = () => {
    setIsPickerOpen(true);
  };

  const handleSelectCamera = async () => {
    setIsPickerOpen(false);
    setIsCaptureOpen(true);
    const nextStream = await requestCamera();

    if (!nextStream) {
      setIsCaptureOpen(false);
    }
  };

  const handleSelectAlbum = () => {
    setIsPickerOpen(false);
    fileInputRef.current?.click();
  };

  const handleCloseCapture = () => {
    stopRecording();
    setIsCaptureOpen(false);
  };

  const handleReset = () => {
    reset();
    if (fallbackResult?.objectUrl) {
      URL.revokeObjectURL(fallbackResult.objectUrl);
    }
    setFallbackResult(null);
    onChange?.(null);
    setIsCaptureOpen(false);
    setIsPickerOpen(false);
  };

  const handleFallbackFileChange = () => {
    const file = fileInputRef.current?.files?.[0];

    if (!file) return;

    const objectUrl = URL.createObjectURL(file);

    if (fallbackResult?.objectUrl) {
      URL.revokeObjectURL(fallbackResult.objectUrl);
    }

    setFallbackResult({
      blob: file,
      objectUrl,
      durationMs,
      mimeType: file.type,
      fileName: file.name,
    });
  };

  useEffect(() => {
    return () => {
      if (fallbackResult?.objectUrl) {
        URL.revokeObjectURL(fallbackResult.objectUrl);
      }
    };
  }, [fallbackResult]);

  return (
    <div className="timed-video-capture" data-state={status}>
      <div className="timed-video-capture__box">
        {result ? (
          <>
            <video className="timed-video-capture__video" src={result.objectUrl} controls playsInline />
            <IconButton
              className="timed-video-capture__reset"
              label="영상 다시 촬영"
              icon={<RotateCcw size={18} />}
              size="sm"
              variant="solid"
              tone="neutral"
              onClick={handleReset}
            />
          </>
        ) : isCaptureOpen ? (
          <div className="timed-video-capture__camera">
            <video ref={videoRef} className="timed-video-capture__video" autoPlay muted playsInline />
            <IconButton
              className="timed-video-capture__close"
              label="촬영 닫기"
              icon={<X size={18} />}
              size="sm"
              variant="solid"
              tone="neutral"
              onClick={handleCloseCapture}
            />
            <div className="timed-video-capture__controls">
              {status === 'recording' ? (
                <Button size="sm" tone="danger" leftIcon={<Square size={16} />} onClick={stopRecording}>
                  촬영 중지
                </Button>
              ) : (
                <Button size="sm" leftIcon={<Video size={16} />} loading={status === 'requesting'} disabled={isBusy} onClick={startRecording}>
                  5초 촬영
                </Button>
              )}
            </div>
          </div>
        ) : (
          <button type="button" className="timed-video-capture__add" onClick={handleOpenPicker}>
            <span aria-hidden="true">+</span>
            <strong>{label}</strong>
          </button>
        )}
      </div>

      <div className="timed-video-capture__meta" aria-live="polite">
        {status === 'recording' ? <p>최대 5초 동안 촬영합니다.</p> : null}
        {shouldShowGuide ? (
          <div className="timed-video-capture__guide" role="alert">
            <span className="timed-video-capture__guide-icon" aria-hidden="true">
              <Camera size={22} />
            </span>
            <div>
              <strong>카메라 권한이 필요합니다.</strong>
              <p>{errorMessage || '브라우저 권한 설정에서 카메라와 마이크를 허용한 뒤 +를 다시 눌러주세요.'}</p>
            </div>
          </div>
        ) : null}
      </div>

      <input
        ref={fileInputRef}
        className="timed-video-capture__file"
        type="file"
        accept="video/*"
        onChange={handleFallbackFileChange}
      />

      <BottomSheet open={isPickerOpen} title="영상 추가" onClose={() => setIsPickerOpen(false)}>
        <div className="timed-video-capture__sheet">
          {isSupported ? (
            <button type="button" className="timed-video-capture__sheet-action" onClick={handleSelectCamera}>
              <Camera size={20} aria-hidden="true" />
              <span>
                <strong>카메라로 5초 촬영</strong>
                <small>권한이 필요하면 선택할 때마다 요청합니다.</small>
              </span>
            </button>
          ) : null}

          <button type="button" className="timed-video-capture__sheet-action" onClick={handleSelectAlbum}>
            <ImagePlus size={20} aria-hidden="true" />
            <span>
              <strong>앨범에서 선택</strong>
              <small>{isSupported ? '저장된 영상을 선택합니다.' : '현재 환경에서는 앨범 선택만 사용할 수 있습니다.'}</small>
            </span>
          </button>

          {!isSupported ? (
            <p className="timed-video-capture__sheet-note">이 브라우저는 자동 5초 촬영을 지원하지 않습니다.</p>
          ) : null}
        </div>
      </BottomSheet>
    </div>
  );
};
