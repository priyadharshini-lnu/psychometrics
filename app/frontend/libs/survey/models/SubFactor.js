import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import ScoringList from 'store/ScoringList'

const SubFactor = function (attrs = {}, parent) {
  this.id = attrs.id
  this.name = attrs.name
  this.parent = parent
  this.setScoring(attrs.scoring)
}

SubFactor.prototype = new EventEmitter()

_.extend(SubFactor.prototype, {
  toJSON () {
    return {
      id: this.id,
      name: this.name,
    }
  },

  getName () {
    return `${this.parent.name} - ${this.name}`
  },

  setScoring (scoring) {
    this.scoring = new ScoringList(this, scoring || [])
  },
})

export default SubFactor
