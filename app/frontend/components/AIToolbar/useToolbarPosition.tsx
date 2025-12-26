import { useEffect, useRef } from 'react'
import { SelectionData, Rect } from './types'
import { useInputRect } from './useInputRect'

export const useToolbarPosition = (
  containerRef: React.RefObject<HTMLDivElement>,
  selectionData: SelectionData | null,
  visible: boolean,
) => {
  const { getInputRect } = useInputRect()
  const requestRef = useRef<number>()

  const updatePosition = () => {
    if (!containerRef.current || !selectionData) return

    let rect: Rect | null = null

    if (selectionData.type === 'range' && selectionData.range) {
      const { range } = selectionData
      const clientRects = range.getClientRects()

      if (clientRects.length > 0) {
        // Get tight bounds of actual text selection
        const first = clientRects[0]
        const last = clientRects[clientRects.length - 1]

        rect = {
          top: first.top,
          left: first.left,
          width: last.right - first.left,
          height: last.bottom - first.top,
        }
      } else {
        // Fallback for empty/weird selections
        const rangeRect = range.getBoundingClientRect()
        if (rangeRect.width > 0 && rangeRect.height > 0) {
          rect = rangeRect
        }
      }
    } else if (selectionData.type === 'input' && selectionData.element) {
      if (selectionData.element.tagName === 'TEXTAREA') {
        const textarea = selectionData.element as HTMLTextAreaElement
        const isAllSelected = textarea.selectionStart === 0
                             && textarea.selectionEnd === textarea.value.length
                             && textarea.value.length > 0

        if (isAllSelected) {
          textarea.scrollTop = 0
        }
      }

      rect = getInputRect(selectionData.element)
    }

    // Hide if invalid or off-screen
    if (!rect || rect.width === 0 || rect.top < -50) {
      containerRef.current.style.opacity = '0'
      containerRef.current.style.pointerEvents = 'none'
      return
    }

    // Calculate toolbar placement
    const toolbarW = containerRef.current.offsetWidth
    const toolbarH = containerRef.current.offsetHeight
    const GAP = 8

    const viewportW = window.innerWidth
    const viewportH = window.innerHeight

    // Default: centered below selection
    let top = rect.top + rect.height + GAP
    let left = rect.left + (rect.width / 2) - (toolbarW / 2)

    // Check if toolbar would be cut off at bottom
    if (top + toolbarH > viewportH) {
      // Flip to top
      top = rect.top - toolbarH - GAP
    }

    // Check if toolbar would be cut off at top (only if flipped)
    if (top < 0) {
      // Go back to bottom (original position)
      top = rect.top + rect.height + GAP
    }

    // Check if toolbar would be cut off on left
    if (left < 0) {
      left = 10
    }

    // Check if toolbar would be cut off on right
    if (left + toolbarW > viewportW) {
      left = viewportW - toolbarW - 10
    }

    containerRef.current.style.transform = `translate3d(${left}px, ${top}px, 0)`
    containerRef.current.style.opacity = '1'
    containerRef.current.style.pointerEvents = 'auto'
  }

  useEffect(() => {
    const loop = () => {
      if (visible) {
        updatePosition()
        requestRef.current = requestAnimationFrame(loop)
      }
    }
    if (visible) loop()
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
  }, [visible, selectionData])

  return { updatePosition }
}
