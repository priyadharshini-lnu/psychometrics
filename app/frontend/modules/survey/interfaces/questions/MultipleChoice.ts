import { BaseBuilderModel, BasePropertiesModel, BasePreviewModel } from './Base'

export interface BuilderModel extends BaseBuilderModel<Props, ModuleConfig> {}

export interface PropertiesModel
  extends BasePropertiesModel<Props, ModuleConfig> {
  setChoices(choice: number): void
  resetDefaultValues(): void
}

export interface PreviewModel extends BasePreviewModel<Props, ModuleConfig> {
  isNeedToAddLtrManually: boolean
  choicesIds: number[]
  result: {
    question_id: number
    answer(selected: number, value?: boolean): void
    answers: Array<{ index: number; value: boolean }>
    notApplicable: boolean
    reduxAnswer(): void
  }
}

interface Props {
  position: 'Vertical' | 'Horizontal'
  notApplicable: boolean
  notApplicableLabel: string
  withImageChoice: boolean
  isImagePreviewEnable: boolean
  imageChoiceSize: 'xx-small' | 'x-small' | 'small' | 'medium' | 'large'
  choices: number
  choicesTexts: Array<string>
  choicesImages: Array<string>
}

interface ModuleConfig {
  moduleName: 'Multiple Choice'
  defaultChoiceText(index: number): string
  validations: boolean
  randomization: boolean
  defaultValue: boolean
  scoring: boolean
}
