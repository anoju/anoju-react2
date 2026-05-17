import { createCrudApi } from './createCrudApi';
import { PB_COLLECTIONS } from '@/constants/pocketbaseCollections';

export const reactionApi = createCrudApi(PB_COLLECTIONS.reactions);
