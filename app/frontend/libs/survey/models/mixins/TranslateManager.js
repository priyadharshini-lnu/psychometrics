import Translates from '../Translates'

export default {

  tDefault (field, extraData) {
    const TranslateModule = Translates[this.type]
    if (!TranslateModule) { throw new Error(`Add Translate module for type: ${this.type}`) }
    const object = new TranslateModule(this)
    return object.getValueByCode(field, extraData)
  },

  exportLocales () {
    if (this.type === 'PageBreak') return
    const TranslateModule = Translates[this.type]
    if (!TranslateModule) { throw new Error(`Add Translate module for type: ${this.type}`) }
    const object = new TranslateModule(this)
    const response = object.exportLocales()
    if (this.validation.message) {
      response.customValidationText = this.validation.message
    }
    return response
  },
}
