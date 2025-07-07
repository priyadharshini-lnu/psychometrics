import { BaseBuilderModel, BasePropertiesModel, BasePreviewModel } from './Base'

export interface BuilderModel extends BaseBuilderModel<Props, ModuleConfig> {}
export const NOT_APPLICABLE = 'not_applicable'

export interface PropertiesModel
  extends BasePropertiesModel<Props, ModuleConfig> {
  setChoices(choice: number): void
  resetDefaultValues(): void
}

export interface PreviewModel extends BasePreviewModel<Props, ModuleConfig> {
  result: {
    question_id: number
    answer(selected: number, value?: boolean): void
    answers: Array<{ level: number; value: boolean }>
    notApplicable: boolean
    reduxAnswer(): void
  }
}

interface proficiencyLevel {
  name: string
  level: number
  description: string
  }

interface Props {
  proficiencyLevels: Array<proficiencyLevel>
  skillName: string
  skillDescription: string
  notApplicableLabel?: string
  notApplicable?: boolean
}

interface ModuleConfig {}
