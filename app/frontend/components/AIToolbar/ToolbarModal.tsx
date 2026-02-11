import { useRef, useState, useCallback } from 'react'
import {
  Button, Flex, Modal, Typography,
} from 'antd'
import { TextSelection } from '~/hooks/useInputsTextSelection'
import { FroalaTextSelection } from '~/hooks/useFroalaTextSelection'
import { AIEditorIcon } from '~/glint/icons'
import {
  EditOutlined, GlobalOutlined, ScissorOutlined, IdcardOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { AIOperation, ToolbarAction } from './types'
import AIProcessor from './AIProcessor'
import { ActionRenderer, ActionValue } from './ActionRenderer'
import { ICON_COLOR } from './InputWrappers'

const { I18n } = window

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  { key: 'fix_grammar', label: I18n.t('admin.fix_grammar'), icon: <EditOutlined /> },
  { key: 'concise', label: I18n.t('admin.concise'), icon: <ScissorOutlined /> },
  { key: 'tone', label: I18n.t('admin.tone'), icon: <IdcardOutlined /> },
  { key: 'translate', label: I18n.t('admin.translate'), icon: <GlobalOutlined /> },
]

const MODAL_RESPONSIVE_WIDTHS = {
  xs: '90%',
  sm: '80%',
  md: '70%',
  lg: '60%',
  xl: '50%',
  xxl: '40%',
}

interface ToolbarModalProps {
  visible: boolean
  selection: TextSelection | FroalaTextSelection | null
  onCancel: () => void
}

interface ActionValues {
  conciseCount: number | null
  translateLanguage: string
  tone: string
}

export function ToolbarModal ({ visible, selection, onCancel }: ToolbarModalProps) {
  const modalRefContainer = useRef<HTMLDivElement>(null)
  const [processorVisible, setProcessorVisible] = useState(false)
  const [operations, setOperations] = useState<AIOperation[] | null>(null)
  const [resetTrigger, setResetTrigger] = useState(0)

  const [selected, setSelected] = useState<Record<string, boolean>>({
    fix_grammar: false,
    concise: false,
    tone: false,
    translate: false,
  })

  const [actionValues, setActionValues] = useState<ActionValues>({
    conciseCount: null,
    translateLanguage: '',
    tone: '',
  })

  const handleToggle = useCallback((key: string, checked: boolean) => {
    setSelected(prev => ({ ...prev, [key]: checked }))
  }, [])

  const handleValueChange = useCallback((value: ActionValue) => {
    setActionValues(prev => ({ ...prev, ...value }))
  }, [])

  const buildOperations = (): AIOperation[] => {
    const ops: AIOperation[] = []
    if (selected.translate && actionValues.translateLanguage) {
      ops.push({ type: 'translate', options: { language: actionValues.translateLanguage } })
    }
    if (selected.fix_grammar) {
      ops.push({ type: 'fix_grammar' })
    }
    if (selected.concise) {
      ops.push(actionValues.conciseCount !== null
        ? { type: 'concise', options: { target_word_count: actionValues.conciseCount } }
        : { type: 'concise' })
    }
    if (selected.tone && actionValues.tone) {
      ops.push({ type: 'tone', options: { tone: actionValues.tone } })
    }
    return ops
  }

  const hasOperationSelected = selected.fix_grammar
    || selected.concise
    || selected.tone
    || selected.translate

  const handlePerform = () => {
    const ops = buildOperations()
    if (ops.length === 0) return
    setOperations(ops)
    setProcessorVisible(true)
    onCancel()
  }

  const handleCancel = () => {
    setSelected({
      fix_grammar: false, concise: false, tone: false, translate: false,
    })
    setActionValues({ conciseCount: null, translateLanguage: '', tone: '' })
    setResetTrigger(prev => prev + 1)
    onCancel()
  }

  return (
    <>
      <Modal
        title={I18n.t('admin.enhance_with_ai')}
        open={visible}
        width={MODAL_RESPONSIVE_WIDTHS}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            {I18n.t('shared.cancel')}
          </Button>,
          <Button
            key="perform"
            type="primary"
            onClick={handlePerform}
            icon={<AIEditorIcon style={{ fill: ICON_COLOR }} />}
            disabled={!hasOperationSelected}
          >
            {I18n.t('admin.enhance_with_ai')}
          </Button>,
        ]}
      >
        <Flex vertical style={{ width: '100%' }} ref={modalRefContainer}>
          <div style={{ border: '1px solid var(--light-grey-border)', padding: '8px', borderRadius: '4px' }}>
            <Typography.Text>{selection?.selectedText || ''}</Typography.Text>
            <Flex gap={12} wrap="wrap" className="mt24" justify="flex-end">
              {TOOLBAR_ACTIONS.map(action => (
                <ActionRenderer
                  key={action.key}
                  action={action}
                  checked={!!selected[action.key]}
                  onToggle={checked => handleToggle(action.key, checked)}
                  onValueChange={handleValueChange}
                  getPopupContainer={() => modalRefContainer.current || document.body}
                  resetTrigger={resetTrigger}
                />
              ))}
            </Flex>
          </div>
        </Flex>
      </Modal>
      <AIProcessor
        visible={processorVisible}
        onClose={() => setProcessorVisible(false)}
        operations={operations || []}
        selectionData={selection}
      />
    </>
  )
}
