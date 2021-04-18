interface QuestionBase {
  id: number
  block_id: number
  name: string
  position: number
  type: QuestionTypes
  validation: {
    type: string
    args: Record<string, number | string>
  }
  requiredValidation: RequiredValidations
  moduleConfig: {
    validations: boolean
  }
  update: () => void
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface QuestionInBuilder extends QuestionBase {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface QuestionInPreview extends QuestionBase {}

export interface QuestionInProperties extends QuestionBase {
  changeReqValidations: (
    newProps: Partial<RequiredValidations>,
    undo?: boolean
  ) => void
  props: BaseQuestionProps
}

export interface BaseQuestionProps {
  questionText: string
  type: string
}

interface RequiredValidations {
  enabled: boolean
  type: string
}

type QuestionTypes = 'AudioResponse' | 'TextEntry'
