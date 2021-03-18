import React, { useEffect, useRef } from 'react'

export function useTimeout (
  callback: React.EffectCallback,
  delay: number | null,
): React.MutableRefObject<number | null> {
  const timeoutRef = useRef<number | null>(null)
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (typeof delay === 'number') {
      timeoutRef.current = window.setTimeout(() => callbackRef.current(), delay)
      return () => window.clearTimeout(timeoutRef.current || 0)
    }
    return () => {}
  }, [delay])

  return timeoutRef
}
