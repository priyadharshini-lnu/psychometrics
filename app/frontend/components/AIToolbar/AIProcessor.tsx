import React, {
  useState, useEffect,
} from 'react'
import { message } from 'antd'
import {
  AIAction, AIOperation, AIProcessorProps, AssistantOutput, ProcessingState,
} from './types'
import { useResources } from '~/hooks/useResources'
import { FroalaTextSelection } from '~/hooks/useFroalaTextSelection'
import Result from './Result'
import { baseErrorMessage } from '~/hooks/useResources/utils'

const { I18n } = window

function isFroalaSelection (selection: AIProcessorProps['selectionData']): selection is FroalaTextSelection {
  return selection !== null && selection !== undefined && 'froalaEditor' in selection
}

const AIProcessor: React.FC<AIProcessorProps> = ({
  visible,
  onClose,
  onProcessingStateChange,
  operations,
  selectionData,
}) => {
  const [state, setState] = useState<ProcessingState>({
    view: 'idle',
    assistantOutput: { result: '' },
    error: null,
    lastAction: null,
    lastOption: null,
  })

  const { collectionAction } = useResources('writing_assistants')

  const handleClose = () => {
    setState(prev => ({ ...prev, view: 'idle', error: null }))
    onClose()
  }

  useEffect(() => {
    if (!visible || state.view !== 'idle') return

    if (operations && operations.length > 0) {
      generateResults(operations)
    }
  }, [visible, operations, state.view, selectionData])


  const generateResults = async (ops: AIOperation[]) => {
    setState(prev => ({
      ...prev,
      view: 'loading',
      error: null,
    }))

    onProcessingStateChange?.(true)

    const payload = {
      text: isFroalaSelection(selectionData)
        ? selectionData?.froalaEditor?.selectedHtml : selectionData?.selectedText || '',
      operations: ops,
      context: {},
      user_locale: I18n.currentLocale(),
    }

    try {
      const result = await collectionAction({
        action: 'assist',
        method: 'post',
        body: payload,
      }) as AssistantOutput

      setState(prev => ({
        ...prev,
        assistantOutput: result,
        view: 'result',
      }))
    } catch (error) {
      const errorMessage = baseErrorMessage(error, 'detail') || I18n.t('shared.something_wrong')
      setState(prev => ({
        ...prev,
        error: errorMessage,
        assistantOutput: { result: '' },
        view: 'result',
      }))
    } finally {
      onProcessingStateChange?.(false)
    }
  }

  const handleTryAgain = () => {
    if (operations) {
      generateResults(operations)
    }
  }

  const handleReplace = () => {
    if (!selectionData?.selectedText) {
      return
    }

    if (isFroalaSelection(selectionData)) {
      const { froalaEditor } = selectionData
      if (!froalaEditor) return

      const { instance, selectedHtml } = froalaEditor
      instance.selection.restore()
      if (selectedHtml) {
        instance.html.insert(state.assistantOutput.result)
      }
    } else {
      const { element, selectionStart, selectionEnd } = selectionData
      if (!element || selectionStart === null || selectionEnd === null) return

      if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
        element.setRangeText(state.assistantOutput.result, selectionStart, selectionEnd, 'end')
        element.dispatchEvent(new Event('input', { bubbles: true }))
        element.focus()
      }
    }

    handleClose()
    message.success(I18n.t('admin.toolbar_text_replaced'))
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(state.assistantOutput.result)
    message.success(I18n.t('admin.toolbar_text_copied'))
  }

  if (!visible || state.view === 'idle') return null

  return (
    <Result
      visible={visible}
      handleClose={handleClose}
      loading={state.view === 'loading'}
      selectedText={isFroalaSelection(selectionData)
        ? selectionData?.froalaEditor?.selectedHtml || '' : selectionData?.selectedText || ''}
      assistantOutput={state.assistantOutput}
      handleCopy={handleCopy}
      handleReplace={handleReplace}
      handleTryAgain={handleTryAgain}
      error={state.error}
    />
  )
}

export type GenerateResultFunction = (action: AIAction, option?: string) => Promise<void>

export { type AIAction }
export default AIProcessor
