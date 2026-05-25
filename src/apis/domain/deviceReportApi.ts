import { PB_COLLECTIONS } from '@/constants/pocketbaseCollections';
import { pb } from '@/lib/pocketBase';
import type { DeviceOrientation, DeviceReportRecord, ListParams } from '@/types/domain';
import { runApi } from '../apiClient';

const escapeFilterValue = (value: string) => value.trim().replaceAll('\\', '\\\\').replaceAll('"', '\\"');

const getPublishedFilter = (extraFilter?: string) =>
  ['status = "published"', 'deleted = false', extraFilter ? `(${extraFilter})` : ''].filter(Boolean).join(' && ');

export interface DeviceReportListParams extends ListParams {
  manufacturer?: string;
  model?: string;
  keyword?: string;
}

export interface CreateDeviceReportParams {
  manufacturer: string;
  model: string;
  screenWidth: number;
  screenHeight: number;
  windowWidthMin: number;
  windowWidthMax: number;
  windowHeightMin: number;
  windowHeightMax: number;
  devicePixelRatio: number;
  orientation: DeviceOrientation;
  userAgent: string;
  displaySetting: number;
  description?: string;
}

export interface UpdateDeviceReportParams {
  reportId: string;
  manufacturer: string;
  model: string;
  displaySetting: number;
  description?: string;
}

const createSearchFilter = ({ manufacturer, model, keyword }: DeviceReportListParams) => {
  const filters: string[] = [];

  if (manufacturer?.trim()) {
    filters.push(`manufacturer = "${escapeFilterValue(manufacturer)}"`);
  }

  if (model?.trim()) {
    filters.push(`model = "${escapeFilterValue(model)}"`);
  }

  if (keyword?.trim()) {
    const value = escapeFilterValue(keyword);
    filters.push(`manufacturer ~ "${value}" || model ~ "${value}" || description ~ "${value}" || userAgent ~ "${value}"`);
  }

  return filters.join(' && ');
};

const getUniqueValues = (items: DeviceReportRecord[], key: 'manufacturer' | 'model') =>
  Array.from(new Set(items.map((item) => item[key]?.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'ko-KR'));

export const deviceReportApi = {
  listReports: ({ page = 1, perPage = 20, manufacturer, model, keyword, sort = '-created', expand = 'author' }: DeviceReportListParams) =>
    runApi(() => {
      const options = {
        $autoCancel: false,
        filter: getPublishedFilter(createSearchFilter({ manufacturer, model, keyword })),
        expand,
        ...(sort ? { sort } : {}),
      };

      return pb.collection(PB_COLLECTIONS.deviceReports).getList<DeviceReportRecord>(page, perPage, options);
    }),

  getReport: (id: string) =>
    runApi(() =>
      pb.collection(PB_COLLECTIONS.deviceReports).getOne<DeviceReportRecord>(id, {
        $autoCancel: false,
        expand: 'author',
      }),
    ),

  createReport: (params: CreateDeviceReportParams) =>
    runApi(() => {
      const author = pb.authStore.model?.id;

      if (!author) {
        throw new Error('로그인이 필요합니다.');
      }

      return pb.collection(PB_COLLECTIONS.deviceReports).create<DeviceReportRecord>(
        {
          ...params,
          manufacturer: params.manufacturer.trim(),
          model: params.model.trim(),
          description: params.description?.trim() ?? '',
          author,
          status: 'published',
          deleted: false,
        },
        { $autoCancel: false, expand: 'author' },
      );
    }),

  updateReport: ({ reportId, manufacturer, model, displaySetting, description }: UpdateDeviceReportParams) =>
    runApi(() =>
      pb.collection(PB_COLLECTIONS.deviceReports).update<DeviceReportRecord>(
        reportId,
        {
          manufacturer: manufacturer.trim(),
          model: model.trim(),
          displaySetting,
          description: description?.trim() ?? '',
        },
        { $autoCancel: false, expand: 'author' },
      ),
    ),

  hideReport: (reportId: string) =>
    runApi(() =>
      pb.collection(PB_COLLECTIONS.deviceReports).update<DeviceReportRecord>(
        reportId,
        {
          status: 'hidden',
          deleted: true,
          deletedAt: new Date().toISOString(),
        },
        { $autoCancel: false, expand: 'author' },
      ),
    ),

  listManufacturers: () =>
    runApi(async () => {
      const items = await pb.collection(PB_COLLECTIONS.deviceReports).getFullList<DeviceReportRecord>({
        $autoCancel: false,
        filter: getPublishedFilter(),
        fields: 'manufacturer',
        sort: 'manufacturer',
      });

      return getUniqueValues(items, 'manufacturer');
    }),

  listModels: (manufacturer?: string) =>
    runApi(async () => {
      const items = await pb.collection(PB_COLLECTIONS.deviceReports).getFullList<DeviceReportRecord>({
        $autoCancel: false,
        filter: getPublishedFilter(manufacturer?.trim() ? `manufacturer = "${escapeFilterValue(manufacturer)}"` : undefined),
        fields: 'model',
        sort: 'model',
      });

      return getUniqueValues(items, 'model');
    }),
};
