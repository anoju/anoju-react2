import Home from "@/pages/Home/Index";
import Login from "@/pages/Auth/Login/Index";
import Register from "@/pages/Auth/Register/Index";
import Menu from "@/pages/Menu/Index";
import MyPage from "@/pages/MyPage/Index";
import MyPageProfile from "@/pages/MyPage/Profile/Index";
import MyPosts from "@/pages/MyPage/Posts/Index";
import MyComments from "@/pages/MyPage/Comments/Index";
import Notifications from "@/pages/MyPage/Notifications/Index";
import Settings from "@/pages/Settings/Index";
import Playground from "@/pages/Playground/Index";
import DeviceInfo from "@/pages/Playground/DeviceInfo/Index";
import DeviceInfoDetail from "@/pages/Playground/DeviceInfo/Detail/Index";
import DeviceInfoEdit from "@/pages/Playground/DeviceInfo/Edit/Index";
import DeviceInfoWrite from "@/pages/Playground/DeviceInfo/Write/Index";
import FreeBoard from "@/pages/Playground/FreeBoard/Index";
import FreeBoardDetail from "@/pages/Playground/FreeBoard/Detail/Index";
import FreeBoardEdit from "@/pages/Playground/FreeBoard/Edit/Index";
import FreeBoardWrite from "@/pages/Playground/FreeBoard/Write/Index";
import Snaps from "@/pages/Snaps/Index";
import Pics from "@/pages/Snaps/Pics/Index";
import PicsDetail from "@/pages/Snaps/Pics/Detail/Index";
import PicsEdit from "@/pages/Snaps/Pics/Edit/Index";
import PicsWrite from "@/pages/Snaps/Pics/Write/Index";
import PicLog from "@/pages/Snaps/PicLog/Index";
import PicLogAdd from "@/pages/Snaps/PicLog/Add/Index";
import PicLogDetail from "@/pages/Snaps/PicLog/Detail/Index";
import PicLogEdit from "@/pages/Snaps/PicLog/Edit/Index";
import PicLogJoin from "@/pages/Snaps/PicLog/Join/Index";
import PicLogNew from "@/pages/Snaps/PicLog/New/Index";
import About from "@/pages/Static/About/Index";
import NotFound from "@/pages/System/NotFound/Index";
import {
  DEFAULT_HOME_PATH,
  DEVICE_INFO_PATH,
  DEVICE_INFO_EDIT_PATH,
  DEVICE_INFO_WRITE_PATH,
  FREE_BOARD_EDIT_PATH,
  FREE_BOARD_PATH,
  FREE_BOARD_WRITE_PATH,
  LOGIN_PATH,
  MENU_PATH,
  MY_PAGE_PATH,
  MY_PAGE_COMMENTS_PATH,
  MY_PAGE_NOTIFICATIONS_PATH,
  MY_PAGE_POSTS_PATH,
  MY_PAGE_PROFILE_PATH,
  PICS_PATH,
  PICS_EDIT_PATH,
  PICS_WRITE_PATH,
  PIC_LOG_ADD_PATH,
  PIC_LOG_EDIT_PATH,
  PIC_LOG_JOIN_PATH,
  PIC_LOG_NEW_PATH,
  PIC_LOG_PATH,
  PLAYGROUND_PATH,
  REGISTER_PATH,
  SETTINGS_PATH,
  SNAPS_PATH,
} from "@/constants/app";
import type { AppRouteConfig, HeaderConfig, FloatingMenuConfig } from "./types";

const defaultHeader = (title: string): HeaderConfig => ({
  enabled: true,
  title,
  alwaysFixed: false,
  hideOnScroll: true,
  showBackButton: true,
  showNotificationButton: false,
  showHomeButton: true,
  backButton: { type: "history", fallbackPath: DEFAULT_HOME_PATH },
});

const defaultFloatingMenu: FloatingMenuConfig = {
  enabled: false,
  hideOnScroll: true,
};

