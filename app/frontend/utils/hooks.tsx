import { useEffect, RefObject } from 'react'

export function useCopyProtection (
  ref: RefObject<HTMLDivElement>,
  shouldEnableContentCopy = false,
): null {
  const disableEvent = (event: Event) => {
    event.preventDefault()
    return false
  }

  useEffect(() => {
    if (shouldEnableContentCopy === false) {
      const addEventListener = ref?.current?.addEventListener ?? null

      if (addEventListener) {
        addEventListener('copy', disableEvent)
        addEventListener('cut', disableEvent)
        addEventListener('contextmenu', disableEvent)
      }
    }

    return () => {
      if (shouldEnableContentCopy === false) {
        const removeEventListener = ref?.current?.removeEventListener ?? null

        if (removeEventListener) {
          removeEventListener('copy', disableEvent)
          removeEventListener('cut', disableEvent)
          removeEventListener('contextmenu', disableEvent)
        }
      }
    }
  }, [shouldEnableContentCopy])

  return null
}
