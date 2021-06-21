import { BaseBuilderModel, BasePropertiesModel, BasePreviewModel } from './Base'

export interface BuilderModel
  extends BaseBuilderModel<Props, ModuleConfig, ArgsValidation> {}

export interface PropertiesModel
  extends BasePropertiesModel<Props, ModuleConfig> {
    setChoices(choice: number): void
  }

export interface PreviewModel
  extends BasePreviewModel<Props, ModuleConfig, ArgsValidation> {
  choicesIds: Array<number>
  update(): void
  result: {
    questionId: number
    answers: Array<Answer>
    answer: (...args: unknown[]) => void
  }
}

interface Props {
  choices: number
  scalePoints: number
  choicesTexts: Array<string>
  rowDescriptions: Array<string>
  columnsData: Array<{
    type: 'Likert' | 'Text'
    likertType: 'SingleAnswer' | 'DropDown' | 'MultipleAnswer'
    textType: 'Short' | 'Medium' | 'Long' | 'Essay'
    text: string
    answers: number
    answersTexts: Array<string>
  }>
  hideHeaders: boolean
  repeatHeaders: 'None' | 'Middle' | 'Bottom' | 'Both' | 'All'
  isRowDescriptionEnabled: boolean
  questionText: string
  randomization: {
    type: 'No' | 'Yes'
  }
}

interface ModuleConfig {
  moduleName: 'Side by Side'
  defaultAnswerText(index: number): string
  defaultChoiceText(index: number): string
  defaultGroupText(index: number): string
  defaultColumn: Props['columnsData'][0]
  randomization: boolean
  defaultValue: boolean
  scoring: boolean
}

interface ArgsValidation {
  validation: {
    type: 'Custom' | 'None'
    args: {
      conditions: Array<{
        subject: number
        answer: string
        predicate:
          | 'Selected'
          | 'NotSelected'
          | 'Displayed'
          | 'NotDisplayed'
          | 'EqualTo'
          | 'NotEqualTo'
          | 'GreaterThen'
          | 'GreaterThenOrEqual'
          | 'LessThen'
          | 'LessThenOrEqual'
          | 'Empty'
          | 'NotEmpty'
          | 'Contains'
          | 'DoesNotContains'
          | 'MatchesRegexp'
        type: 'input'
      }>
    }
    message: string
  }
}

interface Answer {
  choice: number
  scale: number
  values: Array<{
    index: number
    value: string | boolean
  }>
}
