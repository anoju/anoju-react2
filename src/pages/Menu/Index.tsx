import { NavLink } from 'react-router-dom'
import {
  ADMIN_PATH,
  DEFAULT_HOME_PATH,
  DEVICE_INFO_PATH,
  CLIPS_PATH,
  FREE_BOARD_PATH,
  IT_LOGS_PATH,
  LOGIN_PATH,
  MY_PAGE_PATH,
  MY_PAGE_NOTIFICATIONS_PATH,
  PICS_PATH,
  PLAYGROUND_PATH,
  REGISTER_PATH,
  SETTINGS_PATH,
  SNAPS_PATH,
} from '@/constants/app'
import { useAuthStore } from '@/stores/authStore'

interface MenuItem {
  label: string
  path: string
}

interface MenuGroup {
  label?: string
  items: MenuItem[]
}

const Menu = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const memberItems: MenuItem[] = [
    {
      label: isAuthenticated ? '마이페이지' : '로그인',
      path: isAuthenticated ? MY_PAGE_PATH : LOGIN_PATH,
    },
    ...(isAuthenticated ? [{ label: '알림함', path: MY_PAGE_NOTIFICATIONS_PATH }] : []),
    ...(!isAuthenticated ? [{ label: '회원가입', path: REGISTER_PATH }] : []),
    {
      label: '설정',
      path: SETTINGS_PATH,
    },
  ]
  const menuGroups: MenuGroup[] = [
    {
      label: 'Home',
      items: [
        { label: '홈', path: DEFAULT_HOME_PATH },
        { label: '소개', path: '/about' },
      ],
    },
    {
      label: 'playground',
      items: [
        { label: 'playground Home', path: PLAYGROUND_PATH },
        { label: '자유게시판', path: FREE_BOARD_PATH },
        { label: 'ITLogs', path: IT_LOGS_PATH },
        { label: '디바이스정보', path: DEVICE_INFO_PATH },
      ],
    },
    {
      label: 'Snaps',
      items: [
        { label: 'Snaps Home', path: SNAPS_PATH },
        { label: 'Pics', path: PICS_PATH },
        { label: 'Clips', path: CLIPS_PATH },
      ],
    },
    {
      label: 'Members',
      items: memberItems,
    },
    ...(user?.role === 'admin'
      ? [
          {
            label: 'Admin',
            items: [{ label: '관리자', path: ADMIN_PATH }],
          },
        ]
      : []),
  ]

  return (
    <section className="container simple-page">
      <h2 className="simple-page__title">전체메뉴</h2>
      <nav className="menu-list" aria-label="전체메뉴">
        {menuGroups.map((group, groupIndex) => (
          <section
            className="menu-list__group"
            aria-label={group.label ?? '1뎁스 메뉴'}
            key={group.label ?? groupIndex}
          >
            {group.label ? <h3 className="menu-list__group-title">{group.label}</h3> : null}
            <div className="menu-list__items">
              {group.items.map((item) => (
                <NavLink to={item.path} className="menu-list__item" key={item.path}>
                  {item.label}
                </NavLink>
              ))}
            </div>
          </section>
        ))}
      </nav>
    </section>
  )
}

export default Menu
