import React, { useEffect, useRef, useCallback } from 'react'
import { EditorState, Compartment } from '@codemirror/state'
import {
  EditorView, keymap, lineNumbers as lineNumbersExtension, highlightActiveLine,
} from '@codemirror/view'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import {
  foldGutter as foldGutterExtension,
  foldKeymap,
  syntaxHighlighting,
  defaultHighlightStyle,
} from '@codemirror/language'
import { searchKeymap, openSearchPanel } from '@codemirror/search'
import { autocompletion, type CompletionSource } from '@codemirror/autocomplete'
import { getLanguageExtension } from './languages'
import styles from './ReactCodemirror.less'

type EditorMode = 'lua' | 'javascript' | 'json'

interface ReactCodemirrorProps {
  value?: string
  onChange?: (value: string) => void
  readOnly?: boolean
  mode?: EditorMode
  lineNumbers?: boolean
  lineWrapping?: boolean
  foldGutter?: boolean
  className?: string
  height?: string
  maxHeight?: string
  minHeight?: string
  onEditorReady?: (view: EditorView) => void
  autocomplete?: boolean
  completionSources?: CompletionSource[]
  search?: boolean
}

const ReactCodemirror: React.FC<ReactCodemirrorProps> = ({
  value = '',
  onChange,
  readOnly = false,
  mode = 'javascript',
  lineNumbers = true,
  lineWrapping = false,
  foldGutter = false,
  className,
  height,
  maxHeight,
  minHeight,
  onEditorReady,
  autocomplete = false,
  completionSources,
  search = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const onChangeRef = useRef(onChange)
  const readOnlyCompartment = useRef(new Compartment())
  const isExternalUpdate = useRef(false)

  onChangeRef.current = onChange

  const buildExtensions = useCallback(() => {
    const extensions = [
      history(),
      keymap.of([
        ...defaultKeymap,
        ...historyKeymap,
        ...foldKeymap,
        ...searchKeymap,
      ]),
      readOnlyCompartment.current.of(EditorState.readOnly.of(readOnly)),
    ]

    if (lineNumbers) {
      extensions.push(lineNumbersExtension())
    }

    if (lineWrapping) {
      extensions.push(EditorView.lineWrapping)
    }

    if (foldGutter) {
      extensions.push(foldGutterExtension())
    }

    if (autocomplete) {
      extensions.push(autocompletion(
        completionSources?.length ? { override: completionSources } : {},
      ))
    }

    if (search) {
      extensions.push(keymap.of([
        { key: 'Alt-f', run: openSearchPanel },
      ]))
    }

    if (!readOnly) {
      extensions.push(highlightActiveLine())
    }

    const languageExtension = getLanguageExtension(mode)
    if (languageExtension) {
      extensions.push(languageExtension)
    }

    const themeExtension = buildThemeExtension(height, maxHeight, minHeight)
    extensions.push(themeExtension)

    extensions.push(syntaxHighlighting(defaultHighlightStyle, { fallback: true }))

    extensions.push(
      EditorView.updateListener.of((update) => {
        if (update.docChanged && !isExternalUpdate.current) {
          onChangeRef.current?.(update.state.doc.toString())
        }
      }),
    )

    return extensions
  }, [
    lineNumbers, lineWrapping, foldGutter, autocomplete,
    completionSources, search, readOnly, mode, height, minHeight, maxHeight,
  ])

  useEffect(() => {
    if (!containerRef.current) return

    const state = EditorState.create({
      doc: value,
      extensions: buildExtensions(),
    })

    const view = new EditorView({
      state,
      parent: containerRef.current,
    })

    viewRef.current = view
    onEditorReady?.(view)

    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, [])

  useEffect(() => {
    const view = viewRef.current
    if (!view) return

    const currentContent = view.state.doc.toString()
    if (value === currentContent) return

    isExternalUpdate.current = true
    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: value,
      },
    })
    isExternalUpdate.current = false
  }, [value])

  useEffect(() => {
    const view = viewRef.current
    if (!view) return

    view.dispatch({
      effects: readOnlyCompartment.current.reconfigure(
        EditorState.readOnly.of(readOnly),
      ),
    })
  }, [readOnly])

  const containerClassName = [styles.reactCodemirror, className]
    .filter(Boolean)
    .join(' ')

  return <div ref={containerRef} className={containerClassName} />
}

function buildThemeExtension (height?: string, maxHeight?: string, minHeight?: string) {
  const editorStyles: Record<string, string> = {}
  const contentStyles: Record<string, string> = {}

  if (height) {
    editorStyles.height = height
  }
  if (maxHeight) {
    editorStyles.maxHeight = maxHeight
  }
  if (minHeight) {
    editorStyles.minHeight = minHeight
  }

  return EditorView.theme({
    '&': editorStyles,
    '.cm-content': contentStyles,
    '.cm-scroller': {
      overflow: 'auto',
    },
    '.cm-tooltip-autocomplete': {
      borderRadius: '6px',
      borderColor: 'transparent',
      boxShadow: '4px 4px 12px rgba(0, 0, 0, 0.2)',
    },
    '.cm-tooltip-autocomplete ul li': {
      padding: '8px 4px !important',
      borderRadius: '4px',
      whiteSpace: 'break-spaces !important',
    },
    '.cm-tooltip-autocomplete ul li[aria-selected]': {
      backgroundColor: 'var(--ant-primary-color) !important',
      color: '#fff !important',
    },
  })
}

export default ReactCodemirror
