export type SelectionType = 'range' | 'input' | null

export type SelectionData =
  | {
      type: 'input'
      text: string
      element: HTMLInputElement | HTMLTextAreaElement
      start: number
      end: number
    }
  | {
      type: 'range'
      text: string
      html?: string
      range: Range
    }


export interface Rect {
  top: number
  left: number
  width: number
  height: number
}

export interface AIToolbarProps {
  enabled?: boolean;
  withSpellchecker?: boolean;
}

export type AssistantOutput = {
  result: string
  whatChangedAndWhy?: string
  suggestions?: string[]
}
