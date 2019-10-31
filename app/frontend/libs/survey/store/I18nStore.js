import _ from 'lodash'
import { EventEmitter } from 'fbemitter'

let { I18n } = window
if (I18n) {
  I18n.fallbacks = true
} else {
  I18n = {
    t (code) {
      return code
    },
  }
}
// Template Structure
//
// {
//  question: {
//    456: {
//      questionText: 'translate TITLE',
//      choicesTexts1: 'translated one',
//      choicesTexts3: 'translated three:haha',
//      scalePointsTexts1: 'sc translated one',
//      scalePointsTexts3: 'sc translated three',
//      answersTexts1_2: 'my answer 1_1',
//      answersTexts2_2: 'my answer 2_2',
//      text2: 'GROUP 2',
//      labelsTexts1: 'LABEL 1',
//      labelsTexts2: 'LABELlittle 2',
//      tellUsText: 'tellUsText',
//      categoriesT1ext: 'categoriesText',
//      categoriesDataText1_2: 'categoriesDataText1_2',
//      categoriesDataText2_2: 'categoriesDataText2_2',
//      customValidation: '111111'
//    }
//  }
// }
const I18nStore = function () {
  this.isNeedToFloatToRight = false
  this.locales = null
}

I18nStore.prototype = new EventEmitter()

_.extend(I18nStore.prototype, {
  t (code, data) {
    return I18n.t(code, data)
  },
  pageNeedToFloatRight () {
    I18n.isNeedToFloatToRight = true
  },

  setLocale (locale) {
    if (locale) {
      I18n.locale = locale
    }
  },

  tQuestion (question, field, extraData) {
    question.isNeedToAddLtrManually = false
    question.isAnyArabicTranslateExist = true

    if (this.locales && this.locales.question && this.locales.question[question.id]) {
      if (this.locales.question[question.id][field]) {
        question.isNeedToAddLtrManually = false
        question.isAnyArabicTranslateExist = true
        return this.locales.question[question.id][field]
      }
    }
    if (question.id) {
      question.isNeedToAddLtrManually = true
      this.pageNeedToFloatRight()
    }

    return question.tDefault(field, extraData)
  },

  tCustomValidation (question) {
    if (this.locales && this.locales.question && this.locales.question[question.id]) {
      if (this.locales.question[question.id].customValidationText) {
        return this.locales.question[question.id].customValidationText
      }
    }
    return question.validation.message
  },
})

export default new I18nStore()
