import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import TextConditionTypes from './TextConditionTypes'

const TextCondition = function (attrs = {}, collection) {
  this.type = attrs.type
  this.setProps(attrs.props)
  this.collection = collection
}

TextCondition.prototype = new EventEmitter()

_.extend(TextCondition.prototype, {
  setProps (props) {
    this.props = props || {}
  },

  toJSON () {
    return {
      type: this.type,
      props: this.props,
    }
  },

  isFilled () {
    if (!this.type) return false

    const Type = TextConditionTypes[this.type]
    if (!Type) return false
    const type = new Type(this, this.collection.module.assessment_id)
    return type.isFilled()
  },

  isValid () {
    if (this.type) {
      const Type = TextConditionTypes[this.type]
      if (!Type) {
        throw new Error(`Create type ${this.type}. Path /models/TextConditionTypes`)
      }
      const type = new Type(this, this.collection.module.assessment_id)
      return type.isValid()
    }
    return false
  },

  getType () {
    if (this.type === 'Scoring') return 'Factor'

    return this.type
  },

})

export default TextCondition
