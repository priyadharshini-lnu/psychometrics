import Utils from '~/modules/survey/utils/Utils'

interface QuestionInterface {
    name: string
    props: {
        questionText?: string
    }
}

const Question = {
  getName (question: QuestionInterface, maxLength?: number): string {
    const text = `${question.name} ${Utils.stripHTML(question.props.questionText)}`
    if (maxLength) return text.substring(0, maxLength)

    return text
  },
}

export default Question
