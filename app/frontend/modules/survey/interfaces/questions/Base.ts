/**
 * @template P Question props
 * @template MC Module config
 * @template AG Validation arguments
 */
export interface BaseBuilderModel<
  P = {},
  MC = {},
  AG = Record<string, number | string>
> extends BaseModel<P, MC, AG> {
  update(): void
  changeArrayProps(
    { collection, i, val }: { collection: string; i: number; val: unknown },
    undo?: boolean
  ): void
  changeProps(props: Partial<P & BaseProps>): void
}

/**
 * @template P Question props
 * @template MC Module config
 * @template AG Validation arguments
 */
export interface BasePropertiesModel<
  P = {},
  MC = {},
  AG = Record<string, number | string>
> extends BaseModel<P, MC, AG> {
  update: () => void
  changeArrayProps(
    { collection, i, val }: { collection: string; i: number; val: unknown },
    undo?: boolean
  ): void
  changeReqValidations: (
    newProps: {
      enabled?: boolean
      type?: string
    },
    undo?: boolean
  ) => void
  changeProps(props: Partial<P & BaseProps>): void
  resetDefaultValues(): void
  setChoices(val: number, undo?: boolean): void
  setFormFields(val: number): void
}

/**
 * @template P Question props
 * @template MC Module config
 * @template AG Validation arguments
 */
export interface BasePreviewModel<
  P = {},
  MC = {},
  AG = Record<string, number | string>
> extends BaseModel<P, MC, AG> {}

/**
 * @template P Question props
 * @template MC Module config
 * @template AG Validation arguments
 */
interface BaseModel<P = {}, MC = {}, AG = Record<string, number | string>> {
  id: number
  block_id: number
  name: string
  position: number
  type: QuestionTypes
  validation: {
    type: string
    args: AG
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
  choices: number
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
  | 'SideBySide'
  | 'MatrixTable'

export interface Answers {
    [index: number|string]: { value: string }
  }
