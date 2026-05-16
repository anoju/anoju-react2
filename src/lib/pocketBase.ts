import PocketBase from 'pocketbase';

const pocketBaseUrl = import.meta.env.VITE_PB_URL;

export const pb = new PocketBase(pocketBaseUrl || 'http://127.0.0.1:8090');

export const hasPocketBaseUrl = Boolean(pocketBaseUrl);
