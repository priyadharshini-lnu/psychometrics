import { Question } from '~/modules/survey/core/preview/FlowProcessor/interfaces'
import { EmailTextEntryAnswer } from '~/modules/survey/interfaces/questions/TextEntry'
import { CampaignFactorModel } from '~/modules/survey/interfaces/questions/CampaignFactorFeedback'
import { Answers } from '~/modules/survey/interfaces/questions/Base'

interface AnswersLength {
  shortest: string
  longest: string
}

const getLongestAndShortest = (answers) => {
  if (answers.length === 0) {
    return {
      shortest: '',
      longest: '',
    }
  }

  let shortest = answers[0].value
  let longest = answers[0].value

  answers.forEach((answer) => {
    if (answer.value.length < shortest.length) {
      shortest = answer.value
    }

    if (answer.value.length > longest.length) {
      longest = answer.value
    }
  })

  return { shortest, longest }
}

export const getAnswersByLength = (question: Question,
  answers: EmailTextEntryAnswer | Answers |CampaignFactorModel[]): AnswersLength => {
  if (isEmailTextEntryQuestion(question)) {
    const answer = (answers as EmailTextEntryAnswer).message || ''
    return ({
      shortest: answer,
      longest: answer,
    })
  }
  if (question.type === 'CampaignFactorFeedback') {
    return getLongestAndShortest(answers)
  }

  return ({
    shortest: (answers as Answers)[0].value,
    longest: (answers as Answers)[0].value,
  })
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

export const isMediaResponseQuestion = (question: Question) => (
  ['FileUpload', 'AudioResponse', 'VideoResponse'].includes(question.type as string)
)

export const isRichTextTextEntryQuestion = (question: Question): boolean => (
  question.type === 'TextEntry' && question.props.type === 'RichText'
)

export const isMandatory = (question: Question) => (
  question.required_validation
    && question.required_validation.enabled
    && question.required_validation.type === 'Force'
)
