import { useState, useEffect } from 'react'
import { SelectionData } from './types'

export const useSelectionDetection = (
  containerRef: React.RefObject<HTMLDivElement>,
  enabled = true,
  handleClose: ()=> void,
) => {
  const [visible, setVisible] = useState(false)
  const [selectionData, setSelectionData] = useState<SelectionData | null>(null)

  const isInsideEnabledContext = (node: Node | null): boolean => {
    if (!node) return false
    const element = node.nodeType === Node.TEXT_NODE
      ? node.parentElement
      : (node as HTMLElement)

    return !!element?.closest('[data-ai-enabled="true"]')
  }

  useEffect(() => {
    if (!enabled) {
      setVisible(false)
      return
    }

    const handleSelectionChange = () => {
      if (!enabled) return

      setTimeout(() => {
        const target = document.activeElement as HTMLElement
        const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')
        const isContentEditable = target && target.isContentEditable

        // Input/Textarea logic
        if (isInput) {
          if (!isInsideEnabledContext(target)) {
            setVisible(false)
            return
          }
          const input = target as HTMLInputElement
          const start = input.selectionStart || 0
          const end = input.selectionEnd || 0

          if (end - start > 0) {
            setSelectionData({
              type: 'input',
              text: input.value.substring(start, end),
              element: input,
              start,
              end,
            })
            setVisible(true)
            return
          }
        }

        // For Froala editor
        if (isContentEditable) {
          const sel = window.getSelection()
          if (sel && !sel.isCollapsed && sel.toString().trim().length > 0) {
            if (!isInsideEnabledContext(sel.anchorNode)) {
              setVisible(false)
              return
            }

            if (containerRef.current?.contains(sel.anchorNode)) return

            setSelectionData({
              type: 'range',
              text: sel.toString(),
              range: sel.getRangeAt(0).cloneRange(),
            })
            setVisible(true)
            return
          }
        }

        if (!containerRef.current?.contains(document.activeElement)) {
          setVisible(false)
        }
      }, 10)
    }

    const handleMouseDown = (e: MouseEvent) => {
      // Don't hide if clicking the toolbar
      if (containerRef.current?.contains(e.target as Node)) return

      handleClose()
    }

    document.addEventListener('mouseup', handleSelectionChange)
    document.addEventListener('keyup', handleSelectionChange)
    document.addEventListener('mousedown', handleMouseDown)

    return () => {
      document.removeEventListener('mouseup', handleSelectionChange)
      document.removeEventListener('keyup', handleSelectionChange)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [enabled])

  return { visible, setVisible, selectionData }
}
