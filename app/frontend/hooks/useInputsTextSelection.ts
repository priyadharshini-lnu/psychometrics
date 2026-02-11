import { useState, useEffect } from 'react'
import type { RefObject } from 'react'

export interface TextSelection {
  selectedText: string | null
  selectionStart: number | null
  selectionEnd: number | null
  isSelected: boolean
  element: HTMLElement | null
}

type UseTextSelectionOptions = {
  ref?: RefObject<HTMLElement>
}

const EMPTY_SELECTION: TextSelection = {
  selectedText: null,
  selectionStart: null,
  selectionEnd: null,
  isSelected: false,
  element: null,
}

export const useTextSelection = ({ ref }: UseTextSelectionOptions): TextSelection => {
  const [selection, setSelection] = useState<TextSelection>(EMPTY_SELECTION)

  useEffect(() => {
    const handleSelection = () => {
      const active = document.activeElement
      const container = ref?.current

      if (!(active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement)) {
        setSelection(EMPTY_SELECTION)
        return
      }

      const { selectionStart: start, selectionEnd: end } = active
      if (start === null || end === null || start === end) {
        setSelection(EMPTY_SELECTION)
        return
      }

      if (!container || !container.contains(active)) {
        setSelection(EMPTY_SELECTION)
        return
      }

      setSelection({
        selectedText: active.value.slice(start, end),
        selectionStart: start,
        selectionEnd: end,
        isSelected: true,
        element: active,
      })
    }

    document.addEventListener('selectionchange', handleSelection)
    return () => document.removeEventListener('selectionchange', handleSelection)
  }, [ref])

  return selection
}
