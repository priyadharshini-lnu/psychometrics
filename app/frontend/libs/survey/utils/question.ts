import { Question } from 'libs/survey/core/preview/FlowProcessor/interfaces'

interface Answer {
  message: string
}

interface Answers {
  [index: number]: { value: string }
}

export const getAnswer = (question: Question, answers: Answer | Answers): string => {
  if (isEmailTextEntryQuestion(question)) {
    return (answers as Answer).message || ''
  }

  return (answers as Answers)[0].value
}

export const getValidationKey = (question: Question): string => {
  if (isEmailTextEntryQuestion(question)) {
    return 'validations.TextEntry.Email'
  }

  return 'validations'
}

export const isEmailTextEntryQuestion = (question: Question): boolean => (
  question.type === 'TextEntry' && question.props.type === 'Email'
)
