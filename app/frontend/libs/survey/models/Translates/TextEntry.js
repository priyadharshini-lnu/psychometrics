import _ from 'lodash'
import BaseTranslate from './BaseTranslate'

class TextEntry extends BaseTranslate {
  getValueByCode (field, extraData) {
    if (field === 'questionText') {
      return this.question.props.questionText
    }
    if (/^choicesTexts/.test(field)) {
      return this.question.props.choicesTexts[extraData.choice]
    }
    if (['title', 'titleDescription', 'managerName'].includes(field)) {
      return this.question.props[field]
    }
    if (/^messageText/.test(field)) {
      return this.question.props.messageList.find(m => m.position === extraData.position).text
    }
  }

  exportLocales () {
    let result = {
      questionText: this.question.props.questionText,
    }
    if (this.question.props.type !== 'Chat') {
      _.times(this.question.props.choices, (i) => {
        result[`choicesTexts${i + 1}`] = this.question.props.choicesTexts[i]
      })
      return result
    }

    result = {
      ...result,
      title: this.question.props.title,
      titleDescription: this.question.props.titleDescription,
      managerName: this.question.props.managerName,
    }

    // eslint-disable-next-line arrow-body-style
    return this.question.props.messageList.reduce((res, { position, text }) => {
      return { ...res, [`messageText${position}`]: text }
    }, result)
  }
}

export default TextEntry
