/* eslint-disable no-case-declarations */
import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import DefaultProps from 'rb/consts/DefaultProps'
import ModuleConfigs from 'rb/consts/ModuleConfigs'
import AssessmentStore from 'rb/store/AssessmentStore'
import Presets from 'rb/consts/Presets'
import AppStore from 'rb/store/AppStore'
import { HOGAN, MINDMILL } from 'rb/models/Assessment'
import TextConditionCollection from './TextConditionCollection'
import CPIConditionCollection from './CPIConditionCollection'
import InnovationStyleConditionCollection from './InnovationStyleConditionCollection'
import ModulesTranslates from './ModulesTranslates'

export const DATA_SHEET = 'DataSheet'

const Module = function (attrs = {}, store) {
  this.store = store
  this.id = attrs.id
  this.assessment_id = attrs.assessment_id || (AppStore.assessments[0] && AppStore.assessments[0].id)
  this.type = attrs.type
  this.props = _.cloneDeep(DefaultProps[this.type] || {})
  this.moduleConfig = ModuleConfigs[this.type] || {}
  this.removed = false
  _.extend(this.props, attrs.props)
  this.setRelevantFactorsData()
  if (this.props.textConditions) {
    this.textConditions = _.map(this.props.textConditions, (cond) => {
      if (_.includes(['CPITopFactors', 'StrengthClusters'], this.props.type)
          || this.props.sourceType === 'ConditionalFactorOccupationText') {
        return new CPIConditionCollection(cond, this)
      } if (this.props.type === 'InnovationStyles') {
        return new InnovationStyleConditionCollection(cond, this)
      }
      return new TextConditionCollection(cond, this)
    })
  } else {
    this.textConditions = []
  }
}

Module.prototype = new EventEmitter()

