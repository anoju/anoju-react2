import { createCrudApi } from './createCrudApi';
import { PB_COLLECTIONS } from '@/constants/pocketbaseCollections';

export const commentApi = createCrudApi(PB_COLLECTIONS.comments);
