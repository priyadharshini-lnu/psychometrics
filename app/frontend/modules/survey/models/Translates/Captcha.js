import BaseTranslate from './BaseTranslate'

class Captcha extends BaseTranslate {
  getValueByCode (field) {
    if (field === 'questionText') {
      return this.question.props.questionText
    }
  }

  exportLocales () {
    return {
      questionText: this.question.props.questionText,
    }
  }
}

export default Captcha
