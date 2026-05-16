import { toast } from '@/components/feedback';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const MB = 1024 * 1024;

export const UPLOAD_LIMITS = {
  profileImage: 2 * MB,
  postImage: 5 * MB,
} as const;

export interface UploadPreview {
  id: string;
  file: File;
  url: string;
  sortOrder: number;
  isCover: boolean;
  alt: string;
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
      id: crypto.randomUUID(),
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
