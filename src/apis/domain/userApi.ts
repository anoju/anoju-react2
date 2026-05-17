import { createCrudApi } from './createCrudApi';
import { PB_COLLECTIONS } from '@/constants/pocketbaseCollections';

export const userApi = createCrudApi(PB_COLLECTIONS.users);
