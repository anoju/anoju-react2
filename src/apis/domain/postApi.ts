import { createCrudApi } from './createCrudApi';
import { PB_COLLECTIONS } from '@/constants/pocketbaseCollections';

export const postApi = createCrudApi(PB_COLLECTIONS.posts);
