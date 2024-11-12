import wordsCount from 'words-count'

import { Question } from '~/modules/survey/core/preview/FlowProcessor/interfaces'

import { I18n } from '~/modules/survey/store/StoreWatchman'
import { getAnswersByLength, getValidationKey, isRichTextTextEntryQuestion } from '~/modules/survey/utils/question'

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

  validate (answers: { message: string }, richTextEditorAnswerWordCount) {
    let shortestAnswerLength = richTextEditorAnswerWordCount
    let longestAnswerLength = richTextEditorAnswerWordCount
    if (!isRichTextTextEntryQuestion(this.question)) {
      shortestAnswerLength = wordsCount(getAnswersByLength(this.question, answers).shortest)
      longestAnswerLength = wordsCount(getAnswersByLength(this.question, answers).longest)
    }

    if (shortestAnswerLength < this.minLength || longestAnswerLength > this.maxLength) {
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
