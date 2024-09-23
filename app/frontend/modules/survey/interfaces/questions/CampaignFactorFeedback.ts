import { BaseBuilderModel, BasePropertiesModel, BasePreviewModel } from './Base'

export interface BuilderModel extends BaseBuilderModel<Props, ModuleConfig> {}

export interface PropertiesModel
  extends BasePropertiesModel<Props, ModuleConfig> {
  setChoices(choice: number): void
  resetDefaultValues(): void
}

export interface CampaignFactorModel {
  code: string
  value: string
}

export interface PreviewModel extends BasePreviewModel<Props, ModuleConfig> {
  isNeedToAddLtrManually: boolean
  choicesIds: number[]
  result: {
    question_id: number
    answer(data: CampaignFactorModel[]): void
    answers: CampaignFactorModel[]
    notApplicable: boolean
    reduxAnswer(): void
  }
}

interface Props {
  minFactors: string
  maxFactors: string
  skillLabel: string
  feedbackLabel: string
  factorLabel: string
}

interface ModuleConfig {
  moduleName: 'CampaignFactorFeedback'
  defaultChoiceText(index: number): string
  validations: boolean
  randomization: boolean
  defaultValue: boolean
  scoring: boolean
}
