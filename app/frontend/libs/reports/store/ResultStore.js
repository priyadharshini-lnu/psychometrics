import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import Result from 'rb/models/Result'
import AppStore from './AppStore'

const ResultStore = function () {
  this.results = {}
}

ResultStore.prototype = new EventEmitter()

_.extend(ResultStore.prototype, {
  setResults (resultGroups, user, assessmentIds, campaign = {}) {
    _.each(assessmentIds, (id) => {
      this.results[id] = new Result(id)
    })

    this.user = JSON.parse(user)
    this.campaignDetails = JSON.parse(campaign)
    _.each(resultGroups, (results, assessmentId) => {
      this.results[assessmentId].init(results, this.user, AppStore.report.filters)
    })
    this.realResults = true
  },

  setMockResults (assessmentId, sourceType, sourceModel, factors = []) {
    this.results[assessmentId] = new Result(assessmentId)
    this.results[assessmentId].setMockData(sourceType, sourceModel, factors)
  },

  reset () {
    this.results = {}
  },

})

export default new ResultStore()
