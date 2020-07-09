import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import I18nStore from 'rb/store/I18nStore'
import TextCondition from './TextCondition'

const TextConditionCollection = function (attrs = {}, module) {
  this.id = attrs.id
  this.text = attrs.text
  this.styles = attrs.styles || {}
  this.module = module
  this.conditions = []
  if (attrs.conditions) {
    _.each(attrs.conditions, (condition) => {
      this.addCondition(condition)
    })
  }
}

TextConditionCollection.prototype = new EventEmitter()

_.extend(TextConditionCollection.prototype, {
  toJSON () {
    return {
      id: this.id,
      text: this.text,
      styles: this.styles,
      conditions: this.conditions,
    }
  },

  rename (val) {
    this.name = val
    this.sync()
  },

  addCondition (attrs) {
    this.conditions.push(new TextCondition(attrs, this))
  },

  sync () {
    this.model.sync()
  },

  /**
   * Return true, if all conditions return true
   */
  correctByFilter () {
    // TODO: implement logic
    return false
  },

  getFilledConditions () {
    return this.conditions.filter(condition => condition.isFilled())
  },

  isValid () {
    const conditions = this.getFilledConditions()
    if (!conditions.length) return false

    let isValid = true
    this.conditions.forEach((cond) => {
      if (cond.props.prefix === 'Or') {
        isValid = isValid || cond.isValid()
      } else {
        isValid = isValid && cond.isValid()
      }
    })
    return isValid
  },

  getTextByCondition (index) {
    if (!this.isValid()) return null

    return I18nStore.tModule(this.module, `textConditions${index + 1}`, { condition: index })
  },

  getStylesByCondition () {
    if (!this.isValid()) return null

    return this.styles
  },

})

export default TextConditionCollection
