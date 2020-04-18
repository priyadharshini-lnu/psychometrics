import _ from 'lodash'
import BaseTranslate from './BaseTranslate'

class RankOrder extends BaseTranslate {
  getValueByCode (field, extraData) {
    if (field === 'questionText') {
      return this.question.props.questionText
    }
    if (/^choicesTexts/.test(field)) {
      return this.question.props.choicesTexts[extraData.choice]
    }
    if (/^descriptionTexts/.test(field)) {
      return this.question.props.descriptionList[extraData.choice]
    }
  }

  exportLocales () {
    const result = {
      questionText: this.question.props.questionText,
    }
    _.times(this.question.props.choices, (i) => {
      result[`choicesTexts${i + 1}`] = this.question.props.choicesTexts[i]
      if (this.question.props.descriptionList[i]) {
        result[`descriptionTexts${i + 1}`] = this.question.props.descriptionList[i]
      }
    })
    return result
  }
}

export default RankOrder
