import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import SubFactor from 'models/SubFactor'

const SubFactorList = function (factor, subFactors) {
  this.list = []
  if (subFactors.length) {
    this.load(subFactors, factor)
  }
}

SubFactorList.prototype = new EventEmitter()

_.extend(SubFactorList.prototype, {
  load (data, parent) {
    _.each(data, (factor) => {
      this.list.push(new SubFactor(factor, parent))
    })
    this.emit('change')
  },
})

export default SubFactorList
