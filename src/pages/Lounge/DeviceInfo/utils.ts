import type { DeviceOrientation, DeviceReportRecord } from '@/types/domain';

export const DIRECT_INPUT_VALUE = '__direct__';

export const getDeviceOrientation = (): DeviceOrientation => {
  if (typeof window === 'undefined') {
    return 'portrait';
  }

  return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
};

export const getOrientationLabel = (orientation: DeviceOrientation) => (orientation === 'landscape' ? '가로' : '세로');

export const formatScreenSize = (report: Pick<DeviceReportRecord, 'screenWidth' | 'screenHeight'>) =>
  `${report.screenWidth} x ${report.screenHeight}`;

export const formatWindowSize = (
  report: Pick<DeviceReportRecord, 'windowWidthMin' | 'windowWidthMax' | 'windowHeightMin' | 'windowHeightMax'>,
) => {
  const width =
    report.windowWidthMin === report.windowWidthMax
      ? `${report.windowWidthMin}`
      : `${report.windowWidthMin}-${report.windowWidthMax}`;
  const height =
    report.windowHeightMin === report.windowHeightMax
      ? `${report.windowHeightMin}`
      : `${report.windowHeightMin}-${report.windowHeightMax}`;

  return `${width} x ${height}`;
};

export const getCurrentDeviceSnapshot = () => {
  if (typeof window === 'undefined') {
    return {
      screenWidth: 0,
      screenHeight: 0,
      windowWidth: 0,
      windowHeight: 0,
      devicePixelRatio: 1,
      orientation: 'portrait' as DeviceOrientation,
      userAgent: '',
    };
  }

  return {
    screenWidth: Math.round(window.screen.width),
    screenHeight: Math.round(window.screen.height),
    windowWidth: Math.round(window.innerWidth),
    windowHeight: Math.round(window.innerHeight),
    devicePixelRatio: Number((window.devicePixelRatio || 1).toFixed(3)),
    orientation: getDeviceOrientation(),
    userAgent: navigator.userAgent,
  };
};

export const isIosUserAgent = (userAgent: string) => /iPad|iPhone|iPod/i.test(userAgent);
