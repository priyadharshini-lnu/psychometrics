/* eslint-disable no-case-declarations */
import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import MockResults from 'rb/store/MockResults'
import AppStore from 'rb/store/AppStore'
import Filter from 'rb/models/Filter'
import Utils from 'rb/utils'
import AssessmentStore from 'rb/store/AssessmentStore'
import Scoring from './Scoring'

const NORMA_VALUES = {
  'Very Low': 1,
  Low: 2,
  Average: 3,
  High: 4,
  'Very High': 5,
}

// Attention!!!! it is hack. Used for individual response
// Individual values stored in this.resultsByFilter['individual']
const INDIVIDUAL_FILTER = {
  id: 'individual',
  name: 'individual',
  conditions: [{
    type: 'RelationShip',
    props: {
      predicate: 'Is',
      value: 'Self',
    },
  }],
}

const SCORING_STRATEGY_QUESTIONS = 'questions'
const SCORING_STRATEGY_SUB_FACTOR_QUESTIONS = 'sub_factor_questions'
// const SCORING_STRATEGY_FACTOR_AVERAGE = 'sub_factors_average'
/**
 * Results store
 */
const Result = function (assessmentId) {
  this.user = null
  this.questions = {}
  this.embeddedData = {}
  this.scoring = {}
  this.externalScoring = {}
  this.groupedDataSheet = []
  this.individualAgileScoring = null
  this.assessmentId = assessmentId
  const assessment = _.find(AppStore.assessments, { id: this.assessmentId })
  this.dimensionId = assessment && assessment.dimensionId
  // structure of resultsByFilter:
  //    key -> filter ID
  //    value -> {
  //        questions: {},
  //        embeddedData: {},
  //        scoring: {}
  //    }
  this.resultsByFilter = {}
}

Result.prototype = new EventEmitter()

