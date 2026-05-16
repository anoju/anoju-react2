import type { RecordModel } from 'pocketbase';

export type AppRecord = RecordModel & {
  title?: string;
  content?: string;
  deleted?: boolean;
  deletedAt?: string;
};

export interface ListParams {
  page?: number;
  perPage?: number;
  filter?: string;
  sort?: string;
  expand?: string;
}

export type CreatePayload = Record<string, unknown> | FormData;

export type UpdatePayload = Record<string, unknown> | FormData;

export interface SearchParamsState {
  keyword: string;
  tag: string;
  sort: string;
}
