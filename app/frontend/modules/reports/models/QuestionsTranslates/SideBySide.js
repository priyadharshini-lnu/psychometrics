import _ from 'lodash'
import BaseTranslate from './BaseTranslate'

class SideBySide extends BaseTranslate {
  getValueByCode (field, extraData) {
    if (field === 'questionText') {
      return this.question.props.questionText
    }
    if (/^choicesTexts/.test(field)) {
      return this.question.props.choicesTexts[extraData.choice]
    }
    if (/^answersTexts/.test(field)) {
      return this.question.props.columnsData[extraData.group].answersTexts[extraData.answer]
    }
    if (/^text/.test(field)) {
      return this.question.props.columnsData[extraData.group].text
    }
  }

  exportLocales () {
    const result = {
      questionText: this.question.props.questionText,
    }
    _.each(this.question.props.columnsData, (data, i) => {
      result[`text${i + 1}`] = data.text
      _.times(data.answers, (j) => {
        result[`answersTexts${i + 1}_${j + 1}`] = data.answersTexts[j]
      })
    })
    _.times(this.question.props.choices, (i) => {
      result[`choicesTexts${i + 1}`] = this.question.props.choicesTexts[i]
    })
    return result
  }
}

export default SideBySide
