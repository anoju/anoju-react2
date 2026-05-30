export type TimedVideoRecorderStatus =
  | 'idle'
  | 'requesting'
  | 'ready'
  | 'recording'
  | 'recorded'
  | 'unsupported'
  | 'error';

export interface TimedVideoResult {
  blob: Blob;
  mimeType: string;
  objectUrl: string;
  durationMs: number;
  fileName: string;
}