_.extend(Result.prototype, {
  toJSON () {
    return {
      name: this.name,
      filters: this.filters,
    }
  },

  // TODO: group results by filters
  init (results, user, filters) {
    filters.push(new Filter(INDIVIDUAL_FILTER))
    _.each(filters, (filter) => {
      this.resultsByFilter[filter.id] = {
        questions: {},
        embeddedData: {},
        scoring: {},
        questionScoring: {},
        usersScoring: {},
        externalScoring: {},
        dataSheet: {},
        groupedDataSheet: [],
        rawResults: [],
      }
    })
    this.user = user
    this.questionScoring = {}
    this.usersScoring = {}
    this.rawResults = results
    this.normData = _.get(this.rawResults, '[0].norm_data')
    _.each(this.rawResults, (object, index) => {
      _.each(filters, (filter) => {
        if (filter.correctByFilter(object)) this.resultsByFilter[filter.id].rawResults.push(object)
      })

      this.initScoring(object, filters, index)
      this.initEmbeddedData(object, filters)
      this.initQuestions(object, filters)
      this.initScoringByQuestions(object, filters)
      this.initUserScoring(object, filters)
      this.initExternalScoring(object, filters)
      this.initDataSheet(object, filters)
      if (object.user_id === this.user.id) {
        this.individualAgileScoring = object.agile_scoring
      }
    })
    this.cleanupNullScorings()
    this.calcScoringByQuestions()
    this.calcOccupationsStars()
    this.sortOccupations()
    this.calcInnovationStylesScore()
  },

  // we need sort occupations after calc occupations starts
  sortOccupations () {
    AppStore.sortedOccupations[this.dimensionId] = _.orderBy(
      AppStore.occupations[this.dimensionId], ['result'], ['desc'],
    )
  },

  calcOccupationsStars () {
    _.each(AppStore.occupations[this.dimensionId], (oc) => {
      oc.stars = oc.getStars(this.resultsByFilter.individual.scoring)
    })
  },

  calcInnovationStylesScore () {
    _.each(AppStore.innovationStyles[this.dimensionId], (is) => {
      is.calculateScore(this.resultsByFilter.individual.scoring)
    })
  },

  getTopAgileFactors (questionsIds, groupId, number) {
    if (!this.individualAgileScoring) { return [] }
    let factors = []
    _.each(this.individualAgileScoring, (factor, factorId) => {
      const factorScoring = []
      if (factor.results.length) {
        const filteredData = _.filter(factor.results, res => questionsIds.includes(res.question_id))
        _.each(filteredData, (f) => {
          if (f.value[groupId] || f.value[groupId] === 0) {
            factorScoring.push(f.value[groupId])
          }
        })
      }
      if (AppStore.mapFactors[this.dimensionId][factorId]) {
        factors.push({
          factorId,
          value: factorScoring.length ? _.mean(factorScoring) : 0,
        })
      }
    })
    // perhaps need to use norm scoring, then row scoring, then alphabet
    factors = _.sortBy(factors, f => -f.value)
    const top = _.take(factors, number)
    return _.map(top, f => ({
      id: f.factorId,
      alias: AppStore.mapFactors[this.dimensionId][f.factorId].alias,
      value: f.value,
      description: AppStore.mapFactors[this.dimensionId][f.factorId].description,
      icon: AppStore.mapFactors[this.dimensionId][f.factorId].icon,
    }))
  },

  getTopFactors (from, to, factorIds, subfactors = true) {
    if (!this.resultsByFilter.individual) { return [] }
    const factors = []
    const filtered = _.pick(this.resultsByFilter.individual.scoring, factorIds)
    _.each(filtered, (d, factorId) => {
      const sumRaw = d.results.reduce((a, b) => a + b.value, 0)
      const sumNorm = d.results.reduce((a, b) => a + b.norm, 0)
      const factorData = AppStore.mapFactors[this.dimensionId][parseInt(factorId, 10)]
      if (factorData && subfactors === AppStore.isSubfactor(parseInt(factorId, 10))) {
        factors.push({
          meanRawScore: d.results.length ? Utils.round(sumRaw / d.results.length, 2) : 0,
          meanNormScore: d.results.length ? Utils.round(sumNorm / d.results.length, 2) : 0,
          id: parseInt(factorId, 10),
          alias: d.name,
          description: factorData.description,
        })
      }
    })
    const sorted = _.orderBy(factors, ['meanNormScore', 'meanRawScore', 'alias'], ['desc', 'desc', 'asc'])
    return _.filter(sorted, (r, i) => i + 1 >= from && i < to)
  },

  getAverageFactorScore (filterId) {
    let scoring = {}
    if (_.isNull(filterId)) {
      // eslint-disable-next-line prefer-destructuring
      scoring = this.scoring
    } else if (this.resultsByFilter[filterId]) {
      // eslint-disable-next-line prefer-destructuring
      scoring = this.resultsByFilter[filterId].scoring
    }

    return _.reduce(scoring, (factors, score, factorId) => {
      const factorData = AppStore.mapFactors[this.dimensionId][parseInt(factorId, 10)]
      if (factorData) {
        const sum = _.sumBy(score.results, 'value')
        factors.push({
          avg: score.results.length ? Utils.round(sum / score.results.length, 2) : 0,
          name: score.name,
        })
      }
      return factors
    }, [])
  },

  getSubFactors (from, to, factorId) {
    if (!this.resultsByFilter.individual) { return [] }
    const factors = []
    factorId = parseInt(factorId, 10)
    const subFactorIds = _.get(AppStore.mapSubfactorIdsByFactor, [this.dimensionId, factorId], [])
    const filtered = _.pickBy(this.resultsByFilter.individual.scoring,
      x => _.includes(subFactorIds, parseInt(x.id, 10)))
    _.each(filtered, (d, factorId) => {
      const sumRaw = d.results.reduce((a, b) => a + b.value, 0)
      const sumNorm = d.results.reduce((a, b) => a + b.norm, 0)
      const factorData = AppStore.mapFactors[this.dimensionId][factorId]
      if (factorData) {
        factors.push({
          meanRawScore: d.results.length ? Utils.round(sumRaw / d.results.length, 2) : 0,
          meanNormScore: d.results.length ? Utils.round(sumNorm / d.results.length, 2) : 0,
          id: factorId,
          alias: d.name,
          description: factorData.description,
        })
      }
    })
    const sorted = _.orderBy(factors, ['meanNormScore', 'meanRawScore', 'alias'], ['desc', 'desc', 'asc'])
    return _.filter(sorted, (r, i) => i + 1 >= from && i < to)
  },

  getTopFactorByRank (rank) {
    if (!this.resultsByFilter.individual) { return [] }
    const factors = []
    _.each(this.resultsByFilter.individual.scoring, (d, factorId) => {
      const sumRaw = d.results.reduce((a, b) => a + b.value, 0)
      const sumNorm = d.results.reduce((a, b) => a + b.norm, 0)
      const factorData = AppStore.mapFactors[this.dimensionId][parseInt(factorId, 10)]
      if (factorData && AppStore.isSubfactor(parseInt(factorId, 10))) {
        factors.push({
          meanRawScore: d.results.length ? Utils.round(sumRaw / d.results.length, 2) : 0,
          meanNormScore: d.results.length ? Utils.round(sumNorm / d.results.length, 2) : 0,
          id: parseInt(factorId, 10),
          alias: d.name,
          description: factorData.description,
          icon: factorData.icon,
        })
      }
    })
    const sorted = _.orderBy(factors, ['meanNormScore', 'meanRawScore', 'alias'], ['desc', 'desc', 'asc'])
    return sorted[rank - 1]
  },

  getOccupationByRank (rank) {
    const occupation = _.cloneDeep(AppStore.sortedOccupations[this.dimensionId][rank - 1])
    if (!occupation) { return null }
    const factors = []
    _.each(occupation.factors, (f) => {
      const factorScoring = this.resultsByFilter.individual.scoring[f.id]
      // business requirements: only subfactors
      if (factorScoring && AppStore.isSubfactor(f.id)) {
        factors.push({
          id: f.id,
          alias: factorScoring.name,
          position: f.position,
          meanNormScore: factorScoring.results[0] ? factorScoring.results[0].norm : 0,
          meanRawScore: factorScoring.results[0] ? factorScoring.results[0].value : 0,
        })
      }
    })
    occupation.factors = _.orderBy(
      factors,
      ['position', 'meanNormScore', 'meanRawScore', 'alias'],
      ['asc', 'desc', 'desc', 'asc'],
    )
    return occupation
  },

  getOccupations () {
    return AppStore.occupations[this.dimensionId]
  },

  getInnovationStyles () {
    return AppStore.innovationStyles[this.dimensionId]
  },

  getByFilter (filterId) {
    if (this.resultsByFilter[filterId]) {
      return this.resultsByFilter[filterId]
    }
    // if filter is not found, return all responses
    return this
  },

  isIndividualResult (resultUser) {
    return resultUser === this.user.id
  },

  initUserScoring (data, filters) {
    const meanScorings = []
    _.each(data.scoring, (scoringResults) => {
      const sum = _.reduce(scoringResults.results, (sum, obj) => sum + obj.value, 0)
      const avg = sum / scoringResults.results.length
      meanScorings.push(scoringResults.norm || avg)
    })
    const sum = _.reduce(meanScorings, (sum, val) => sum + val, 0)
    const avg = sum / meanScorings.length
    this.usersScoring[data.user_id] = {
      firstName: data.user.first_name,
      lastName: data.user.last_name,
      email: data.user.email,
      scoring: avg,
      hris: data.hris,
    }
    _.each(filters, (filter) => {
      if (filter.correctByFilter(data)) {
        this.resultsByFilter[filter.id].usersScoring[data.user_id] = this.usersScoring[data.user_id]
      }
    })
  },

  questionScoringWithoutFactors (filterId) {
    const scorings = {}
    let questionScoring
    const assessmentQuestions = AssessmentStore.questions[this.assessmentId]

    if (_.isNull(filterId)) {
      // eslint-disable-next-line prefer-destructuring
      questionScoring = this.questionScoring
    } else {
      // eslint-disable-next-line prefer-destructuring
      questionScoring = this.resultsByFilter[filterId] ? this.resultsByFilter[filterId].questionScoring : {}
    }

    _.each(questionScoring, (questions, factorId) => {
      _.each(questions, (value, id) => {
        if (assessmentQuestions[id]) {
          const scoringValues = _.map(value, v => (v instanceof Scoring ? v.getValue() : v))
          if (scorings[id]) {
            scorings[id].values = scorings[id].values.concat(scoringValues)
          } else {
            const factorName = _.get(AppStore.mapFactors, [this.dimensionId, factorId, 'name'])
            scorings[id] = { id, values: scoringValues, factorName }
          }
        }
      })
    })

    _.each(scorings, (scoring) => {
      scoring.sum = _.sum(scoring.values)
      scoring.avg = _.round(scoring.sum / scoring.values.length, 2)
    })

    return scorings
  },

  initScoringByQuestions (data, filters) {
    _.each(data.scoring, (scoringResults, factorId) => {
      factorId = parseInt(factorId, 10)
      const factor = AppStore.mapFactors[this.dimensionId][factorId]
      if (!factor) {
        return
      }
      if (!this.questionScoring[factorId]) {
        this.questionScoring[factorId] = { name: factor.alias }
      }
      if (factor.scoring_strategy === SCORING_STRATEGY_SUB_FACTOR_QUESTIONS) {
        const subFactorResults = []
        _.each(factor.factors_sub_factors, (factorSubFactor) => {
          const subFactor = AppStore.mapFactors[this.dimensionId][factorSubFactor.sub_factor_id]
          if (subFactor && subFactor.scoring_strategy === SCORING_STRATEGY_QUESTIONS && data.scoring[subFactor.id]) {
            _.each(data.scoring[subFactor.id].results, (result) => {
              subFactorResults.push(result)
            })
          }
        })
        data.scoring[factorId].results = subFactorResults
      }
      _.each(scoringResults.results, (obj) => {
        if (!this.questionScoring[factorId][obj.question_id]) {
          this.questionScoring[factorId][obj.question_id] = []
        }
        this.questionScoring[factorId][obj.question_id].push(obj.value)
        _.each(filters, (filter) => {
          if (filter.correctByFilter(data)) {
            if (!this.resultsByFilter[filter.id].questionScoring[factorId]) {
              this.resultsByFilter[filter.id].questionScoring[factorId] = {}
            }
            if (!this.resultsByFilter[filter.id].questionScoring[factorId][obj.question_id]) {
              this.resultsByFilter[filter.id].questionScoring[factorId][obj.question_id] = []
            }
            this.resultsByFilter[filter.id].questionScoring[factorId][obj.question_id].push(
              new Scoring(obj),
            )
          }
        })
      }, 0)
    })
  },

  calcScoringByQuestions () {
    _.each(this.questionScoring, (questions, factorId) => {
      _.each(questions, (arr, id) => {
        const sum = _.reduce(arr, (sum, val) => sum + val, 0)
        const avg = sum / arr.length
        if (!this.questionScoring[factorId].questions) {
          this.questionScoring[factorId].questions = {}
        }

        this.questionScoring[factorId].questions[id] = avg
      })
    })
  },

  initExternalScoring (data, filters) {
    filters.forEach((filter) => {
      if (filter.correctByFilter(data)) {
        this.resultsByFilter[filter.id].externalScoring = data.external_scoring
      }
    })
    this.externalScoring = data.external_scoring
  },

  initDataSheet (data, filters) {
    filters.forEach((filter) => {
      if (filter.correctByFilter(data)) {
        this.resultsByFilter[filter.id].dataSheet = data.data_sheet
        this.resultsByFilter[filter.id].groupedDataSheet.push(data.data_sheet)
      }
    })
    this.dataSheet = data.data_sheet
    this.groupedDataSheet.push(data.data_sheet)
  },

  initScoring (data, filters, index) {
    const norms = AppStore.report.factorNorms
    _.each(AppStore.mapFactors[this.dimensionId], (factor, factorId) => {
      const scoringResults = data.scoring[factorId]
      // add common results

      if (!this.scoring[factorId]) {
        this.scoring[factorId] = { id: factorId, name: factor.alias, results: [] }
        _.each(this.resultsByFilter, (result) => {
          result.scoring[factorId] = { id: factorId, name: factor.alias, results: [] }
        })
      }

      if (scoringResults) {
        const commonResult = _.sumBy(scoringResults.results, (res) => {
          if (_.isArray(res.value)) {
            return _.mean(res.value)
          }

          return res.value
        })
        const average = scoringResults.results.length ? commonResult / scoringResults.results.length : 0
        if (average) {
          const scoring = new Scoring({ value: average })
          this.scoring[factorId].results.push(scoring)
        } else {
          this.scoring[factorId].results.push(null)
        }
      } else {
        this.scoring[factorId].results.push(new Scoring({ value: 0 }))
      }
    })

    _.each(AppStore.mapFactors[this.dimensionId], (factor, factorId) => {
      // merge factor scoring with sub-factors
      const sc = this.scoring[factorId]
      if (!sc.results[index]) { return }
      if (factor.scoring_strategy === SCORING_STRATEGY_SUB_FACTOR_QUESTIONS) {
        let commonValue = 0
        let totalWeight = 0
        _.each(factor.factors_sub_factors, (factorSubFactor) => {
          const subFactor = AppStore.mapFactors[this.dimensionId][factorSubFactor.sub_factor_id]
          if (subFactor && subFactor.scoring_strategy === SCORING_STRATEGY_QUESTIONS && data.scoring[subFactor.id]) {
            const scores = _.map(data.scoring[subFactor.id].results, r => r.value)
            totalWeight += scores.length
            commonValue += _.sum(scores)
          }
        })
        sc.results[index].value = commonValue / totalWeight
      }

      _.each(sc.results, (scoring) => {
        if (!scoring) { return }
        const average = _.round(scoring.value, 2)
        if (data.norm_data && data.norm_data.id && data.norm_data.type && norms[data.norm_data.id]) {
          const norma = norms[data.norm_data.id][data.norm_data.type.toLowerCase()]
          if (norma) {
            const factorNorm = _.find(norma, { factor_id: +factorId })
            if (factorNorm) {
              _.each(factorNorm.props, (n) => {
                n.score_from = parseFloat(n.score_from) || null
                n.score_to = parseFloat(n.score_to) || null
              })
              const prop = _.find(factorNorm.props, n => n.score_from <= average && n.score_to >= average)
              if (prop) {
                scoring.norm = NORMA_VALUES[prop.level]
                sc.norm = NORMA_VALUES[prop.level]
              }
            }
          }
        }
      })
    })

    _.each(AppStore.mapFactors[this.dimensionId], (factor, factorId) => {
      const sc = this.scoring[factorId]
      if (!sc.results[index]) { return }
      const { value } = sc.results[index]
      const { norm } = sc.results[index]
      _.each(filters, (filter) => {
        if (filter.correctByFilter(data)) {
          this.resultsByFilter[filter.id].scoring[factorId].results.push(new Scoring({ value, norm }))
        }
      })
    })
  },

  cleanupNullScorings () {
    _.each(AppStore.mapFactors[this.dimensionId], (factor, factorId) => {
      const sc = this.scoring[factorId]
      _.remove(sc.results, r => r === null)
    })
  },

  initEmbeddedData (data, filters) {
    _.each(data.embedded_data, (embeddedDataResults, key) => {
      // add common results
      if (!this.embeddedData[key]) {
        this.embeddedData[key] = []
        _.each(this.resultsByFilter, (result) => {
          result.embeddedData[key] = []
        })
      }
      this.embeddedData[key].push({ value: embeddedDataResults })
      _.each(filters, (filter) => {
        if (filter.correctByFilter(data)) {
          this.resultsByFilter[filter.id].embeddedData[key].push({ value: embeddedDataResults })
        }
      })
    })
  },

  initQuestions (data, filters) {
    _.each(data.results, (questionsResults, questionId) => {
      // add common results
      if (!this.questions[questionId]) {
        this.questions[questionId] = []
        _.each(this.resultsByFilter, (result) => {
          result.questions[questionId] = []
        })
      }
      this.questions[questionId].push(questionsResults.answers)
      _.each(filters, (filter) => {
        if (filter.correctByFilter(data)) {
          this.resultsByFilter[filter.id].questions[questionId].push(questionsResults.answers)
        }
      })
    })
  },

  setMockData (sourceType, sourceModel, factors = []) {
    switch (sourceType) {
      case 'Factor':
        const keys = _.keys(MockResults[sourceType])
        const mockLength = keys.length
        this.scoring = {}
        // fill scoring data
        _.each(factors, (factor, i) => {
          this.scoring[factor.id] = {
            results: _.map(MockResults[sourceType][keys[i % mockLength]].results, r => new Scoring(r)),
            name: factor.name,
          }
        })
        break
      case 'EmbeddedData':
        this.embeddedData[sourceModel.name] = MockResults[sourceType]
        break
      case 'ExternalFactor':
        this.externalScoring = (sourceModel || []).reduce((res, factor, index) => {
          const mockResults = MockResults[sourceType]
          res[factor] = mockResults[index % mockResults.length]
          return res
        }, {})
        break
      case 'DataSheet':
        this.dataSheet = (sourceModel || []).reduce((res, field, index) => {
          const mockResults = MockResults[sourceType]
          res[field] = mockResults[index % mockResults.length]
          return res
        }, {})
        this.groupedDataSheet = [this.dataSheet]
        break
      default:
        this.questions[sourceModel.id] = MockResults[sourceType]
    }
  },
})

export default Result
