export interface BaseBuilderModel extends BaseModel, ModelProps<BaseProps> {
  update(): void
  changeArrayProps(
    { collection, i, val }: { collection: string; i: number; val: string },
    undo?: boolean
  ): void
  moduleConfig: {
    validations: boolean
    defaultChoiceText: (i: number) => string
  }
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
  moduleConfig: {
    validations: boolean
  }
}

export interface BasePreviewModel extends BaseModel, ModelProps<BaseProps> {
  moduleConfig: {
    validations: boolean
  }
}

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