_.extend(Module.prototype, {
  toJSON () {
    const { props } = this
    if (this.textConditions) {
      props.textConditions = this.textConditions
    }
    if (this.styleConditions) {
      props.styleConditions = this.styleConditions
    }
    return {
      id: this.id,
      page_id: typeof this.store.page.id === 'string' ? undefined : this.store.page.id,
      type: this.type,
      props,
      removed: this.removed,
      assessment_id: this.assessment_id,
    }
  },

  changeType (type, presetName) {
    const preset = Presets[presetName]
    this.props.type = type
    this.props.presetName = presetName
    this.props.filter = null
    this.props.dataFormat = 'Count'
    _.merge(this.props, preset)
    this.update()
  },

  onPage (page) {
    return this.store.page === page
  },

  layout () {
    return this.store.page.layoutManager
  },

  clone () {
    this.store.clone(this)
  },

  destroy () {

  },

  getSourceType () {
    const assessment = AppStore.getAssessmentById(this.assessment_id)
    if (_.result(this.props, 'source.type') === 'DataSheet') {
      return 'DataSheet'
    }
    if (assessment.category === HOGAN || assessment.category === MINDMILL) {
      return 'ExternalFactor'
    }
    switch (_.result(this.props, 'source.type')) {
      case 'Question':
        const question = AssessmentStore.questions[this.assessment_id][this.props.source.id]
        return question && question.type
      default:
        return _.result(this.props, 'source.type')
    }
  },

  getSourceModel () {
    switch (_.result(this.props, 'source.type')) {
      case 'Question':
        return AssessmentStore.questions[this.assessment_id][this.props.source.id]
      case 'DataSheet':
        return this.props.source.columns
      case 'EmbeddedData':
        return {
          name: this.props.source.name,
        }
      case 'Factor':
        return this.props.source.factors
      case 'Count':
      case 'Score':
      case 'Stability':
      case 'RawScale':
      case 'PercentileSubscale':
      case 'PercentileScale':
        return this.props.source.factors
      default:
    }
  },

  update () {
    this.sync()
    this.store.update()
  },

  sync () {
    // Socket.socket().perform('module_update', this)
  },

  reset () {
    this.oldProps = _.cloneDeep(this.props)
    const presetData = Presets[this.props.presetName] || {}
    this.props = _.cloneDeep(_.merge(DefaultProps[this.type] || {}, presetData))
    this.moduleConfig = ModuleConfigs[this.type] || {}
    this.props.source = this.oldProps.source || null
    this.props.type = this.oldProps.type || null
    this.update()
  },

  canShowDataSet (type, category) {
    if (category === HOGAN || category === MINDMILL) { return true }
    if (this.props.sourceType === 'ResultText') {
      if (['Question', 'Factor', 'EmbeddedData'].includes(type)) { return false }
    }
    const filter = this.moduleConfig.filtersDataSet && this.moduleConfig.filtersDataSet[this.props.type]
    return !filter || filter[type]
  },

  filterQuestions (questions) {
    const filter = this.moduleConfig.filtersDataSet && this.moduleConfig.filtersDataSet[this.props.type]
    if (filter && filter.Question) {
      return _.filter(questions, question => _.includes(filter.Question, question.type))
    }
    return questions
  },

  filterFactors (factors) {
    const filter = this.moduleConfig.filtersDataSet && this.moduleConfig.filtersDataSet[this.props.type]
    if (filter && filter.Factor && filter.Factor !== true) {
      return _.filter(factors, (factor) => {
        if (filter.Factor === 'factor') {
          return AppStore.isMainfactor(factor.id)
        }
        if (filter.Factor === 'subfactor') {
          return AppStore.isSubfactor(factor.id)
        }
      })
    }
    return factors
  },

  addConditionCollection (attrs) {
    if (_.includes(['CPITopFactors', 'StrengthClusters'], this.props.type)
      || this.props.sourceType === 'ConditionalFactorOccupationText') {
      this.textConditions.push(new CPIConditionCollection(attrs, this))
    } else if (this.props.type === 'InnovationStyles') {
      this.textConditions.push(new InnovationStyleConditionCollection(attrs, this))
    } else {
      this.textConditions.push(new TextConditionCollection(attrs, this))
    }
  },

  removeConditionCollection (collection) {
    _.remove(this.textConditions, collection)
  },

  isMultiFiltering () {
    return !!_.result(this.moduleConfig.settings[this.props.type], 'multiFiltering')
  },

  isQuestionMultiFiltering () {
    return !!_.result(this.moduleConfig.settings[this.props.type], 'questionMultiFiltering')
  },

  getTextByCondition () {
    if (this.textConditions.length) {
      const result = []
      _.each(this.textConditions, (t, index) => {
        const res = t.getTextByCondition(index)
        if (res) {
          result.push(res)
        }
      })
      // currently return first condition
      return result.length ? result[0] : ''
    }
    return ''
  },

  getStylesByCondition () {
    if (this.textConditions.length) {
      const result = []
      _.each(this.textConditions, (t) => {
        const res = t.getStylesByCondition()
        if (res) {
          result.push(res)
        }
      })
      // currently return first condition
      return result.length ? result[0] : ''
    }
    return ''
  },

  tDefault (field, extraData) {
    const TranslateModule = ModulesTranslates[this.type]
    if (!TranslateModule) { throw new Error(`Add Translate module for type: ${this.type}`) }
    const object = new TranslateModule(this)
    return object.getValueByCode(field, extraData)
  },

  exportLocales () {
    const TranslateModule = ModulesTranslates[this.type]
    if (!TranslateModule) { throw new Error(`Add Translate module for type: ${this.type}`) }
    const object = new TranslateModule(this)
    return object.exportLocales()
  },

  getMinSide () {
    return _.min([this.props.position.width, this.props.position.height])
  },

  isBasedOnAssessment () {
    return !this.props.source || this.props.source.type !== DATA_SHEET
  },

  isBasedOnDataSheet () {
    return this.props.source && this.props.source.type === DATA_SHEET
  },

  setRelevantFactorsData () {
    const factors = _.get(this.props, 'source.factors')
    if (factors) {
      _.each(factors, (propsFactor) => {
        const reportFactor = _.find(AppStore.flatFactors, ['id', propsFactor.id])
        if (reportFactor) {
          propsFactor.name = reportFactor.name
          propsFactor.alias = reportFactor.alias
        }
      })
    }
  },
})

export default Module
