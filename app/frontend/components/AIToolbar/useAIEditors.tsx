import { useState, useEffect } from 'react'

/**
* Hook to discover and track all elements designated as AI-enabled editors.
* @param enabled Whether the editor discovery should be active.
* @returns An array of detected HTML wrapper elements.
*/
export const useAIEditors = (enabled: boolean) => {
  const [editors, setEditors] = useState<HTMLElement[]>([])

  const findEditors = () => {
    const nodes = document.querySelectorAll('[data-ai-enabled="true"]')
    setEditors(Array.from(nodes) as HTMLElement[])
  }

  useEffect(() => {
    if (!enabled) {
      setEditors([])
      return
    }

    findEditors()

    const observer = new MutationObserver(findEditors)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [enabled])


  return editors
}
