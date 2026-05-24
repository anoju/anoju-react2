export const createClientId = (prefix = 'id') => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  const timestamp = Date.now().toString(36);
  const randomValue = Math.random().toString(36).slice(2, 10);

  return `${prefix}_${timestamp}_${randomValue}`;
};
