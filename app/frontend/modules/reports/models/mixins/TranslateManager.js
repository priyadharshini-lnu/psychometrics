import Translates from '../QuestionsTranslates'

export default {

  tDefault (field, extraData) {
    const TranslateModule = Translates[this.type]
    if (!TranslateModule) { throw new Error(`Add Translate module for type: ${this.type}`) }
    const object = new TranslateModule(this)
    return object.getValueByCode(field, extraData)
  },

  exportLocales () {
    const TranslateModule = Translates[this.type]
    if (!TranslateModule) { throw new Error(`Add Translate module for type: ${this.type}`) }
    const object = new TranslateModule(this)
    return object.exportLocales()
  },
}
