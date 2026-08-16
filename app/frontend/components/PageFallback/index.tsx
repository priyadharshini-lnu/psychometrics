import {
  createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState,
} from 'react'
import type { FC, ReactNode } from 'react'
import { Flex, MarshSpinner } from '@thetalententerprise/glint'

const { I18n } = window

// A prefetched module resolves well inside this, so the common navigation shows nothing at all.
export const FALLBACK_DELAY = 120

export const PAGE_SPINNER_SIZE = 56

export const useDelayedShow = (delay: number) => {
  const [show, setShow] = useState(delay === 0)

  useEffect(() => {
    if (delay === 0) return undefined
    const timer = setTimeout(() => setShow(true), delay)

    return () => clearTimeout(timer)
  }, [delay])

  return show
}

// Centred inline only: AppShell's splitter panel is a block, so the content column has no height to fill.
const PageSpinner: FC = () => (
  <Flex flex="1 0 auto" align="center" justify="center">
    <MarshSpinner size={PAGE_SPINNER_SIZE} label={I18n.t('administration.common.loading')} />
  </Flex>
)

/** The suspense fallback for a routed page: held back so a fast load never flashes a spinner. */
export const PageFallback: FC<{ delay?: number }> = ({ delay = FALLBACK_DELAY }) => (
  useDelayedShow(delay) ? <PageSpinner /> : null
)

interface PageHoldState {
  held: boolean
  hold: (holding: boolean) => void
}

const PageHoldContext = createContext<PageHoldState>({ held: false, hold: () => {} })

/** True while a page below is still fetching, so its chrome waits instead of painting over the indicator. */
export const usePageHeld = (): boolean => {
  const { held } = useContext(PageHoldContext)
  const painted = useRef(false)

  // Withholding is for chrome that has never been seen; once painted, a refetch must not unmount it.
  if (!held) painted.current = true

  return held && !painted.current
}

/** Rendered by a page in place of its content until its data lands. */
export const PageHold: FC = () => {
  const { hold } = useContext(PageHoldContext)

  // Before paint, so the chrome above never commits a frame alongside the indicator.
  useLayoutEffect(() => {
    hold(true)

    return () => hold(false)
  }, [hold])

  return null
}

/** The one arrival indicator for the routed area: every page under it shares this spinner. */
export const PageHoldArea: FC<{ children: ReactNode }> = ({ children }) => {
  const [holders, setHolders] = useState(0)
  const hold = useCallback((holding: boolean) => { setHolders(count => count + (holding ? 1 : -1)) }, [])
  const held = holders > 0
  const value = useMemo(() => ({ held, hold }), [held, hold])

  return (
    <PageHoldContext.Provider value={value}>
      {held && <PageFallback delay={0} />}
      {children}
    </PageHoldContext.Provider>
  )
}
