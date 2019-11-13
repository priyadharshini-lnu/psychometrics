import _ from 'lodash'
import { EventEmitter } from 'fbemitter'

const FilterCondition = function (attrs = {}) {
  this.type = attrs.type
  this.setProps(attrs.props)
}

FilterCondition.prototype = new EventEmitter()

_.extend(FilterCondition.prototype, {
  setProps (props) {
    this.props = props || {}
  },

  toJSON () {
    return {
      type: this.type,
      props: this.props,
    }
  },
})

export default FilterCondition
