export type ThemeMode = 'light' | 'dark' | 'auto';

export type FontMode = 'xsmall' | 'small' | 'base' | 'large' | 'xlarge';

export type UserRole = 'guest' | 'user' | 'admin';

export type AuthStatus =
  | 'anonymous'
  | 'initializing'
  | 'authenticated'
  | 'emailUnverified'
  | 'suspended'
  | 'withdrawn';

export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type ComponentTone =
  | 'primary'
  | 'neutral'
  | 'danger'
  | 'success'
  | 'warning'
  | 'info';

export type ComponentVariant = 'solid' | 'soft' | 'outline' | 'ghost' | 'plain';
