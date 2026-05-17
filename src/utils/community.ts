import type { PostImageRecord } from '@/types/domain';
import { communityApi } from '@/apis/domain';

export interface ContentPart {
  type: 'text' | 'image';
  key: string;
  text?: string;
  image?: PostImageRecord;
}

const IMAGE_TOKEN_PATTERN = /\[\[image:([a-zA-Z0-9_-]+)\]\]/g;

export const getRecordAuthorName = (record: { expand?: Record<string, unknown>; author?: string }) => {
  const author = record.expand?.author;

  if (author && typeof author === 'object' && !Array.isArray(author)) {
    const authorRecord = author as Record<string, unknown>;
    const name = authorRecord.name ?? authorRecord.nickname ?? authorRecord.email;

    if (typeof name === 'string' && name.trim()) {
      return name;
    }
  }

  return '익명 회원';
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
