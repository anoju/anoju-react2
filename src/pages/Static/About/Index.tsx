import { AnimatePresence, motion } from 'framer-motion'
import { Images, MessageCircle, SlidersHorizontal } from 'lucide-react'
import { useRef, useState } from 'react'
import { Button, TimedVideoCapture } from '@/components'
import { closePageLoading, openPageLoading } from '@/stores/pageLoadingStore'

const aboutHighlights = [
  {
    id: 'community',
    title: '편안한 커뮤니티',
    summary: '짧은 생각부터 긴 기록까지 자연스럽게 나누는 lounge입니다.',
    detail:
      '자유게시판에서는 조회는 열어두고, 작성과 댓글은 인증된 회원을 기준으로 운영해 부담 없는 대화를 지향합니다.',
    icon: MessageCircle,
    chips: ['자유게시판', '댓글', '반응'],
  },
  {
    id: 'snaps',
    title: '사진으로 남기는 장면',
    summary: '이미지, 캡션, 순서 관리에 집중한 Snaps 경험입니다.',
    detail:
      'Pics는 복잡한 보정보다 업로드와 대표 이미지, 확대 보기, 공유 흐름을 부드럽게 이어주는 데 초점을 둡니다.',
    icon: Images,
    chips: ['Snaps', 'Pics', '캡션'],
  },
  {
    id: 'comfort',
    title: '내 취향에 맞는 화면 설정',
    summary: '테마와 글자 크기를 사용자의 설정 할수 있습니다.',
    detail:
      '라이트, 다크, 시스템 테마와 5단계 글자모드를 지원해 모바일 화면에서도 편안한 읽기 경험을 제공합니다.',
    icon: SlidersHorizontal,
    chips: ['테마', '글자모드', '모바일'],
  },
] as const

const About = () => {
  const [activeId, setActiveId] = useState<(typeof aboutHighlights)[number]['id']>('community')
  const loadingPreviewIdRef = useRef<string | null>(null)
  const activeHighlight = aboutHighlights.find((item) => item.id === activeId) ?? aboutHighlights[0]
  const ActiveIcon = activeHighlight.icon

  const handleLoadingPreview = () => {
    const loadingId = openPageLoading('Anoju를 준비하고 있습니다.')
    loadingPreviewIdRef.current = loadingId
    window.setTimeout(() => {
      closePageLoading(loadingId)

      if (loadingPreviewIdRef.current === loadingId) {
        loadingPreviewIdRef.current = null
      }
    }, 2200)
  }

  const handleLoadingPreviewCloseAll = () => {
    loadingPreviewIdRef.current = null
    closePageLoading({ all: true })
  }

  return (
    <section className="container simple-page about-page">
      <h2 className="simple-page__title">소개</h2>
      <p className="simple-page__description">
        Anoju는 가볍게 이야기를 남기고, 사진을 모으고, 나만의 작은 순간을 오래 보관하기 위한 모바일
        중심 공간입니다.
      </p>
      <div className="simple-page__actions">
        <Button type="button" variant="outline" tone="neutral" onClick={handleLoadingPreview}>
          페이지 로딩 보기
        </Button>
        <Button type="button" variant="ghost" tone="neutral" onClick={handleLoadingPreviewCloseAll}>
          로딩 전체 닫기
        </Button>
      </div>

      <div className="about-page__interactive" aria-label="Anoju 주요 경험">
        <div className="about-page__selector" role="tablist" aria-label="소개 항목">
          {aboutHighlights.map((item) => {
            const Icon = item.icon
            const selected = item.id === activeId

            return (
              <button
                type="button"
                className="about-page__selector-button"
                data-active={selected}
                role="tab"
                aria-selected={selected}
                aria-controls="about-preview"
                key={item.id}
                onClick={() => setActiveId(item.id)}
              >
                <Icon size={18} aria-hidden="true" />
                <span>{item.title}</span>
              </button>
            )
          })}
        </div>

        <motion.div className="about-page__preview" layout id="about-preview" role="tabpanel">
          <div className="about-page__preview-orbit" aria-hidden="true">
            <motion.span
              className="about-page__orb about-page__orb--one"
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3.2 }}
            />
            <motion.span
              className="about-page__orb about-page__orb--two"
              animate={{ x: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 3.8 }}
            />
            <motion.span
              className="about-page__orb about-page__orb--three"
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 4.1 }}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.article
              className="about-page__preview-card"
              key={activeHighlight.id}
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.22 }}
            >
              <span className="about-page__preview-icon" aria-hidden="true">
                <ActiveIcon size={24} />
              </span>
              <h3>{activeHighlight.title}</h3>
              <strong>{activeHighlight.summary}</strong>
              <p>{activeHighlight.detail}</p>
              <div className="about-page__chips" aria-label={`${activeHighlight.title} 키워드`}>
                {activeHighlight.chips.map((chip) => (
                  <span className="about-page__chip" key={chip}>
                    {chip}
                  </span>
                ))}
              </div>
            </motion.article>
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="about-page__section about-page__capture-test">
        <h3>picLog 5초 영상 테스트</h3>
        <p>박스의 +를 누르면 모바일 카메라 촬영 흐름을 확인할 수 있습니다.</p>
        <TimedVideoCapture />
      </div>

    </section>
  )
}

export default About
