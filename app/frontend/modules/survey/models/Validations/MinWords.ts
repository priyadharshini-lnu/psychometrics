import wordsCount from 'words-count'

import { Question } from '~/modules/survey/core/preview/FlowProcessor/interfaces'

import { I18n } from '~/modules/survey/store/StoreWatchman'
import { getAnswersByLength, getValidationKey, isRichTextTextEntryQuestion } from '~/modules/survey/utils/question'

class MinWords {
  minLength: number

  question: Question

  constructor (
    { minLength }: { minLength: number | string },
    question: Question,
  ) {
    this.minLength = parseInt(`${minLength}`, 10)
    this.question = question
  }

  validate (answers: { message: string }, richTextEditorAnswerWordCount) {
    const wordCount = isRichTextTextEntryQuestion(this.question)
      ? richTextEditorAnswerWordCount : wordsCount(getAnswersByLength(this.question, answers).shortest)

    if (wordCount < this.minLength) {
      return {
        type: 'MinWords',
        message: I18n().t(`${getValidationKey(this.question)}.min_word`, {
          min: this.minLength,
        }),
      }
    }
    return null
  }
}

export default MinWords
