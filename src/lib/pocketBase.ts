import PocketBase from 'pocketbase';
import { authPersistenceStore } from './authPersistence';

const pocketBaseUrl = import.meta.env.VITE_PB_URL;

export const pb = new PocketBase(pocketBaseUrl || 'http://127.0.0.1:8090', authPersistenceStore);

export const hasPocketBaseUrl = Boolean(pocketBaseUrl);
