import { History } from 'history'
import { useEffect } from 'react'

export function useClearFlash (history: History) {
  useEffect(() => {
    const clearFlash = history.listen(() => {
      window.PsyGlobalState.flashMessage = []
    })

    return () => {
      clearFlash()
    }
  }, [history])
}
