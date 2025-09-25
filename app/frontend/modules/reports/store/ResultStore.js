import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import Result from '~/modules/reports/models/Result'
import MockResults from '~/modules/reports/consts/MockResults'
import Scoring from '~/modules/reports/models/Scoring'
import AppStore from './AppStore'
import { CUSTOM_FACTOR_VALUE_FIELDS } from '~/modules/reports/consts/Report'

const ResultStore = function () {
  this.results = {}
  this.realResults = false
}

ResultStore.prototype = new EventEmitter()

_.extend(ResultStore.prototype, {
  setResults (resultGroups, user, assessmentIds, campaign = {}, userReportData = [],
    campaignFactorResults = [], campaignAiArtifactResults = []) {
    _.each(assessmentIds, (id) => {
      this.results[id] = new Result(id)
    })
    this.user = JSON.parse(user)
    this.userReportData = userReportData
    this.campaignFactorResults = campaignFactorResults
    this.campaignAiArtifactResults = campaignAiArtifactResults
    this.campaignDetails = JSON.parse(campaign)
    _.each(resultGroups, (results, assessmentId) => {
      this.results[assessmentId].init(results,
        this.user,
        AppStore.report.filters,
        [],
        this.userReportData,
        this.campaignFactorResults)
    })
    this.realResults = true
  },

  setMockResults (assessmentId, sourceType, sourceModel, factors = [], scoreType = null, valueType = null) {
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
            ..._.reduce(CUSTOM_FACTOR_VALUE_FIELDS, (res, field) => {
              res[field] = MockResults[sourceType][keys[i % mockLength]][field] || null
              return res
            }, {}),
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
      case 'SavilleFactor':
        this.results[assessmentId].externalScoring = (sourceModel || []).map((factorId, index) => {
          const mockResults = MockResults[sourceType]
          return {
            id: factorId,
            score_type: scoreType,
            value_type: valueType,
            score: mockResults[index % mockResults.length],
          }
        })
        break
      case 'DataSheet':
        this.results[assessmentId].dataSheet = (sourceModel || []).reduce((res, field, index) => {
          const mockResults = MockResults[sourceType]
          res[field] = mockResults[index % mockResults.length]
          return res
        }, {})
        this.results[assessmentId].groupedDataSheet = [this.results[assessmentId].dataSheet]
        break
      case 'CampaignFactors':
        this.results[assessmentId].campaignFactorResults = (sourceModel || []).reduce((res, field, index) => {
          const mockResults = MockResults[sourceType]
          res = [...res, {
            code: field,
            value: mockResults[index % mockResults.length],
          }]
          return res
        }, [])
        this.results[assessmentId].groupedCampaignFactors = [this.results[assessmentId].campaignFactorResults]
        break
      case 'ReportData':
        this.results[assessmentId].reportData = (sourceModel || []).reduce((res, field, index) => {
          const mockResults = MockResults[sourceType]
          res[field] = mockResults[index % mockResults.length]
          return res
        }, {})
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
