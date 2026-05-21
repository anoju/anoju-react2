import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'

type GlassSurfaceChannel = 'R' | 'G' | 'B'
type GlassSurfaceBlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity'
  | 'plus-darker'
  | 'plus-lighter'

interface GlassSurfaceProps {
  children?: ReactNode
  className?: string
  borderRadius?: number
  borderWidth?: number
  brightness?: number
  opacity?: number
  blur?: number
  displace?: number
  backgroundOpacity?: number
  saturation?: number
  distortionScale?: number
  redOffset?: number
  greenOffset?: number
  blueOffset?: number
  xChannel?: GlassSurfaceChannel
  yChannel?: GlassSurfaceChannel
  mixBlendMode?: GlassSurfaceBlendMode
  style?: CSSProperties
  disabled?: boolean
}

const FALLBACK_WIDTH = 400
const FALLBACK_HEIGHT = 200

const toKebabCase = (value: string) =>
  value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)

const supportsSvgFilters = (filterId: string) => {
  if (
    typeof window === 'undefined' ||
    typeof document === 'undefined' ||
    typeof navigator === 'undefined'
  ) {
    return false
  }

  const isWebkit = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
  const isFirefox = /Firefox/.test(navigator.userAgent)

  if (isWebkit || isFirefox) {
    return false
  }

  const testElement = document.createElement('div')
  testElement.style.backdropFilter = `url(#${filterId})`

  return testElement.style.backdropFilter !== ''
}

const supportsBackdropFilter = () => {
  if (typeof CSS === 'undefined') {
    return false
  }

  return CSS.supports('backdrop-filter', 'blur(10px)')
}

