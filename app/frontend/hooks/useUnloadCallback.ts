import { useEffect } from 'react'

export const useUnloadCallback = (message) => {
  const unload = () => message

  useEffect(() => {
    window.onbeforeunload = unload
    window.onpopstate = unload
    return () => {
      window.onbeforeunload = null
      window.onpopstate = null
    }
  }, [])
}
