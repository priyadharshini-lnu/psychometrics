import { BaseBuilderModel, BasePropertiesModel, BasePreviewModel } from './Base'

export interface BuilderModel extends BaseBuilderModel<Props, ModuleConfig> {}

export interface PropertiesModel
  extends BasePropertiesModel<Props, ModuleConfig> {
  setChoices(choice: number): void
  resetDefaultValues(): void
}

export interface FactorModel {
  id: number
  name: string
}

export interface PreviewModel extends BasePreviewModel<Props, ModuleConfig> {
  isNeedToAddLtrManually: boolean
  choicesIds: number[]
  result: {
    question_id: number
    answer(selected: number, value?: boolean): void
    answers: number[]
    notApplicable: boolean
    reduxAnswer(): void
  }
}

interface Props {}

interface ModuleConfig {
  moduleName: 'FactorSelect'
  defaultChoiceText(index: number): string
  validations: boolean
  randomization: boolean
  defaultValue: boolean
  scoring: boolean
}
