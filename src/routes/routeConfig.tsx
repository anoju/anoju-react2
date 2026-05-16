import Home from '@/pages/Home/Index';
import Login from '@/pages/Login/Index';
import Menu from '@/pages/Menu/Index';
import MyPage from '@/pages/MyPage/Index';
import Settings from '@/pages/Settings/Index';
import Gallery from '@/pages/Gallery/Index';
import About from '@/pages/static/About/Index';
import NotFound from '@/pages/NotFound/Index';
import { DEFAULT_HOME_PATH, LOGIN_PATH, MENU_PATH, MY_PAGE_PATH, SETTINGS_PATH } from '@/constants/app';
import type { AppRouteConfig, HeaderConfig, FloatingMenuConfig } from './types';

const defaultHeader = (title: string): HeaderConfig => ({
  enabled: true,
  title,
  alwaysFixed: false,
  hideOnScroll: true,
  showBackButton: true,
  showHomeButton: true,
  backButton: { type: 'history', fallbackPath: DEFAULT_HOME_PATH },
});

const defaultFloatingMenu: FloatingMenuConfig = {
  enabled: false,
  hideOnScroll: true,
};

export const routeConfig = [
  {
    id: 'root',
    path: '/',
    element: <Home />,
    meta: {
      title: '홈',
      description: 'Anoju 홈 화면입니다.',
    },
    layout: {
      header: {
        ...defaultHeader('홈'),
        showBackButton: false,
      },
      floatingMenu: {
        ...defaultFloatingMenu,
        enabled: true,
      },
    },
  },
  {
    id: 'home',
    path: DEFAULT_HOME_PATH,
    element: <Home />,
    meta: {
      title: '홈',
      description: 'Anoju 홈 화면입니다.',
    },
    layout: {
      header: {
        ...defaultHeader('홈'),
        showBackButton: false,
      },
      floatingMenu: {
        ...defaultFloatingMenu,
        enabled: true,
      },
    },
  },
  {
    id: 'login',
    path: LOGIN_PATH,
    element: <Login />,
    meta: {
      title: '로그인',
      description: 'Anoju 로그인 화면입니다.',
      robots: 'noindex',
    },
    layout: {
      header: defaultHeader('로그인'),
      floatingMenu: defaultFloatingMenu,
    },
  },
  {
    id: 'menu',
    path: MENU_PATH,
    element: <Menu />,
    meta: {
      title: '전체메뉴',
      description: 'Anoju 전체 메뉴 화면입니다.',
    },
    layout: {
      header: defaultHeader('전체메뉴'),
      floatingMenu: {
        ...defaultFloatingMenu,
        enabled: true,
      },
    },
  },
  {
    id: 'my-page',
    path: MY_PAGE_PATH,
    element: <MyPage />,
    meta: {
      title: '마이페이지',
      description: '내 정보와 활동을 확인하는 화면입니다.',
      robots: 'noindex',
    },
    layout: {
      header: defaultHeader('마이페이지'),
      floatingMenu: {
        ...defaultFloatingMenu,
        enabled: true,
      },
    },
    requiresAuth: true,
    roles: ['user', 'admin'],
  },
  {
    id: 'settings',
    path: SETTINGS_PATH,
    element: <Settings />,
    meta: {
      title: '설정',
      description: '테마와 글자 크기를 설정하는 화면입니다.',
      robots: 'noindex',
    },
    layout: {
      header: defaultHeader('설정'),
      floatingMenu: {
        ...defaultFloatingMenu,
        enabled: true,
      },
    },
  },
  {
    id: 'gallery',
    path: '/gallery',
    element: <Gallery />,
    meta: {
      title: '갤러리',
      description: '갤러리 목록 화면입니다.',
    },
    layout: {
      header: defaultHeader('갤러리'),
      floatingMenu: defaultFloatingMenu,
    },
  },
  {
    id: 'about',
    path: '/about',
    element: <About />,
    meta: {
      title: '소개',
      description: 'Anoju 소개 화면입니다.',
    },
    layout: {
      header: defaultHeader('소개'),
      floatingMenu: defaultFloatingMenu,
    },
  },
  {
    id: 'not-found',
    path: '*',
    element: <NotFound />,
    meta: {
      title: '페이지를 찾을 수 없습니다',
      robots: 'noindex',
    },
    layout: {
      header: defaultHeader('오류'),
      floatingMenu: defaultFloatingMenu,
    },
  },
] satisfies AppRouteConfig[];
