import type { PostImageRecord, UserRecord } from '@/types/domain';
import { communityApi } from '@/apis/domain';
import { pb } from '@/lib/pocketBase';

export interface ContentPart {
  type: 'text' | 'image';
  key: string;
  text?: string;
  image?: PostImageRecord;
}

const IMAGE_TOKEN_PATTERN = /\[\[image:([a-zA-Z0-9_-]+)\]\]/g;

export const getRecordAuthorName = (record: { expand?: Record<string, unknown>; author?: string }) => {
  const author = getRecordAuthor(record);

  if (author) {
    const name = author.name ?? author.nickname ?? author.email;

    if (typeof name === 'string' && name.trim()) {
      return name;
    }
  }

  return '익명 회원';
};

export const getRecordAuthor = (record: { expand?: Record<string, unknown>; author?: string }) => {
  const author = record.expand?.author;

  if (!author || typeof author !== 'object' || Array.isArray(author)) {
    return null;
  }

  return author as UserRecord;
};

export const getRecordAuthorAvatarUrl = (record: { expand?: Record<string, unknown>; author?: string }) => {
  const author = getRecordAuthor(record);

  if (!author?.avatar) {
    return undefined;
  }

  return pb.files.getURL(author, author.avatar);
};

export const formatDate = (date?: string) => {
  if (!date) return '';

  return new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const formatRelativeTime = (date?: string) => {
  if (!date) {
    return '';
  }

  const time = Date.parse(date);

  if (Number.isNaN(time)) {
    return '';
  }

  const diffSeconds = Math.max(0, Math.floor((Date.now() - time) / 1000));

  if (diffSeconds < 60) {
    return '방금 전';
  }

  const diffMinutes = Math.floor(diffSeconds / 60);

  if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}시간 전`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays < 7) {
    return `${diffDays}일 전`;
  }

  return formatDate(date);
};

const getRecordCreated = (record: unknown) => {
  if (!record || typeof record !== 'object' || !('created' in record)) {
    return undefined;
  }

  const created = record.created;

  return typeof created === 'string' ? created : undefined;
};

const getDateTime = (date?: string) => {
  if (!date) {
    return 0;
  }

  const time = Date.parse(date);

  return Number.isNaN(time) ? 0 : time;
};

export const compareByCreatedDesc = (a: unknown, b: unknown) =>
  getDateTime(getRecordCreated(b)) - getDateTime(getRecordCreated(a));

export const compareByCreatedAsc = (a: unknown, b: unknown) =>
  getDateTime(getRecordCreated(a)) - getDateTime(getRecordCreated(b));

export const createContentParts = (content: string, images: PostImageRecord[]): ContentPart[] => {
  const imageMap = new Map(images.map((image) => [image.id, image]));
  const parts: ContentPart[] = [];
  let lastIndex = 0;

  content.replace(IMAGE_TOKEN_PATTERN, (token, imageId: string, index: number) => {
    if (index > lastIndex) {
      parts.push({
        type: 'text',
        key: `text-${lastIndex}`,
        text: content.slice(lastIndex, index),
      });
    }

    const image = imageMap.get(imageId);

    if (image) {
      parts.push({
        type: 'image',
        key: `image-${image.id}`,
        image,
      });
    } else {
      parts.push({
        type: 'text',
        key: `missing-${imageId}`,
        text: token,
      });
    }

    lastIndex = index + token.length;
    return token;
  });

  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      key: `text-${lastIndex}`,
      text: content.slice(lastIndex),
    });
  }

  return parts.length > 0 ? parts : [{ type: 'text', key: 'empty', text: content }];
};

export const getPostImageUrl = (image?: PostImageRecord) => (image ? communityApi.getImageUrl(image) : '');
