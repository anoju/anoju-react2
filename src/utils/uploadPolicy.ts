import { toast } from '@/components/feedback';
import { createClientId } from '@/utils/id';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
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

export const revokeUploadPreviews = (previews: UploadPreview[]) => {
  previews.forEach((preview) => URL.revokeObjectURL(preview.url));
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
