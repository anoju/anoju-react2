import { UserRound } from 'lucide-react';
import { Img } from '@/components/atoms/Img';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const getInitial = (name?: string) => {
  const trimmedName = name?.trim();

  if (!trimmedName) {
    return '';
  }

  return trimmedName.slice(0, 1).toUpperCase();
};

const Avatar = ({ src, name, size = 'md', className = '' }: AvatarProps) => {
  const initial = getInitial(name);
  const classNames = ['avatar', `avatar--${size}`, className].filter(Boolean).join(' ');
  const label = name ? `${name} 프로필 이미지` : '회원 프로필 이미지';

  return (
    <span className={classNames} aria-label={label} role="img">
      {src ? (
        <Img src={src} alt="" className="avatar__image" aria-hidden="true" />
      ) : initial ? (
        <span className="avatar__initial" aria-hidden="true">
          {initial}
        </span>
      ) : (
        <UserRound size={18} aria-hidden="true" />
      )}
    </span>
  );
};

export default Avatar;
