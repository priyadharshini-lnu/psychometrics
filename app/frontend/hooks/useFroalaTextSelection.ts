import { useState, useEffect } from 'react'
import type { RefObject } from 'react'

export interface FroalaTextSelection {
  selectedText: string | null
  isSelected: boolean
  element: HTMLElement | null
  froalaEditor: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    instance: any
    selectedHtml: string
  } | null
}

type UseFroalaTextSelectionOptions = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  froalaEditorRef?: RefObject<{ editor: any }>
}

const EMPTY_SELECTION: FroalaTextSelection = {
  selectedText: null,
  isSelected: false,
  element: null,
  froalaEditor: null,
}

export const useFroalaTextSelection = ({
  froalaEditorRef,
}: UseFroalaTextSelectionOptions): FroalaTextSelection => {
  const [selection, setSelection] = useState<FroalaTextSelection>(EMPTY_SELECTION)

  useEffect(() => {
    const editor = froalaEditorRef?.current?.editor
    if (!editor) return undefined

    const handleFroalaSelection = () => {
      const editorElement = editor.$el?.[0] || editor.el

      const { activeElement } = document
      const isInEditor = editorElement && (
        editorElement === activeElement
        || editorElement.contains(activeElement)
      )

      if (!isInEditor) {
        setSelection(EMPTY_SELECTION)
        return
      }

      const selectedText = editor.selection.text() || ''
      const selectedHtml = editor.html.getSelected() || ''

      if (!selectedText) {
        setSelection(EMPTY_SELECTION)
        return
      }

      editor.selection.save()
      setSelection({
        selectedText,
        isSelected: true,
        element: editorElement,
        froalaEditor: { instance: editor, selectedHtml },
      })
    }

    document.addEventListener('selectionchange', handleFroalaSelection)
    return () => document.removeEventListener('selectionchange', handleFroalaSelection)
  }, [froalaEditorRef])

  return selection
}
