import { createCrudApi } from './createCrudApi';
import { PB_COLLECTIONS } from '@/constants/pocketbaseCollections';

export const bookmarkApi = createCrudApi(PB_COLLECTIONS.bookmarks);
