import { ContactType } from './Email'

export default interface Question {
  id: number
  props: QuestionProps
  changeProps: (value: object) => void
  changeArrayProps: ({ collection, i, val }: {collection: string, i: number, val: string }, undo: boolean) => void
  result: Result
}

interface QuestionProps {
  title: string
  titleDescription: string
  subject: string
  contacts: { [key in ContactType]: string[] }
  maxLength?: number
  contactList: string[]
}

interface Result {
  answer: (...args) => void
  answers: Answer
  validate(): []
}

interface Answer {
  to: string[]
  cc: string[]
  bcc: string[]
  subject: string
  message: string
}
