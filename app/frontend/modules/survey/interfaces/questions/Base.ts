export interface BaseBuilderModel extends BaseModel, ModelProps<BaseProps> {
  update: () => void
}

export interface BasePropertiesModel extends BaseModel, ModelProps<BaseProps> {
  update: () => void
  changeReqValidations: (
    newProps: {
      enabled?: boolean
      type?: string
    },
    undo?: boolean
  ) => void
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface BasePreviewModel extends BaseModel, ModelProps<BaseProps> {}

interface BaseModel {
  id: number
  block_id: number
  name: string
  position: number
  type: QuestionTypes
  validation: {
    type: string
    args: Record<string, number | string>
  }
  requiredValidation: {
    enabled: boolean
    type: string
  }
  moduleConfig: {
    validations: boolean
  }
}

export interface ModelProps<T> {
  props: T
}

export interface ChangeProps<T> {
  changeProps(props: Partial<T>): void
}

export interface BaseProps {
  questionText: string
  type: string
}

type QuestionTypes =
  | 'AudioResponse'
  | 'TextEntry'
  | 'VideoResponse'
  | 'SingleAnswer'
  | 'MultipleAnswer'
  | 'Dropdown'
  | 'SelectBox'
  | 'MultiSelectBox'
