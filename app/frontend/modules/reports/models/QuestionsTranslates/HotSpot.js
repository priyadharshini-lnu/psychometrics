import _ from 'lodash'
import BaseTranslate from './BaseTranslate'

class HotSpot extends BaseTranslate {
  getValueByCode (field, extraData) {
    if (field === 'questionText') {
      return this.question.props.questionText
    }
    if (/^regionsNames/.test(field)) {
      return this.question.props.regionsNames[extraData.region]
    }
  }

  exportLocales () {
    const result = {
      questionText: this.question.props.questionText,
    }
    _.times(this.question.props.regionsNames, (i) => {
      result[`regionsNames${i + 1}`] = this.question.props.regionsNames[i]
    })
    return result
  }
}

export default HotSpot
