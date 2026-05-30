import { toast } from '@/components/feedback';
import { createClientId } from '@/utils/id';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const BOARD_ATTACHMENT_TYPES = [
  'application/pdf',
  'text/plain',
  'text/markdown',
  'text/csv',
  'application/zip',
  'application/x-zip-compressed',
  'application/x-7z-compressed',
  'application/vnd.rar',
  'application/x-rar-compressed',
  'application/gzip',
  'application/x-tar',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/haansofthwp',
  'application/x-hwp',
];

export const BOARD_ATTACHMENT_MAX_COUNT = 3;
export const BOARD_ATTACHMENT_ACCEPT =
  '.pdf,.txt,.md,.csv,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.hwp,.hwpx,.zip,.7z,.rar,.tar,.gz';

const BOARD_ATTACHMENT_EXTENSIONS = BOARD_ATTACHMENT_ACCEPT.split(',');

const MB = 1024 * 1024;

export const UPLOAD_LIMITS = {
  profileImage: 2 * MB,
  postImage: 5 * MB,
  clipVideo: 300 * MB,
  clipPoster: 5 * MB,
  boardAttachment: 10 * MB,
} as const;

export interface UploadPreview {
  id: string;
  file: File;
  url: string;
  sortOrder: number;
  isCover: boolean;
  alt: string;
}

export interface FileAttachmentPreview {
  id: string;
  file: File;
  name: string;
  size: number;
  extension: string;
}

export interface VideoUploadPreview {
  id: string;
  file: File;
  url: string;
  name: string;
  size: number;
  duration: number;
  width: number;
  height: number;
}

export interface VideoUploadOptions {
  maxSize?: number;
  maxDurationSeconds?: number;
  maxLongSide?: number;
  maxShortSide?: number;
  resolutionLabel?: string;
  transformToFit?: boolean;
}

export const VIDEO_UPLOAD_PROFILES = {
  clips: {
    maxSize: UPLOAD_LIMITS.clipVideo,
    maxDurationSeconds: 30,
    maxLongSide: 1280,
    maxShortSide: 720,
    resolutionLabel: '720p',
    transformToFit: true,
  },
} as const satisfies Record<string, VideoUploadOptions>;

export const validateImageFile = (file: File, maxSize: number) => {
  if (!IMAGE_TYPES.includes(file.type)) {
    return 'jpg, png, webp 형식의 이미지만 업로드할 수 있습니다.';
  }

  if (file.size > maxSize) {
    return `이미지는 ${Math.floor(maxSize / MB)}MB 이하로 업로드해주세요.`;
  }

  return null;
};

export const createUploadPreviews = (files: File[], maxSize = UPLOAD_LIMITS.postImage): UploadPreview[] => {
  const previews: UploadPreview[] = [];

  files.forEach((file, index) => {
    const error = validateImageFile(file, maxSize);

    if (error) {
      toast(error, { tone: 'danger' });
      return;
    }

    previews.push({
      id: createClientId('upload'),
      file,
      url: URL.createObjectURL(file),
      sortOrder: index,
      isCover: index === 0,
      alt: file.name,
    });
  });

  return previews;
};

export const validateVideoFile = (file: File, maxSize = UPLOAD_LIMITS.clipVideo) => {
  if (!VIDEO_TYPES.includes(file.type)) {
    return 'mp4, webm, mov 형식의 동영상만 업로드할 수 있습니다.';
  }

  if (file.size > maxSize) {
    return `동영상은 ${Math.floor(maxSize / MB)}MB 이하로 업로드해주세요.`;
  }

  return null;
};

const loadVideoMetadata = (url: string) =>
  new Promise<{ duration: number; width: number; height: number }>((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    video.src = url;

    video.onloadedmetadata = () => {
      resolve({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
      });
    };
    video.onerror = () => reject(new Error('동영상 정보를 불러오지 못했습니다.'));
  });

const validateVideoMetadata = (
  metadata: { duration: number; width: number; height: number },
  { maxDurationSeconds, maxLongSide, maxShortSide, resolutionLabel, transformToFit }: VideoUploadOptions,
) => {
  if (maxDurationSeconds && metadata.duration > maxDurationSeconds) {
    if (transformToFit) {
      return null;
    }

    return `동영상은 ${maxDurationSeconds}초 이하로 업로드해주세요.`;
  }

  const longSide = Math.max(metadata.width, metadata.height);
  const shortSide = Math.min(metadata.width, metadata.height);

  if (transformToFit) {
    return null;
  }

  if (maxLongSide && longSide > maxLongSide) {
    return `동영상 해상도는 최대 ${resolutionLabel ?? `${maxLongSide}px`}까지 업로드할 수 있습니다.`;
  }

  if (maxShortSide && shortSide > maxShortSide) {
    return `동영상 해상도는 최대 ${resolutionLabel ?? `${maxShortSide}px`}까지 업로드할 수 있습니다.`;
  }

  return null;
};

