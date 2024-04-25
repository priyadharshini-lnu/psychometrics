import { useEffect } from 'react'

export const useUnloadCallback = (message, show = true) => {
  const unload = () => message

  useEffect(() => {
    if (show) {
      window.onbeforeunload = unload
      window.onpopstate = unload
    } else {
      window.onbeforeunload = null
      window.onpopstate = null
    }
    return () => {
      window.onbeforeunload = null
      window.onpopstate = null
    }
  }, [show])
}
