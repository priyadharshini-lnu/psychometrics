import React, {
  useRef, useState, useCallback, useImperativeHandle,
} from 'react'
import {
  Button, Flex, Input, InputProps, InputRef,
} from 'antd'
import type { TextAreaRef } from 'antd/es/input/TextArea'
import { useTextSelection } from '~/hooks/useInputsTextSelection'
import type { TextSelection } from '~/hooks/useInputsTextSelection'
import { useFroalaTextSelection } from '~/hooks/useFroalaTextSelection'
import type { FroalaTextSelection } from '~/hooks/useFroalaTextSelection'
import { AIEditorIcon } from '~/glint/icons'
import { ToolbarModal } from './ToolbarModal'
import { FroalaEditorInstance } from './types'

const { TextArea } = Input
const { I18n } = window

interface AIInputWrapperRenderProps {
  hasSelection: boolean
  openToolbar: () => void
}

interface AIInputWrapperProps {
  children: (props: AIInputWrapperRenderProps) => React.ReactNode
  className?: string
  editorRef?: React.RefObject<{ editor: FroalaEditorInstance }>
  inputRef?: React.RefObject<InputRef | TextAreaRef>
}

export const ICON_COLOR = 'var(--white-bg)'

export const AIInputWrapper: React.FC<AIInputWrapperProps> = ({
  children,
  className,
  editorRef,
  inputRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectionForModal, setSelectionForModal] = useState<TextSelection | FroalaTextSelection | null>(null)

  const textSelection = useTextSelection({ ref: containerRef })
  const froalaSelection = useFroalaTextSelection({ froalaEditorRef: editorRef })

  const selection = editorRef ? froalaSelection : textSelection
  const hasSelection = selection.isSelected

  const buildSelectAllSelection = useCallback((): TextSelection | FroalaTextSelection | null => {
    if (editorRef) {
      const editor = editorRef.current?.editor
      if (!editor) return null
      editor.commands.selectAll()
      const selectedHtml = editor.html.getSelected() || editor.html.get()
      const selectedText = editor.selection.text() || ''
      editor.selection.save()
      return {
        selectedText,
        isSelected: true,
        element: editor.$el?.[0] || editor.el,
        froalaEditor: { instance: editor, selectedHtml },
      }
    }

    const antRef = inputRef?.current
    const inputEl = (antRef as InputRef | null)?.input
      ?? (antRef as TextAreaRef | null)?.resizableTextArea?.textArea
    if (!inputEl) return null
    inputEl.focus()
    inputEl.select()
    return {
      selectedText: inputEl.value,
      selectionStart: 0,
      selectionEnd: inputEl.value.length,
      isSelected: true,
      element: inputEl,
    }
  }, [editorRef])

  const openToolbar = useCallback(() => {
    const activeSelection = hasSelection ? selection : buildSelectAllSelection()
    if (!activeSelection) return
    setSelectionForModal(activeSelection)
    setModalVisible(true)
  }, [hasSelection, selection, buildSelectAllSelection])

  return (
    <div className={className}>
      <div ref={containerRef}>
        {children({ hasSelection, openToolbar })}
      </div>
      <ToolbarModal
        visible={modalVisible}
        selection={selectionForModal}
        onCancel={() => setModalVisible(false)}
      />
    </div>
  )
}

export const AIInput = React.forwardRef<InputRef, InputProps>(({ className = '', ...inputProps }, forwardedRef) => {
  const internalRef = useRef<InputRef>(null)
  useImperativeHandle(forwardedRef, () => internalRef.current!)

  return (
    <AIInputWrapper className={className} inputRef={internalRef}>
      {({ openToolbar }) => (
        <Flex gap="small" align="center">
          <Input
            ref={internalRef}
            style={{ paddingRight: '5px' }}
            {...inputProps}
            suffix={(
              <Button
                onMouseDown={(event) => {
                  event.preventDefault()
                  openToolbar()
                }}
                type="primary"
                title={I18n.t('admin.enhance_with_ai')}
                icon={<AIEditorIcon style={{ fill: ICON_COLOR }} />}
              />
            )}
            className="spellcheck-enabled"
          />
        </Flex>
      )}
    </AIInputWrapper>
  )
})

type AITextAreaProps = React.ComponentProps<typeof TextArea>

export const AITextArea = React.forwardRef<TextAreaRef, AITextAreaProps>(
  ({ className = '', ...textAreaProps }, forwardedRef) => {
    const internalRef = useRef<TextAreaRef>(null)
    useImperativeHandle(forwardedRef, () => internalRef.current!)

    return (
      <AIInputWrapper className={className} inputRef={internalRef}>
        {({ openToolbar }) => (
          <div style={{ border: '1px solid var(--light-grey-border)' }}>
            <TextArea ref={internalRef} variant="borderless" {...textAreaProps} />
            <Flex className="p-1" justify="end" align="center">
              <Button
                onMouseDown={(event) => {
                  event.preventDefault()
                  openToolbar()
                }}
                type="primary"
                title={I18n.t('admin.enhance_with_ai')}
                icon={<AIEditorIcon style={{ fill: ICON_COLOR }} />}
              />
            </Flex>
          </div>
        )}
      </AIInputWrapper>
    )
  },
)

interface AIFroalaWrapperProps {
  children: React.ReactNode
  className?: string
  editorRef: React.RefObject<{ editor: FroalaEditorInstance }>
}

export const AIFroalaWrapper: React.FC<AIFroalaWrapperProps> = ({
  children,
  className = '',
  editorRef,
}) => {
  const wscBadge = document.querySelector('.wsc-badge--small.wsc-badge--expanded')
  const editor = editorRef?.current?.editor
  const pluginsEnabled = editor?.opts?.pluginsEnabled || []
  const hasCounterPlugins = pluginsEnabled.includes('charCounter') || pluginsEnabled.includes('wordCounter')

  return (
    <AIInputWrapper className={className} editorRef={editorRef}>
      {({ openToolbar }) => (
        <div style={{ position: 'relative' }}>
          {children}
          <Button
            onClick={openToolbar}
            type="primary"
            title={I18n.t('admin.enhance_with_ai')}
            icon={<AIEditorIcon style={{ fill: ICON_COLOR }} />}
            style={{
              position: 'absolute',
              bottom: hasCounterPlugins ? 45 : 35,
              right: wscBadge ? 120 : 25,
              zIndex: 5002,
            }}
          />
        </div>
      )}
    </AIInputWrapper>
  )
}
