import { ContactType } from './Email'

export default interface Question {
  props: QuestionProps
  changeProps: (value: object) => void
  changeArrayProps: ({ collection, i, val }: {collection: string, i: number, val: string }, undo: boolean) => void
  result: Result
}

interface QuestionProps {
  title: string
  titleDescription: string
  maxLength?: number
  contactList: ContactType[]
}

interface Result {
  answer: (...args) => void
  answers: Answer
}

interface Answer {
  to: string[]
  cc: string[]
  bcc: string[]
  subject: string
  message: string
}
