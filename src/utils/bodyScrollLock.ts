const lockIds = new Set<string>();

let previousOverflow = '';
let previousPosition = '';
let previousTop = '';
let previousWidth = '';
let previousLeft = '';
let previousRight = '';
let lockedScrollY = 0;

const createBodyScrollLockId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `body-scroll-lock-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const applyBodyLock = () => {
  const { body } = document;

  previousOverflow = body.style.overflow;
  previousPosition = body.style.position;
  previousTop = body.style.top;
  previousWidth = body.style.width;
  previousLeft = body.style.left;
  previousRight = body.style.right;
  lockedScrollY = window.scrollY;

  body.style.overflow = 'hidden';
  body.style.position = 'fixed';
  body.style.top = `-${lockedScrollY}px`;
  body.style.width = '100%';
  body.style.left = '0';
  body.style.right = '0';
};

const restoreBodyLock = () => {
  const { body } = document;
  const scrollY = lockedScrollY;

  body.style.overflow = previousOverflow;
  body.style.position = previousPosition;
  body.style.top = previousTop;
  body.style.width = previousWidth;
  body.style.left = previousLeft;
  body.style.right = previousRight;

  window.scrollTo(0, scrollY);
};

export const lockBodyScroll = () => {
  if (typeof document === 'undefined') {
    return '';
  }

  const id = createBodyScrollLockId();

  if (lockIds.size === 0) {
    applyBodyLock();
  }

  lockIds.add(id);

  return id;
};

export const unlockBodyScroll = (options?: string | { id?: string; all?: boolean }) => {
  if (typeof document === 'undefined' || lockIds.size === 0) {
    return;
  }

  if (typeof options === 'object' && options?.all) {
    lockIds.clear();
    restoreBodyLock();
    return;
  }

  const id = typeof options === 'string' ? options : options?.id;

  if (id) {
    lockIds.delete(id);
  } else {
    const latestId = Array.from(lockIds).at(-1);

    if (latestId) {
      lockIds.delete(latestId);
    }
  }

  if (lockIds.size === 0) {
    restoreBodyLock();
  }
};

