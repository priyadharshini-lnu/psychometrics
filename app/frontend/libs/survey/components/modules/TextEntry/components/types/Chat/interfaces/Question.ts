import { Message } from './index'

export default interface Question {
  props: QuestionProps
  changeProps: (value: object) => void
  result: Result
}

interface QuestionProps {
  messageList: Message[]
  title: string
  titleDescription: string
  managerName: string
  choices: number
}

interface Result {
  answer: (...args) => void
  answers: Answer[]
}

interface Answer {
  value: string
  index: number
}
