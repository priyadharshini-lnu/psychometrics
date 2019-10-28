import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import Scoring from 'models/Scoring'

const ScoringList = function (factor, scoringData) {
  this.list = []
  if (scoringData.length) {
    this.load(scoringData, factor)
  }
}

ScoringList.prototype = new EventEmitter()

_.extend(ScoringList.prototype, {
  load (data, factor) {
    _.each(data, (scoring) => {
      this.list.push(new Scoring(scoring, factor))
    })
    this.emit('change')
  },
})

export default ScoringList
