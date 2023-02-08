import wordsCount from 'words-count'

import { Question } from '~/modules/survey/core/preview/FlowProcessor/interfaces'

import { I18n } from '~/modules/survey/store/StoreWatchman'
import { getAnswer, getValidationKey } from '~/modules/survey/utils/question'

class WordsRange {
  minLength: number

  maxLength: number

  question: Question

  constructor (
    {
      minLength,
      maxLength,
    }: { minLength: number | string; maxLength: number | string },
    question: Question,
  ) {
    this.minLength = +minLength
    this.maxLength = +maxLength
    this.question = question
  }

  validate (answers: { message: string }) {
    const answerLength = wordsCount(getAnswer(this.question, answers))

    if (answerLength < this.minLength || answerLength > this.maxLength) {
      return {
        type: 'WordsRange',
        message: I18n().t(`${getValidationKey(this.question)}.word_range`, {
          min: this.minLength,
          max: this.maxLength,
        }),
      }
    }
    return null
  }
}

export default WordsRange