export const routeConfig = [
  {
    id: "root",
    path: DEFAULT_HOME_PATH,
    element: <Home />,
    meta: {
      title: "Anoju",
      description: "Anoju 홈 화면입니다.",
    },
    layout: {
      header: {
        ...defaultHeader("Anoju"),
        variant: "transparentOverlay",
        showBrandLogo: true,
        showBackButton: false,
        showNotificationButton: true,
        showHomeButton: false,
      },
      floatingMenu: {
        ...defaultFloatingMenu,
        enabled: true,
      },
    },
  },
  {
    id: "login",
    path: LOGIN_PATH,
    element: <Login />,
    meta: {
      title: "로그인",
      description: "Anoju 로그인 화면입니다.",
      robots: "noindex",
    },
    layout: {
      header: defaultHeader("로그인"),
      floatingMenu: {
        ...defaultFloatingMenu,
        enabled: true,
      },
    },
  },
  {
    id: "register",
    path: REGISTER_PATH,
    element: <Register />,
    meta: {
      title: "회원가입",
      description: "Anoju 회원가입 화면입니다.",
      robots: "noindex",
    },
    layout: {
      header: defaultHeader("회원가입"),
      floatingMenu: defaultFloatingMenu,
    },
  },
  {
    id: "menu",
    path: MENU_PATH,
    element: <Menu />,
    meta: {
      title: "전체메뉴",
      description: "Anoju 전체 메뉴 화면입니다.",
    },
    layout: {
      header: defaultHeader("전체메뉴"),
      floatingMenu: {
        ...defaultFloatingMenu,
        enabled: true,
      },
    },
  },
  {
    id: "my-page",
    path: MY_PAGE_PATH,
    element: <MyPage />,
    meta: {
      title: "마이페이지",
      description: "내 정보와 활동을 확인하는 화면입니다.",
      robots: "noindex",
    },
    layout: {
      header: defaultHeader("마이페이지"),
      floatingMenu: {
        ...defaultFloatingMenu,
        enabled: true,
      },
    },
    requiresAuth: true,
    roles: ["user", "admin"],
  },
  {
    id: "my-page-profile",
    path: MY_PAGE_PROFILE_PATH,
    element: <MyPageProfile />,
    meta: {
      title: "내 정보",
      description: "내 정보와 로그인 수단을 관리하는 화면입니다.",
      robots: "noindex",
    },
    layout: {
      header: defaultHeader("내 정보"),
      floatingMenu: defaultFloatingMenu,
    },
    requiresAuth: true,
    roles: ["user", "admin"],
  },
  {
    id: "my-page-posts",
    path: MY_PAGE_POSTS_PATH,
    element: <MyPosts />,
    meta: {
      title: "내가 작성한 글",
      description: "내가 작성한 글을 확인하는 화면입니다.",
      robots: "noindex",
    },
    layout: {
      header: defaultHeader("내가 작성한 글"),
      floatingMenu: defaultFloatingMenu,
    },
    requiresAuth: true,
    roles: ["user", "admin"],
  },
  {
    id: "my-page-comments",
    path: MY_PAGE_COMMENTS_PATH,
    element: <MyComments />,
    meta: {
      title: "내가 작성한 댓글",
      description: "내가 작성한 댓글을 확인하는 화면입니다.",
      robots: "noindex",
    },
    layout: {
      header: defaultHeader("내가 작성한 댓글"),
      floatingMenu: defaultFloatingMenu,
    },
    requiresAuth: true,
    roles: ["user", "admin"],
  },
  {
    id: "my-page-notifications",
    path: MY_PAGE_NOTIFICATIONS_PATH,
    element: <Notifications />,
    meta: {
      title: "알림함",
      description: "내 댓글, 답글, 태그 알림을 확인하는 화면입니다.",
      robots: "noindex",
    },
    layout: {
      header: defaultHeader("알림함"),
      floatingMenu: defaultFloatingMenu,
    },
    requiresAuth: true,
    roles: ["user", "admin"],
  },
  {
    id: "settings",
    path: SETTINGS_PATH,
    element: <Settings />,
    meta: {
      title: "설정",
      description: "테마와 글자 크기를 설정하는 화면입니다.",
      robots: "noindex",
    },
    layout: {
      header: defaultHeader("설정"),
      floatingMenu: {
        ...defaultFloatingMenu,
        enabled: true,
      },
    },
  },
  {
    id: "playground",
    path: PLAYGROUND_PATH,
    element: <Playground />,
    meta: {
      title: "playground",
      description: "커뮤니티 메뉴를 모아보는 playground 서브 메인입니다.",
    },
    layout: {
      header: defaultHeader("playground"),
      floatingMenu: {
        ...defaultFloatingMenu,
        enabled: true,
      },
    },
  },
  {
    id: "free-board",
    path: FREE_BOARD_PATH,
    element: <FreeBoard />,
    meta: {
      title: "자유게시판",
      description: "자유게시판 목록 화면입니다.",
    },
    layout: {
      header: defaultHeader("자유게시판"),
      floatingMenu: defaultFloatingMenu,
    },
  },
  {
    id: "free-board-write",
    path: FREE_BOARD_WRITE_PATH,
    element: <FreeBoardWrite />,
    meta: {
      title: "자유게시판 글쓰기",
      description: "자유게시판 글 작성 화면입니다.",
      robots: "noindex",
    },
    layout: {
      header: defaultHeader("글쓰기"),
      floatingMenu: defaultFloatingMenu,
    },
    requiresAuth: true,
    roles: ["user", "admin"],
  },
  {
    id: "free-board-detail",
    path: `${FREE_BOARD_PATH}/:postId`,
    element: <FreeBoardDetail />,
    meta: {
      title: "자유게시판 상세",
      description: "자유게시판 게시글 상세 화면입니다.",
    },
    layout: {
      header: defaultHeader("자유게시판"),
      floatingMenu: defaultFloatingMenu,
    },
  },
  {
    id: "free-board-edit",
    path: FREE_BOARD_EDIT_PATH,
    element: <FreeBoardEdit />,
    meta: {
      title: "자유게시판 수정",
      description: "자유게시판 게시글 수정 화면입니다.",
      robots: "noindex",
    },
    layout: {
      header: defaultHeader("게시글 수정"),
      floatingMenu: defaultFloatingMenu,
    },
    requiresAuth: true,
    roles: ["user", "admin"],
  },
  {
    id: "device-info",
    path: DEVICE_INFO_PATH,
    element: <DeviceInfo />,
    meta: {
      title: "디바이스정보",
      description: "모바일 디바이스별 웹 해상도 데이터 목록 화면입니다.",
    },
    layout: {
      header: defaultHeader("디바이스정보"),
      floatingMenu: defaultFloatingMenu,
    },
  },
  {
    id: "device-info-write",
    path: DEVICE_INFO_WRITE_PATH,
    element: <DeviceInfoWrite />,
    meta: {
      title: "디바이스정보 작성",
      description: "모바일 디바이스 웹 해상도 데이터 작성 화면입니다.",
      robots: "noindex",
    },
    layout: {
      header: defaultHeader("디바이스정보 작성"),
      floatingMenu: defaultFloatingMenu,
    },
    requiresAuth: true,
    roles: ["user", "admin"],
  },
  {
    id: "device-info-detail",
    path: `${DEVICE_INFO_PATH}/:deviceReportId`,
    element: <DeviceInfoDetail />,
    meta: {
      title: "디바이스정보 상세",
      description: "모바일 디바이스 웹 해상도 데이터 상세 화면입니다.",
    },
    layout: {
      header: defaultHeader("디바이스정보"),
      floatingMenu: defaultFloatingMenu,
    },
  },
  {
    id: "device-info-edit",
    path: DEVICE_INFO_EDIT_PATH,
    element: <DeviceInfoEdit />,
    meta: {
      title: "디바이스정보 수정",
      description: "모바일 디바이스 웹 해상도 데이터 수정 화면입니다.",
      robots: "noindex",
    },
    layout: {
      header: defaultHeader("디바이스정보 수정"),
      floatingMenu: defaultFloatingMenu,
    },
    requiresAuth: true,
    roles: ["user", "admin"],
  },
  {
    id: "snaps",
    path: SNAPS_PATH,
    element: <Snaps />,
    meta: {
      title: "Snaps",
      description: "시각 콘텐츠 메뉴를 모아보는 Snaps 서브 메인입니다.",
    },
    layout: {
      header: defaultHeader("Snaps"),
      floatingMenu: {
        ...defaultFloatingMenu,
        enabled: true,
      },
    },
  },
  {
    id: "pics",
    path: PICS_PATH,
    element: <Pics />,
    meta: {
      title: "Pics",
      description: "이미지 중심 소셜 피드 화면입니다.",
    },
    layout: {
      header: defaultHeader("Pics"),
      floatingMenu: defaultFloatingMenu,
    },
  },
  {
    id: "pics-write",
    path: PICS_WRITE_PATH,
    element: <PicsWrite />,
    meta: {
      title: "Pics 작성",
      description: "Pics 작성 화면입니다.",
      robots: "noindex",
    },
    layout: {
      header: defaultHeader("Pics 작성"),
      floatingMenu: defaultFloatingMenu,
    },
    requiresAuth: true,
    roles: ["user", "admin"],
  },
  {
    id: "pics-detail",
    path: `${PICS_PATH}/:postId`,
    element: <PicsDetail />,
    meta: {
      title: "Pics 상세",
      description: "Pics 상세 화면입니다.",
    },
    layout: {
      header: defaultHeader("Pics"),
      floatingMenu: defaultFloatingMenu,
    },
  },
  {
    id: "pics-edit",
    path: PICS_EDIT_PATH,
    element: <PicsEdit />,
    meta: {
      title: "Pics 수정",
      description: "Pics 캡션 수정 화면입니다.",
      robots: "noindex",
    },
    layout: {
      header: defaultHeader("Pics 수정"),
      floatingMenu: defaultFloatingMenu,
    },
    requiresAuth: true,
    roles: ["user", "admin"],
  },
  {
    id: "pic-log",
    path: PIC_LOG_PATH,
    element: <PicLog />,
    meta: {
      title: "picLog",
      description: "시간 챕터별 하루 사진 로그 목록 화면입니다.",
    },
    layout: {
      header: defaultHeader("picLog"),
      floatingMenu: defaultFloatingMenu,
    },
  },
  {
    id: "pic-log-new",
    path: PIC_LOG_NEW_PATH,
    element: <PicLogNew />,
    meta: {
      title: "picLog 만들기",
      description: "새 picLog를 만드는 화면입니다.",
      robots: "noindex",
    },
    layout: {
      header: defaultHeader("picLog 만들기"),
      floatingMenu: defaultFloatingMenu,
    },
    requiresAuth: true,
    roles: ["user", "admin"],
  },
  {
    id: "pic-log-join",
    path: PIC_LOG_JOIN_PATH,
    element: <PicLogJoin />,
    meta: {
      title: "picLog 초대 입장",
      description: "초대 패스워드로 picLog에 입장하는 화면입니다.",
      robots: "noindex",
    },
    layout: {
      header: defaultHeader("picLog 초대"),
      floatingMenu: defaultFloatingMenu,
    },
    requiresAuth: true,
    roles: ["user", "admin"],
  },
  {
    id: "pic-log-detail",
    path: `${PIC_LOG_PATH}/:logId`,
    element: <PicLogDetail />,
    meta: {
      title: "picLog 상세",
      description: "시간 챕터별 picLog 상세 화면입니다.",
    },
    layout: {
      header: defaultHeader("picLog"),
      floatingMenu: defaultFloatingMenu,
    },
  },
  {
    id: "pic-log-add",
    path: PIC_LOG_ADD_PATH,
    element: <PicLogAdd />,
    meta: {
      title: "picLog 사진 추가",
      description: "picLog 시간 챕터에 사진을 추가하는 화면입니다.",
      robots: "noindex",
    },
    layout: {
      header: defaultHeader("사진 추가"),
      floatingMenu: defaultFloatingMenu,
    },
    requiresAuth: true,
    roles: ["user", "admin"],
  },
  {
    id: "pic-log-edit",
    path: PIC_LOG_EDIT_PATH,
    element: <PicLogEdit />,
    meta: {
      title: "picLog 사진 수정",
      description: "picLog 사진과 메모를 수정하는 화면입니다.",
      robots: "noindex",
    },
    layout: {
      header: defaultHeader("사진 수정"),
      floatingMenu: defaultFloatingMenu,
    },
    requiresAuth: true,
    roles: ["user", "admin"],
  },
  {
    id: "about",
    path: "/about",
    element: <About />,
    meta: {
      title: "소개",
      description: "Anoju 소개 화면입니다.",
    },
    layout: {
      header: defaultHeader("소개"),
      floatingMenu: defaultFloatingMenu,
    },
  },
  {
    id: "not-found",
    path: "*",
    element: <NotFound />,
    meta: {
      title: "페이지를 찾을 수 없습니다",
      robots: "noindex",
    },
    layout: {
      header: defaultHeader("오류"),
      floatingMenu: defaultFloatingMenu,
    },
  },
] satisfies AppRouteConfig[];
