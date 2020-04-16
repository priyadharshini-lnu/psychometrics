import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import Result from 'rb/models/Result'
import MockResults from 'rb/consts/MockResults'
import Scoring from 'libs/reports/models/Scoring'
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
    let keys; let
      mockLength
    switch (sourceType) {
      case 'Factor':
        keys = _.keys(MockResults[sourceType])
        mockLength = keys.length
        this.results[assessmentId].scoring = {}
        // fill scoring data
        _.each(factors, (factor, i) => {
          this.results[assessmentId].scoring[factor.id] = {
            results: _.map(MockResults[sourceType][keys[i % mockLength]].results, r => new Scoring(r)),
            name: factor.name,
          }
        })
        break
      case 'EmbeddedData':
        this.results[assessmentId].embeddedData[sourceModel.name] = MockResults[sourceType]
        break
      case 'ExternalFactor':
        this.results[assessmentId].externalScoring = (sourceModel || []).reduce((res, factor, index) => {
          const mockResults = MockResults[sourceType]
          res[factor] = mockResults[index % mockResults.length]
          return res
        }, {})
        break
      case 'DataSheet':
        this.results[assessmentId].dataSheet = (sourceModel || []).reduce((res, field, index) => {
          const mockResults = MockResults[sourceType]
          res[field] = mockResults[index % mockResults.length]
          return res
        }, {})
        this.results[assessmentId].groupedDataSheet = [this.results[assessmentId].dataSheet]
        break
      default:
        if (!this.results[assessmentId].questions) {
          this.results[assessmentId].questions = {}
        }
        this.results[assessmentId].questions[sourceModel.id] = MockResults[sourceType]
    }
  },

  reset () {
    this.results = {}
  },

})

export default new ResultStore()
