import _ from 'lodash'
import BaseTranslate from './BaseTranslate'
import exportLocalesByType from './exportLocalesByType'

class TextEntry extends BaseTranslate {
  getValueByCode (field, extraData) {
    if (field === 'questionText') {
      return this.question.props.questionText
    }
    if (/^choicesTexts/.test(field)) {
      return this.question.props.choicesTexts[extraData.choice]
    }
    if (['title', 'titleDescription', 'managerName', 'subject'].includes(field)) {
      return this.question.props[field]
    }
    if (/^messageText/.test(field)) {
      return this.question.props.messageList.find(m => m.position === extraData.position).text
    }
    if (/^contact/.test(field)) {
      return this.question.props.contactList[extraData.index]
    }
    if (/^formOptionText/.test(field)) {
      const { optionList } = this.question.props.formTypes[extraData.typeIndex]
      if (Array.isArray(optionList)) {
        const option = optionList[extraData.i]
        return option
      }
      const entries = Object.entries(optionList || {})
      if (entries[extraData.i]) {
        return entries[extraData.i][1]
      }
    }
  }

  exportLocales () {
    const result = {
      questionText: this.question.props.questionText,
    }

    const exportLocales = exportLocalesByType[this.question.type][this.question.props.type]
    if (exportLocales) {
      return exportLocales(this.question.props, result)
    }

    _.times(this.question.props.choices, (i) => {
      result[`choicesTexts${i + 1}`] = this.question.props.choicesTexts[i]
    })
    return result
  }
}

export default TextEntry
