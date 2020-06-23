import BaseTranslate from './BaseTranslate'
import Types from './GraphTypes'

class Graph extends BaseTranslate {
  getValueByCode (field) {
    return this.module.props[field]
  }

  exportLocales () {
    const Type = Types[this.module.props.type]
    if (!Type) { throw new Error(`Add Translate module for Table with type: ${this.module.props.type}`) }
    const type = new Type(this.module)
    return type.exportLocales()
  }
}

export default Graph
