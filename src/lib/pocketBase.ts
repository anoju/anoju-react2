import PocketBase from 'pocketbase';
import { appEnv } from '@/config/env';
import { authPersistenceStore } from './authPersistence';

export const pb = new PocketBase(appEnv.pocketBaseUrl, authPersistenceStore);

export const hasPocketBaseUrl = appEnv.hasPocketBaseUrl;
