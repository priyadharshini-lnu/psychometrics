import { FC, useEffect, useState } from 'react'
import { PageSkeleton } from '~/glint'

// A prefetched module resolves well inside this, so the common navigation shows nothing at all.
export const FALLBACK_DELAY = 120

export const useDelayedShow = (delay: number) => {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay)

    return () => clearTimeout(timer)
  }, [delay])

  return show
}

/** The suspense fallback for a routed page: held back so a fast load never flashes a skeleton. */
export const PageFallback: FC<{ delay?: number }> = ({ delay = FALLBACK_DELAY }) => (
  useDelayedShow(delay) ? <PageSkeleton /> : null
)
