export default interface Question {
  name: string
  id: number
  props: QuestionProps
  changeProps: (value: object) => void
  changeArrayProps: ({ collection, i, val }: ChangeArrayArgs, undo: boolean) => void
  moduleConfig: ModuleConfig
  choicesIds: number[]
  result: Result
}

interface ChangeArrayArgs {
  collection: string
  i: number
  val: FormType | string
}
interface QuestionProps {
  choices: number
  formTypes: FormType[]
  choicesTexts: string[]
  moduleConfig: ModuleConfig
}

export interface FormType {
  name: string
  optionList?: string[] | { [key: string]: string }
}

interface ModuleConfig {
  defaultChoiceText: (i: number) => string
}

interface Result {
  answer: (...args) => void
  answers: Answer[]
}

interface Answer {
  value: string | string[]
  index: number
}
