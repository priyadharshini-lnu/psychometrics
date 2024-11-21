import wordsCount from 'words-count'

import { Question } from '~/modules/survey/core/preview/FlowProcessor/interfaces'

import { I18n } from '~/modules/survey/store/StoreWatchman'
import { getAnswersByLength, getValidationKey, isRichTextTextEntryQuestion } from '~/modules/survey/utils/question'

class MaxWords {
  maxLength: number

  question: Question

  constructor (
    { maxLength }: { maxLength: number | string },
    question: Question,
  ) {
    this.maxLength = parseInt(`${maxLength}`, 10)
    this.question = question
  }

  validate (answers: { message: string }, richTextEditorAnswerWordCount) {
    const wordCount = isRichTextTextEntryQuestion(this.question)
      ? richTextEditorAnswerWordCount : wordsCount(getAnswersByLength(this.question, answers).shortest)
    if (wordCount > this.maxLength) {
      return {
        type: 'MaxWords',
        message: I18n().t(`${getValidationKey(this.question)}.max_word`, {
          max: this.maxLength,
        }),
      }
    }
    return null
  }
}

export default MaxWords
