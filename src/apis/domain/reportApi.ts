import { pb } from '@/lib/pocketBase';
import { PB_COLLECTIONS } from '@/constants/pocketbaseCollections';
import type { ReportRecord, ReportStatus, ReportTargetType } from '@/types/domain';
import { runApi } from '../apiClient';
import { createCrudApi } from './createCrudApi';

const reportCrudApi = createCrudApi(PB_COLLECTIONS.reports);

const reportTargetCollections: Partial<Record<ReportTargetType, string>> = {
  post: PB_COLLECTIONS.posts,
  pics: PB_COLLECTIONS.posts,
  comment: PB_COLLECTIONS.comments,
  picLog: PB_COLLECTIONS.picLogs,
  clip: PB_COLLECTIONS.clips,
  clip_comment: PB_COLLECTIONS.clipComments,
};

const getReportTargetCollection = (targetType: ReportTargetType) => reportTargetCollections[targetType];

export const reportApi = {
  ...reportCrudApi,

  listReports: ({ page = 1, perPage = 20, status, keyword }: { page?: number; perPage?: number; status?: string; keyword?: string } = {}) => {
    const filters = [
      status ? `status="${status}"` : '',
      keyword ? `(targetId~"${keyword}" || detail~"${keyword}" || adminMemo~"${keyword}")` : '',
    ].filter(Boolean);

    return runApi(async () => {
      try {
        return await pb.collection(PB_COLLECTIONS.reports).getList<ReportRecord>(page, perPage, {
          $autoCancel: false,
          filter: filters.join(' && ') || undefined,
          sort: '-created',
        });
      } catch (error) {
        if (filters.length > 0) {
          throw error;
        }

        return pb.collection(PB_COLLECTIONS.reports).getList<ReportRecord>(page, perPage, {
          $autoCancel: false,
        });
      }
    });
  },

  updateStatus: (reportId: string, payload: { status: ReportStatus; handledBy?: string; resolution?: string; adminMemo?: string }) =>
    runApi(() =>
      pb.collection(PB_COLLECTIONS.reports).update<ReportRecord>(reportId, {
        ...payload,
        handledAt: new Date().toISOString(),
      }, { $autoCancel: false }),
    ),

  hideTarget: (report: Pick<ReportRecord, 'targetType' | 'targetId'>) => {
    const collectionName = getReportTargetCollection(report.targetType);

    if (!collectionName) {
      return Promise.reject(new Error('숨김 처리할 수 없는 신고 대상입니다.'));
    }

    return runApi(() =>
      pb.collection(collectionName).update(report.targetId, {
        status: 'hidden',
        deleted: false,
      }, { $autoCancel: false }),
    );
  },

  deleteTarget: (report: Pick<ReportRecord, 'targetType' | 'targetId'>) => {
    const collectionName = getReportTargetCollection(report.targetType);

    if (!collectionName) {
      return Promise.reject(new Error('삭제할 수 없는 신고 대상입니다.'));
    }

    return runApi(() => pb.collection(collectionName).delete(report.targetId, { $autoCancel: false }));
  },
};
