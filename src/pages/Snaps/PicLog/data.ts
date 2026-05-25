import { pb } from '@/lib/pocketBase';
import type {
  PicLogEntryRecord,
  PicLogOrderRequestRecord,
  PicLogRecord,
  PicLogVisibility,
  UserRecord,
} from '@/types/domain';

export interface PicLogUser {
  id: string;
  name: string;
  nickname: string;
  avatarUrl?: string;
}

export interface PicLogBundle {
  log: PicLogRecord;
  entries: PicLogEntryRecord[];
  participants: PicLogUser[];
  orderRequests: PicLogOrderRequestRecord[];
}

export const PIC_LOG_TIME_CHAPTERS = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
  '22:00',
] as const;

export const PIC_LOG_MAX_LOOKBACK_DAYS = 14;

export const PIC_LOG_DEFAULT_VISIBILITY: PicLogVisibility = 'invited';

const DAY_MS = 24 * 60 * 60 * 1000;

export const getDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const getPicLogMinDate = () =>
  getDateKey(new Date(Date.now() - (PIC_LOG_MAX_LOOKBACK_DAYS - 1) * DAY_MS));

export const formatPicLogDate = (dateKey: string) => {
  const [year, month, day] = dateKey.split('-');

  return `${year}년 ${Number(month)}월 ${Number(day)}일`;
};

export const getChapterLabel = (chapter: string) => `${Number(chapter.slice(0, 2))}시`;

export const getCurrentPicLogChapter = (date = new Date()) => {
  const hour = date.getHours();

  if (hour < 8 || hour >= 22) {
    return '22:00';
  }

  const chapter = `${String(hour).padStart(2, '0')}:00`;

  return (PIC_LOG_TIME_CHAPTERS as readonly string[]).includes(chapter) ? chapter : '';
};

export const getVisibilityLabel = (visibility: PicLogVisibility) => {
  if (visibility === 'private') return '나만 보기';
  if (visibility === 'link') return '링크 공개';
  if (visibility === 'public') return '전체 공개';

  return '초대된 친구만';
};

export const getPicLogEntryImageUrl = (entry: PicLogEntryRecord) =>
  entry.image ? pb.files.getURL(entry, entry.image) : '';

export const getExpandedUser = (record: { expand?: Record<string, unknown> }, key: string): UserRecord | undefined => {
  const expandedValue = record.expand?.[key];

  if (!expandedValue || Array.isArray(expandedValue)) {
    return undefined;
  }

  return expandedValue as UserRecord;
};

export const getExpandedUsers = (record: { expand?: Record<string, unknown> }, key: string): UserRecord[] => {
  const expandedValue = record.expand?.[key];

  if (!Array.isArray(expandedValue)) {
    return [];
  }

  return expandedValue as UserRecord[];
};

export const toPicLogUser = (user: UserRecord): PicLogUser => ({
  id: user.id,
  name: user.nickname || user.email || '참여자',
  nickname: user.nickname || user.email || user.id,
  avatarUrl: user.avatar ? pb.files.getURL(user, user.avatar) : undefined,
});

export const getParticipantsFromLog = (log: PicLogRecord): PicLogUser[] => {
  const expandedUsers = getExpandedUsers(log, 'participants').map(toPicLogUser);

  if (expandedUsers.length > 0) {
    return expandedUsers;
  }

  return log.participants.map((participantId) => ({
    id: participantId,
    name: '참여자',
    nickname: participantId,
  }));
};

export const getPicLogParticipant = (participants: PicLogUser[], userId: string) =>
  participants.find((participant) => participant.id === userId);

export const getVisiblePicLogDates = (entries: PicLogEntryRecord[], fallbackDate?: string) => {
  const minDate = getPicLogMinDate();
  const entryDates = entries
    .filter((entry) => !entry.deleted && entry.logDate >= minDate)
    .map((entry) => entry.logDate);
  const dates = Array.from(
    new Set(
      [
        ...entryDates,
        ...(fallbackDate && fallbackDate >= minDate ? [fallbackDate] : []),
      ],
    ),
  );

  return dates.sort((a, b) => b.localeCompare(a));
};

export const getVisibleChapters = (entries: PicLogEntryRecord[], dateKey: string) =>
  PIC_LOG_TIME_CHAPTERS.filter((chapter) =>
    entries.some((entry) => !entry.deleted && entry.logDate === dateKey && entry.chapter === chapter),
  );

export const sortEntriesByParticipantOrder = (entries: PicLogEntryRecord[], participantOrder: string[]) =>
  [...entries].sort((a, b) => {
    const orderA = participantOrder.indexOf(a.author);
    const orderB = participantOrder.indexOf(b.author);
    const resolvedA = orderA === -1 ? Number.MAX_SAFE_INTEGER : orderA;
    const resolvedB = orderB === -1 ? Number.MAX_SAFE_INTEGER : orderB;

    if (resolvedA !== resolvedB) {
      return resolvedA - resolvedB;
    }

    return a.created.localeCompare(b.created);
  });
