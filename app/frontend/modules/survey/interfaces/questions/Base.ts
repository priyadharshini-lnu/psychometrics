export interface BaseBuilderModel<P = {}, MC = {}> extends BaseModel<P, MC> {
  update(): void
  changeArrayProps(
    { collection, i, val }: { collection: string; i: number; val: string },
    undo?: boolean
  ): void
  changeProps(props: Partial<P & BaseProps>): void
}

export interface BasePropertiesModel<P = {}, MC = {}> extends BaseModel<P, MC> {
  update: () => void
  changeReqValidations: (
    newProps: {
      enabled?: boolean
      type?: string
    },
    undo?: boolean
  ) => void
  changeProps(props: Partial<P & BaseProps>): void
}

export interface BasePreviewModel<P = {}, MC = {}> extends BaseModel<P, MC> {}

interface BaseModel<P = {}, MC = {}> {
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
  } & MC
  props: BaseProps & P
}

interface BaseProps {
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
