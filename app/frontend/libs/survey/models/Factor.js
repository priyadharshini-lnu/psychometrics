import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import SubFactorList from 'store/SubFactorList'
import ScoringList from 'store/ScoringList'

const Factor = function (attrs = {}) {
  this.id = attrs.id
  this.name = attrs.name
  this.subFactors = new SubFactorList(this, attrs.sub_factors || [])
  this.setScoring(attrs.scoring)
}

Factor.prototype = new EventEmitter()

_.extend(Factor.prototype, {
  toJSON () {
    return {
      id: this.id,
      name: this.name,
    }
  },

  getName () {
    return this.name
  },

  setScoring (scoring) {
    this.scoring = new ScoringList(this, scoring || [])
  },
})

export default Factor