const getIsDarkMode = () => {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return false
  }

  const theme = document.documentElement.dataset.theme

  if (theme === 'dark') {
    return true
  }

  if (theme === 'light') {
    return false
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export const GlassSurface = ({
  children,
  className,
  borderRadius = 20,
  borderWidth = 0.07,
  brightness = 50,
  opacity = 0.93,
  blur = 11,
  displace = 0.5,
  backgroundOpacity = 0,
  saturation = 1,
  distortionScale = -40,
  redOffset = 0,
  greenOffset = 10,
  blueOffset = 20,
  xChannel = 'R',
  yChannel = 'G',
  mixBlendMode = 'difference',
  style,
  disabled = false,
}: GlassSurfaceProps) => {
  const uniqueId = useId().replace(/:/g, '')
  const filterId = `glass-filter-${uniqueId}`
  const redGradientId = `red-grad-${uniqueId}`
  const blueGradientId = `blue-grad-${uniqueId}`
  const containerRef = useRef<HTMLDivElement>(null)
  const feImageRef = useRef<SVGFEImageElement>(null)
  const redChannelRef = useRef<SVGFEDisplacementMapElement>(null)
  const greenChannelRef = useRef<SVGFEDisplacementMapElement>(null)
  const blueChannelRef = useRef<SVGFEDisplacementMapElement>(null)
  const gaussianBlurRef = useRef<SVGFEGaussianBlurElement>(null)
  const resizeUpdateTimeoutRef = useRef<number | null>(null)
  const appliedStyleKeysRef = useRef<string[]>([])
  const [svgSupported] = useState(() => supportsSvgFilters(filterId))
  const [backdropFilterSupported] = useState(supportsBackdropFilter)
  const [isDarkMode, setIsDarkMode] = useState(getIsDarkMode)
  const methodClassName = svgSupported
    ? 'glass-surface--method-svg'
    : backdropFilterSupported
      ? 'glass-surface--method-backdrop'
      : 'glass-surface--method-fallback'
  const classNames = [
    'glass-surface',
    isDarkMode ? 'glass-surface--theme-dark' : 'glass-surface--theme-light',
    methodClassName,
    disabled ? 'glass-surface--state-disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const generateDisplacementMap = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect()
    const actualWidth = rect?.width || FALLBACK_WIDTH
    const actualHeight = rect?.height || FALLBACK_HEIGHT
    const edgeSize = Math.min(actualWidth, actualHeight) * (borderWidth * 0.5)

    const svgContent = `
      <svg viewBox="0 0 ${actualWidth} ${actualHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="${redGradientId}" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="red"/>
          </linearGradient>
          <linearGradient id="${blueGradientId}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="blue"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" fill="black"></rect>
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${borderRadius}" fill="url(#${redGradientId})" />
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${borderRadius}" fill="url(#${blueGradientId})" style="mix-blend-mode: ${mixBlendMode}" />
        <rect x="${edgeSize}" y="${edgeSize}" width="${actualWidth - edgeSize * 2}" height="${actualHeight - edgeSize * 2}" rx="${borderRadius}" fill="hsl(0 0% ${brightness}% / ${opacity})" style="filter:blur(${blur}px)" />
      </svg>
    `

    return `data:image/svg+xml,${encodeURIComponent(svgContent)}`
  }, [
    blueGradientId,
    blur,
    borderRadius,
    borderWidth,
    brightness,
    mixBlendMode,
    opacity,
    redGradientId,
  ])

  const updateDisplacementMap = useCallback(() => {
    feImageRef.current?.setAttribute('href', generateDisplacementMap())
  }, [generateDisplacementMap])

  const updateFilterElements = useCallback(() => {
    const elements = [
      { ref: redChannelRef, offset: redOffset },
      { ref: greenChannelRef, offset: greenOffset },
      { ref: blueChannelRef, offset: blueOffset },
    ]

    elements.forEach(({ ref, offset }) => {
      ref.current?.setAttribute('scale', String(distortionScale + offset))
      ref.current?.setAttribute('xChannelSelector', xChannel)
      ref.current?.setAttribute('yChannelSelector', yChannel)
    })

    gaussianBlurRef.current?.setAttribute('stdDeviation', String(displace))
  }, [blueOffset, displace, distortionScale, greenOffset, redOffset, xChannel, yChannel])

  useEffect(() => {
    const updateThemeState = () => {
      setIsDarkMode(getIsDarkMode())
    }
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const mutationObserver = new MutationObserver(updateThemeState)

    mediaQuery.addEventListener('change', updateThemeState)
    mutationObserver.observe(document.documentElement, {
      attributeFilter: ['data-theme'],
      attributes: true,
    })

    return () => {
      mediaQuery.removeEventListener('change', updateThemeState)
      mutationObserver.disconnect()
    }
  }, [])

  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      return
    }

    appliedStyleKeysRef.current.forEach((propertyName) => {
      container.style.removeProperty(propertyName)
    })
    appliedStyleKeysRef.current = []

    Object.entries(style ?? {}).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return
      }

      const propertyName = key.startsWith('--') ? key : toKebabCase(key)
      container.style.setProperty(propertyName, String(value))
      appliedStyleKeysRef.current.push(propertyName)
    })

    container.style.setProperty('border-radius', `${borderRadius}px`)
    container.style.setProperty('--glass-frost', String(backgroundOpacity))
    container.style.setProperty('--glass-saturation', String(saturation))

    if (!disabled && svgSupported) {
      container.style.setProperty('backdrop-filter', `url(#${filterId}) saturate(${saturation})`)
    } else {
      container.style.removeProperty('backdrop-filter')
    }
  }, [backgroundOpacity, borderRadius, disabled, filterId, saturation, style, svgSupported])

  useEffect(() => {
    updateDisplacementMap()
    updateFilterElements()
  }, [updateDisplacementMap, updateFilterElements])

  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      return undefined
    }

    const clearResizeUpdateTimeout = () => {
      if (resizeUpdateTimeoutRef.current === null) {
        return
      }

      window.clearTimeout(resizeUpdateTimeoutRef.current)
      resizeUpdateTimeoutRef.current = null
    }
    const resizeObserver = new ResizeObserver(() => {
      clearResizeUpdateTimeout()
      resizeUpdateTimeoutRef.current = window.setTimeout(() => {
        resizeUpdateTimeoutRef.current = null
        updateDisplacementMap()
      }, 0)
    })

    resizeObserver.observe(container)

    return () => {
      clearResizeUpdateTimeout()
      resizeObserver.disconnect()
    }
  }, [updateDisplacementMap])

  return (
    <div ref={containerRef} className={classNames}>
      <svg
        className="glass-surface__svg"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <filter
            id={filterId}
            colorInterpolationFilters="sRGB"
            x="0%"
            y="0%"
            width="100%"
            height="100%"
          >
            <feImage
              ref={feImageRef}
              x="0"
              y="0"
              width="100%"
              height="100%"
              preserveAspectRatio="none"
              result="map"
            />
            <feDisplacementMap
              ref={redChannelRef}
              in="SourceGraphic"
              in2="map"
              id="redchannel"
              result="dispRed"
            />
            <feColorMatrix
              in="dispRed"
              type="matrix"
              values="1 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
              result="red"
            />
            <feDisplacementMap
              ref={greenChannelRef}
              in="SourceGraphic"
              in2="map"
              id="greenchannel"
              result="dispGreen"
            />
            <feColorMatrix
              in="dispGreen"
              type="matrix"
              values="0 0 0 0 0
                      0 1 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
              result="green"
            />
            <feDisplacementMap
              ref={blueChannelRef}
              in="SourceGraphic"
              in2="map"
              id="bluechannel"
              result="dispBlue"
            />
            <feColorMatrix
              in="dispBlue"
              type="matrix"
              values="0 0 0 0 0
                      0 0 0 0 0
                      0 0 1 0 0
                      0 0 0 1 0"
              result="blue"
            />
            <feBlend in="red" in2="green" mode="screen" result="rg" />
            <feBlend in="rg" in2="blue" mode="screen" result="output" />
            <feGaussianBlur ref={gaussianBlurRef} in="output" stdDeviation="0.7" />
          </filter>
        </defs>
      </svg>
      <div className="glass-surface__content">{children}</div>
    </div>
  )
}
