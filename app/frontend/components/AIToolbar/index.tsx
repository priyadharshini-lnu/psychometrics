import React, { useState, useRef, useMemo } from 'react'
import {
  Spin, message, Typography, Menu, type MenuProps,
} from 'antd'
import {
  EditOutlined,
  ScissorOutlined,
  IdcardOutlined,
  GlobalOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { useSelectionDetection } from './useSelectionDetection'
import { useToolbarPosition } from './useToolbarPosition'
import { useAIEditors } from './useAIEditors'
import styles from './styles.less'
import { AIToolbarProps, AssistantOutput } from './types'
import { useResources } from '~/hooks/useResources'
import Result from './Result'
import AITrigger from './AITrigger'

const { I18n } = window
const { enhance_with_ai_enabled } = window.PsyGlobalState.features

const AI_ACTIONS = [
  {
    id: 'fix_grammar',
    label: 'Fix Grammar',
    icon: <EditOutlined />,
  },
  {
    id: 'concise',
    label: 'Concise',
    icon: <ScissorOutlined />,
  },
  {
    id: 'formal',
    label: 'Formal',
    icon: <IdcardOutlined />,
  },
  {
    id: 'translate',
    label: 'Translate',
    icon: <GlobalOutlined />,
    option_type: 'language',
    options: I18n.availableLocales.map(
      locale => ({ id: I18n.t(`languages.${locale}`), label: I18n.t(`languages.${locale}`) }),
    ),
  },
]

const AIToolbar: React.FC<AIToolbarProps> = ({ enabled = true, withSpellchecker = false }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const allowEnhanceWithAi = enhance_with_ai_enabled && enabled

  const [view, setView] = useState<'menu' | 'loading' | 'result'>('menu')
  const [assistantOutput, setAssistantOutput] = useState<AssistantOutput>({ result: '' })
  const [error, setError] = useState<string | null>(null)

  const [lastAction, setLastAction] = useState<object | null>(null)
  const [lastOption, setLastOption] = useState<string | null>(null)
  const editors = useAIEditors(enabled)

  const handleClose = () => {
    setVisible(false)
    setView('menu')
    setError(null)
  }

  const { visible, setVisible, selectionData } = useSelectionDetection(
    containerRef, allowEnhanceWithAi, handleClose,
  )

  useToolbarPosition(containerRef, selectionData, visible)

  const { collectionAction } = useResources('writing_assistants')

  const generateResult = async (action, option: string | null = null) => {
    setView('loading')
    setLastAction(action)
    setLastOption(option)

    const payload = {
      operation: action.id,
      options: {},
      context: {},
      text: selectionData?.text,
    }

    if (option) {
      payload.options[action.option_type] = option
    }

    try {
      const result = await collectionAction({
        action: 'assist',
        method: 'post',
        body: payload,
      }) as AssistantOutput
      setAssistantOutput(result)
    } catch (error) {
      setError(error?.base[0]?.detail || 'Something went wrong')
      setAssistantOutput({ result: '' })
    } finally {
      if (visible) setView('result')
    }
  }

  const handleTryAgain = () => {
    if (lastAction) {
      generateResult(lastAction, lastOption)
    }
  }

  const handleReplace = () => {
    if (!selectionData) return

    if (selectionData.type === 'input' && selectionData.element) {
      const { element, start, end } = selectionData

      const newValue = element.value.substring(0, start)
      + assistantOutput.result
      + element.value.substring(end)

      element.value = newValue

      const inputEvent = new Event('input', { bubbles: true })
      element.dispatchEvent(inputEvent)

      const newPos = start + assistantOutput.result.length
      element.setSelectionRange(newPos, newPos)
      element.focus()
    } else if (selectionData.type === 'range' && selectionData.range) {
      const { range } = selectionData
      range.deleteContents()
      range.insertNode(document.createTextNode(assistantOutput.result))
    }

    handleClose()
    message.success(I18n.t('admin.toolbar_text_replaced'))
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(assistantOutput.result)
    message.success(I18n.t('admin.toolbar_text_copied'))
  }

  const menuItems: MenuProps['items'] = useMemo(() => AI_ACTIONS.map((action) => {
    if (!action.options) {
      return {
        key: action.id,
        icon: action.icon,
        label: action.label,
      }
    }

    return {
      key: action.id,
      icon: action.icon,
      label: action.label,
      children: action.options.map(opt => ({
        key: `${action.id}::${opt.id}`,
        label: opt.label,
      })),
      popupClassName: styles.subMenu,
      popupOffset: [0, 0],
    }
  }), [])

  const onMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key.includes('::')) {
      const [actionId, optionId] = key.split('::')
      const action = AI_ACTIONS.find(a => a.id === actionId)
      if (action) generateResult(action, optionId)
    } else {
      const action = AI_ACTIONS.find(a => a.id === key)
      if (action) generateResult(action)
    }
  }

  if (!allowEnhanceWithAi) return null

  return (
    <>
      {editors.map((editorContainer, index) => (
        <AITrigger
          key={index}
          container={editorContainer}
          withSpellchecker={withSpellchecker}
        />
      ))}
      {visible
     && (
       <div
         ref={containerRef}
         className={`${styles.aiFloatingContainer} ${visible ? styles.visible : ''}`}
         onMouseDown={(e) => {
           e.preventDefault()
           e.stopPropagation()
         }}
       >
         <div className={
       `${styles.aiCard} ${(view === 'result' || view === 'loading')
         ? styles.resultContainer : ''} ${view === 'loading' ? styles.loading : ''}`
       }
         >
           {view === 'menu' && (
             <Menu
               mode="vertical"
               items={menuItems}
               onClick={onMenuClick}
               selectable={false}
               triggerSubMenuAction="hover"
               style={{ border: 'none', width: '100%' }}
             />
           )}
           {view === 'loading' && (
             <>
               <Spin />
               <Typography.Text style={{ marginLeft: 8 }}>
                 {I18n.t('admin.toolbar_result_generating')}
               </Typography.Text>
             </>
           )}
           {view === 'result' && (
             <Result
               handleClose={handleClose}
               assistantOutput={assistantOutput}
               handleCopy={handleCopy}
               handleReplace={handleReplace}
               handleTryAgain={handleTryAgain}
               error={error}
             />
           )}
         </div>
       </div>
     )
}
    </>
  )
}


export default AIToolbar
