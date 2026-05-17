import { createCrudApi } from './createCrudApi';
import { PB_COLLECTIONS } from '@/constants/pocketbaseCollections';

export const reportApi = createCrudApi(PB_COLLECTIONS.reports);
