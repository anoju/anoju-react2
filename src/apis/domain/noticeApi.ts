import { createCrudApi } from './createCrudApi';
import { PB_COLLECTIONS } from '@/constants/pocketbaseCollections';

export const noticeApi = createCrudApi(PB_COLLECTIONS.notices);
