import BaseTranslate from './BaseTranslate'
import Types from './TableTypes'

class Text extends BaseTranslate {
  getValueByCode (field, extraData) {
    if (/^textConditions/.test(field)) {
      if (this.module.props.textConditions[extraData.condition]) {
        return this.module.props.textConditions[extraData.condition][extraData.type || 'text']
      }
      return ''
    }
  }

  exportLocales () {
    const Type = Types[this.module.props.type]
    if (!Type) { throw new Error(`Add Translate module for Table with type: ${this.module.props.type}`) }
    const type = new Type(this.module)
    return type.exportLocales()
  }
}

export default Text
