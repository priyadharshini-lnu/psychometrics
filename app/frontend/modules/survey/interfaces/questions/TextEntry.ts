import { BaseBuilderModel, BasePropertiesModel, BasePreviewModel } from './Base'

export interface BuilderModel extends BaseBuilderModel<Props, ModuleConfig> {}

export interface PropertiesModel extends BasePropertiesModel<Props> {}

export interface PreviewModel extends BasePreviewModel<Props, ModuleConfig> {
  choicesIds: Array<number>
  result: {
    answer(...args: unknown[]): void
    answers: Array<{
      value: string
      index: number
    }>
    setRichTextEditorAnswerWordCount: (count: number) => void
  }
}

interface Props {
  choices: number
  choicesTexts: Array<string>
  formTypes: Array<{
    name: 'Input' | 'TextArea' | 'Checkbox' | 'Select' | 'MultiSelect' | 'Date'
    optionList?: string[] | { [key: string]: string }
    dateFormat?: DateFormat
  }>
  allowDictation: boolean
  dateFormat: DateFormat
  maxLength: number | null
  contactList: string[]
  subject: string
  contacts: { [key in EmailContactType]: string[] }
  messageList: Array<{
    text: string
    position: number
    type: 'mine' | 'their'
  }>
  managerName: string
  title: string
  titleDescription: string
  predefinedRichText?: string
  usePredefinedRichText?: boolean
  type:
    | 'Form'
    | 'Chat'
    | 'SingleLine'
    | 'MultiLine'
    | 'EssayTextBox'
    | 'RichText'
    | 'Email'
    | 'Password'
    | 'DateEntry'
    | 'DateTimeEntry'
    | 'TimeEntry'
}

export enum DateFormat {
  'DD-MM-YYYY' = 'DD-MM-YYYY',
  'YYYY-MM-DD' = 'YYYY-MM-DD',
  'MM-YYYY' = 'MM-YYYY',
  'YYYY-MM' = 'YYYY-MM',
  'YYYY' = 'YYYY'
}

interface ModuleConfig {
  defaultChoiceText: (i: number) => string
}

type EmailContactType = 'to' | 'cc' | 'bcc'

export interface EmailTextEntryAnswer {
  message: string
}
