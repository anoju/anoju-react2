const NICKNAME_PATTERN = /^[가-힣a-z0-9_]{2,20}$/;

export const normalizeNickname = (nickname: string) => nickname.trim().replace(/^@+/, '').toLowerCase();

export const validateNickname = (nickname: string) => {
  const normalizedNickname = normalizeNickname(nickname);

  if (!normalizedNickname) {
    return '닉네임을 입력해주세요.';
  }

  if (!NICKNAME_PATTERN.test(normalizedNickname)) {
    return '닉네임은 한글, 영문 소문자, 숫자, _ 조합으로 2~20자만 사용할 수 있습니다.';
  }

  return '';
};

export const formatMention = (nickname: string) => `@${normalizeNickname(nickname)}`;

export const isNicknameConflictMessage = (message: string) =>
  message.toLowerCase().includes('nickname') || message.includes('UNIQUE constraint failed');

export const createTemporaryNickname = () => {
  const randomValue = Math.random().toString(36).slice(2, 10);

  return `user_${randomValue}`;
};
