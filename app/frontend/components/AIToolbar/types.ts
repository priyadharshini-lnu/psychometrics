import { TextSelection } from '~/hooks/useInputsTextSelection'
import { FroalaTextSelection } from '~/hooks/useFroalaTextSelection'

export type AssistantOutput = {
  result: string
  whatChangedAndWhy?: string
  suggestions?: string[]
}

export interface AIProcessorProps {
  visible: boolean
  onClose: () => void
  onProcessingStateChange?: (isProcessing: boolean) => void
  operations?: AIOperation[] | null
  selectionData?: TextSelection | FroalaTextSelection | null
}


export interface AIAction {
  id: string
  option_type?: string
}

export interface AIOperation {
  type: 'translate' | 'fix_grammar' | 'concise' | 'tone'
  options?: {
    language?: string
    target_word_count?: number
    tone?: string
    [key: string]: string | number | undefined
  }
}

export interface ProcessingState {
  view: 'idle' | 'loading' | 'result'
  assistantOutput: AssistantOutput
  error: string | null
  lastAction: AIAction | null
  lastOption: string | null
}

export interface ToolbarAction {
  key: string
  label: string
  icon: React.ReactNode
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FroalaEditorInstance = any
