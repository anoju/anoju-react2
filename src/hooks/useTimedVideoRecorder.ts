import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { TimedVideoRecorderStatus, TimedVideoResult } from '@/types/mediaCapture';

const DEFAULT_DURATION_MS = 5000;
const VIDEO_MIME_CANDIDATES = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'];

const getSupportedMimeType = () => {
  if (typeof MediaRecorder === 'undefined') return '';

  return VIDEO_MIME_CANDIDATES.find((mimeType) => MediaRecorder.isTypeSupported(mimeType)) ?? '';
};

const createVideoFileName = () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  return `piclog-moment-${timestamp}.webm`;
};

interface UseTimedVideoRecorderOptions {
  durationMs?: number;
}

export const useTimedVideoRecorder = ({ durationMs = DEFAULT_DURATION_MS }: UseTimedVideoRecorderOptions = {}) => {
  const [status, setStatus] = useState<TimedVideoRecorderStatus>('idle');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [result, setResult] = useState<TimedVideoResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timeoutRef = useRef<number | null>(null);
  const recordStartAtRef = useRef(0);
  const resultUrlRef = useRef<string | null>(null);
  const supportedMimeType = useMemo(getSupportedMimeType, []);
  const isSupported = Boolean(
    typeof navigator !== 'undefined' &&
      typeof navigator.mediaDevices?.getUserMedia === 'function' &&
      typeof MediaRecorder !== 'undefined' &&
      supportedMimeType,
  );

  const clearRecordTimeout = useCallback(() => {
    if (timeoutRef.current === null) return;

    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }, []);

  const stopStream = useCallback(() => {
    setStream((currentStream) => {
      currentStream?.getTracks().forEach((track) => track.stop());
      return null;
    });
  }, []);

  const revokeResultUrl = useCallback(() => {
    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = null;
    }

    setResult(null);
  }, []);

  const reset = useCallback(() => {
    clearRecordTimeout();
    recorderRef.current = null;
    chunksRef.current = [];
    recordStartAtRef.current = 0;
    stopStream();
    revokeResultUrl();
    setErrorMessage('');
    setStatus(isSupported ? 'idle' : 'unsupported');
  }, [clearRecordTimeout, isSupported, revokeResultUrl, stopStream]);

  const requestCamera = useCallback(async () => {
    if (!isSupported) {
      setStatus('unsupported');
      setErrorMessage('이 브라우저에서는 5초 자동 촬영을 지원하지 않습니다.');
      return null;
    }

    setStatus('requesting');
    setErrorMessage('');

    try {
      const nextStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 720 },
          height: { ideal: 1280 },
        },
      });

      // 새 카메라를 열기 전 기존 track을 닫아 모바일에서 카메라 점유가 남지 않게 합니다.
      stopStream();
      setStream(nextStream);
      setStatus('ready');

      return nextStream;
    } catch (error) {
      const message =
        error instanceof DOMException && error.name === 'NotAllowedError'
          ? '카메라 권한이 필요합니다.'
          : '카메라를 열지 못했습니다.';

      setStatus('error');
      setErrorMessage(message);

      return null;
    }
  }, [isSupported, stopStream]);

  const startRecording = useCallback(async () => {
    const activeStream = stream ?? (await requestCamera());

    if (!activeStream || !supportedMimeType) return;

    clearRecordTimeout();
    revokeResultUrl();
    chunksRef.current = [];
    recordStartAtRef.current = Date.now();

    try {
      const recorder = new MediaRecorder(activeStream, { mimeType: supportedMimeType });
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        clearRecordTimeout();

        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || supportedMimeType });
        const objectUrl = URL.createObjectURL(blob);
        const recordedMs = Math.min(Date.now() - recordStartAtRef.current, durationMs);

        resultUrlRef.current = objectUrl;
        setResult({
          blob,
          objectUrl,
          durationMs: recordedMs,
          mimeType: blob.type,
          fileName: createVideoFileName(),
        });
        setStatus('recorded');
        stopStream();
      };

      recorder.onerror = () => {
        clearRecordTimeout();
        setStatus('error');
        setErrorMessage('영상 촬영 중 문제가 발생했습니다.');
        stopStream();
      };

      recorder.start();
      setStatus('recording');

      // picLog 순간 기록은 길이를 강하게 제한해야 하므로 타이머로 자동 종료합니다.
      timeoutRef.current = window.setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
        }
      }, durationMs);
    } catch {
      setStatus('error');
      setErrorMessage('이 기기에서 지원하는 녹화 형식을 찾지 못했습니다.');
      stopStream();
    }
  }, [clearRecordTimeout, durationMs, requestCamera, revokeResultUrl, stopStream, stream, supportedMimeType]);

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current;

    if (recorder?.state === 'recording') {
      recorder.stop();
      return;
    }

    clearRecordTimeout();
    stopStream();
    setStatus('idle');
  }, [clearRecordTimeout, stopStream]);

  useEffect(() => {
    if (!isSupported) {
      setStatus('unsupported');
    }
  }, [isSupported]);

  useEffect(() => {
    return () => {
      clearRecordTimeout();
      stopStream();
      recorderRef.current = null;

      // 미리보기 URL은 브라우저 메모리를 잡고 있으므로 언마운트 때 반드시 해제합니다.
      if (resultUrlRef.current) {
        URL.revokeObjectURL(resultUrlRef.current);
        resultUrlRef.current = null;
      }
    };
  }, [clearRecordTimeout, stopStream]);

  return {
    status,
    stream,
    result,
    errorMessage,
    isSupported,
    durationMs,
    requestCamera,
    startRecording,
    stopRecording,
    reset,
  };
};