export const formatVideoDuration = (duration: number) => {
  if (!Number.isFinite(duration)) {
    return '0:00';
  }

  const totalSeconds = Math.max(0, Math.round(duration));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

export const createVideoUploadPreview = async (
  file: File,
  options: VideoUploadOptions = VIDEO_UPLOAD_PROFILES.clips,
): Promise<VideoUploadPreview | null> => {
  const error = validateVideoFile(file, options.maxSize);

  if (error) {
    toast(error, { tone: 'danger' });
    return null;
  }

  const url = URL.createObjectURL(file);

  try {
    const metadata = await loadVideoMetadata(url);
    const metadataError = validateVideoMetadata(metadata, options);

    if (metadataError) {
      URL.revokeObjectURL(url);
      toast(metadataError, { tone: 'danger' });
      return null;
    }

    return {
      id: createClientId('clip-video'),
      file,
      url,
      name: file.name,
      size: file.size,
      duration: metadata.duration,
      width: metadata.width,
      height: metadata.height,
    };
  } catch (loadError) {
    URL.revokeObjectURL(url);
    toast(loadError instanceof Error ? loadError.message : '동영상 정보를 확인하지 못했습니다.', { tone: 'danger' });
    return null;
  }
};

export const getVideoUploadPolicyText = ({ maxDurationSeconds, resolutionLabel, transformToFit }: VideoUploadOptions) => {
  if (transformToFit) {
    return [
      maxDurationSeconds ? `${maxDurationSeconds}초 구간 선택` : '',
      resolutionLabel ? `${resolutionLabel}로 자동 변환` : '',
    ]
      .filter(Boolean)
      .join(' · ');
  }

  const parts = [
    maxDurationSeconds ? `${maxDurationSeconds}초 이하` : '',
    resolutionLabel ? `${resolutionLabel} 이하` : '',
  ].filter(Boolean);

  return parts.join(' · ');
};

export const revokeUploadPreviews = (previews: UploadPreview[]) => {
  previews.forEach((preview) => URL.revokeObjectURL(preview.url));
};

export const revokeVideoUploadPreview = (preview: VideoUploadPreview | null) => {
  if (preview) {
    URL.revokeObjectURL(preview.url);
  }
};

export const formatFileSize = (size: number) => {
  if (size < 1024) {
    return `${size}B`;
  }

  if (size < MB) {
    return `${Math.ceil(size / 1024)}KB`;
  }

  return `${(size / MB).toFixed(1)}MB`;
};

const getFileExtension = (fileName: string) => {
  const extension = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
  return extension.startsWith('.') ? extension : '';
};

export const validateBoardAttachmentFile = (file: File, maxSize = UPLOAD_LIMITS.boardAttachment) => {
  const extension = getFileExtension(file.name);

  if (!BOARD_ATTACHMENT_TYPES.includes(file.type) && !BOARD_ATTACHMENT_EXTENSIONS.includes(extension)) {
    return '문서, 텍스트, 표, 프레젠테이션, 압축 파일만 첨부할 수 있습니다.';
  }

  if (file.size > maxSize) {
    return `첨부파일은 ${Math.floor(maxSize / MB)}MB 이하로 업로드해주세요.`;
  }

  return null;
};

export const createFileAttachmentPreviews = (
  files: File[],
  currentCount = 0,
  maxCount = BOARD_ATTACHMENT_MAX_COUNT,
): FileAttachmentPreview[] => {
  const previews: FileAttachmentPreview[] = [];

  files.forEach((file) => {
    if (currentCount + previews.length >= maxCount) {
      toast(`첨부파일은 최대 ${maxCount}개까지 추가할 수 있습니다.`, { tone: 'warning' });
      return;
    }

    const error = validateBoardAttachmentFile(file);

    if (error) {
      toast(error, { tone: 'danger' });
      return;
    }

    previews.push({
      id: createClientId('attachment'),
      file,
      name: file.name,
      size: file.size,
      extension: getFileExtension(file.name).replace('.', '').toUpperCase(),
    });
  });

  return previews;
};
