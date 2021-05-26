import { BaseBuilderModel, BasePropertiesModel, BasePreviewModel } from './Base'

export interface BuilderModel extends BaseBuilderModel<Props, ModuleConfig> {}

export interface PropertiesModel
  extends BasePropertiesModel<Props, ModuleConfig> {
  setChoices(choice: number): void
  resetDefaultValues(): void
}

export interface PreviewModel extends BasePreviewModel<Props, ModuleConfig> {
  isNeedToAddLtrManually: boolean
}

interface Props {
  position: 'Vertical' | 'Horizontal'
  notApplicable: boolean
  notApplicableLabel: string
  withImageChoice: boolean
  isImagePreviewEnable: boolean
  imageChoiceSize: 'small' | 'medium' | 'large'
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
