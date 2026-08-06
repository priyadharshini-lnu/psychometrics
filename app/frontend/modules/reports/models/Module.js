/* eslint-disable no-case-declarations */
import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import DefaultProps from '~/modules/reports/consts/DefaultProps'
import ModuleConfigs from '~/modules/reports/consts/ModuleConfigs'
import { getQuestions } from '~/modules/reports/core/builder/selectors'
import Presets from '~/modules/reports/consts/Presets'
import AppStore from '~/modules/reports/store/AppStore'
import {
  AGILE, HOGAN, MICROSITE, PSYCHOMETRIC, SAVILLE,
} from '~/modules/reports/models/Assessment'
import rstore from '~/modules/reports/store'
import { UPDATE_MODULE } from '~/modules/reports/core/builder/module/actions'
import Utils from '~/modules/reports/utils/Utils'
import TextConditionCollection from './TextConditionCollection'
import CPIConditionCollection from './CPIConditionCollection'
import InnovationStyleConditionCollection from './InnovationStyleConditionCollection'
import ModulesTranslates from './ModulesTranslates'

export const DATA_SHEET = 'DataSheet'
export const CAMPAIGN_FACTORS = 'CampaignFactors'
export const CAMPAIGN_AI_ARTIFACTS = 'CampaignAIArtifacts'
export const REPORT_DATA = 'ReportData'
export const ASSESSMENT_DATA = 'AssessmentData'
const ALL_FACTORS = 'All Factors'

const Module = function (attrs = {}, page) {
  this.store = page
  this.page = page
  this.id = attrs.id
  this.isNew = attrs.isNew
  this.name = attrs.name

  if (!this.id) {
    this.id = Utils.genId()
    this.isNew = true
  }
  this.meta = attrs.meta || {}
  this.pagination = attrs.pagination || null

  this.assessment_id = attrs.assessment_id || (AppStore.assessments[0] && AppStore.assessments[0].id)
  this.type = attrs.type
  this.props = _.cloneDeep(DefaultProps[this.type] || {})
  this.moduleConfig = ModuleConfigs[this.type] || {}
  this.removed = attrs.removed || false
  this.page_id = page.id
  _.extend(this.props, attrs.props)
  this.setRelevantFactorsData()
  if (this.props.textConditions) {
    this.textConditions = _.map(this.props.textConditions, (cond) => {
      if (_.includes(['CampaignFactorsTable', 'FactorsTable', 'StrengthClusters'], this.props.type)
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
  this.campaignFactorsList = AppStore.getAssessmentById(this.assessment_id)?.campaignFactorsList || []
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
      page_id: this.page.isNew ? undefined : this.page_id,
      name: this.name,
      type: this.type,
      props,
      removed: this.removed,
      assessment_id: this.assessment_id,
      isNew: this.isNew,
      meta: this.meta,
    }
  },

  changeType (type, presetName) {
    const preset = Presets[presetName] || {}
    this.props.type = type
    this.props.presetName = presetName
    this.props.filter = null
    this.props.dataFormat = 'Count'
    this.props = { ...this.props, ...preset }
    this.update()
  },

  onPage (page) {
    return this.page_id === page.id
  },

  layout () {
    return this.page.layoutManager
  },

  clone () {
    this.clone(this)
  },

  destroy () {

  },

  getSourceType () {
    const assessment = AppStore.getAssessmentById(this.assessment_id)
    const source = _.result(this.props, 'source.type')
    if (source === 'AssessmentData') {
      return null
    }
    if (source === 'DataSheet') {
      return 'DataSheet'
    }
    if (source === 'CampaignFactors') {
      return 'CampaignFactors'
    }
    if (source === 'CampaignAIArtifacts') {
      return 'CampaignAIArtifacts'
    }
    if (assessment.category === HOGAN) {
      if (source === 'Factor') return 'Factor'

      return 'ExternalFactor'
    }
    if (assessment.category === SAVILLE) {
      if (source === 'Factor') return 'Factor'

      return 'SavilleFactor'
    }
    switch (_.result(this.props, 'source.type')) {
      case 'Question':
        const question = getQuestions(rstore.getState().report, this.assessment_id)[this.props.source.id]
        return question && question.type
      default:
        return _.result(this.props, 'source.type')
    }
  },

  getScoreType () {
    const assessment = AppStore.getAssessmentById(this.assessment_id)
    if (assessment.category === 'saville') {
      const sourceType = _.get(this.props, 'source.type')
      if (!sourceType) { return _.get(this.props, 'source.type') }
      return sourceType.replace('Saville#', '')
    }
    return _.get(this.props, 'source.type')
  },

  getValueType () {
    return _.get(this.props, 'source.valueType')
  },

  getSourceModel () {
    switch (_.result(this.props, 'source.type')) {
      case 'Question':
        return getQuestions(rstore.getState().report, this.assessment_id)[this.props.source.id]
      case 'DataSheet':
        return this.props.source.columns
      case 'CampaignFactors':
        return this.props.source.codes
      case 'CampaignAIArtifacts':
        return this.props.source.codes
      case 'ReportData':
        return (this.props.source.reportDataColumns || []).map(c => c.value)
      case 'EmbeddedData':
        return {
          name: this.props.source.name,
        }
      case 'Factor':
        if (this.props.source.allFactors) {
          return AppStore.factorsByAssessmentId(this.assessment_id)
        }
        return this.props.source.factors
      case 'Count':
      case 'Score':
      case 'Stability':
      case 'RawScale':
      case 'PercentileSubscale':
      case 'PercentileScale':
      case 'Saville#Ipsative':
      case 'Saville#Nipsative':
      case 'Saville#Normative':
      case 'Saville#Raw':
        return this.props.source.factors
      default:
    }
  },

  update () {
    rstore.dispatch({ type: UPDATE_MODULE, module: this.toJSON() })
  },

  sync () {
    // look up calls and remove unused
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
    if ([HOGAN, SAVILLE, PSYCHOMETRIC, MICROSITE, AGILE].includes(category)) { return true }
    if (this.props.sourceType === 'ResultText' || this.props.sourceType === 'AIContent') {
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
          return AppStore.isMainfactor(factor.id) || factor.id === ALL_FACTORS
        }
        if (filter.Factor === 'subfactor') {
          return AppStore.isSubfactor(factor.id) || factor.id === ALL_FACTORS
        }
      })
    }
    return factors
  },

  addConditionCollection (attrs) {
    if (_.includes(['CampaignFactorsTable', 'FactorsTable', 'StrengthClusters'], this.props.type)
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
    if (!this.moduleConfig?.settings?.[this.props.type]) {
      return false
    }

    return !!_.result(this.moduleConfig.settings[this.props.type], 'multiFiltering')
  },

  isQuestionMultiFiltering () {
    if (!this.moduleConfig?.settings?.[this.props.type]) {
      return false
    }

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

  isBasedOnDataSheet () {
    return this.props.source && this.props.source.type === DATA_SHEET
  },

  isBasedOnCampaignFactors () {
    return this.props.source && this.props.source.type === CAMPAIGN_FACTORS
  },

  isBasedOnCampaignAIArtifacts () {
    return this.props.source && this.props.source.type === CAMPAIGN_AI_ARTIFACTS
  },

  isBasedOnReportData () {
    return this.props.source && this.props.source.type === REPORT_DATA
  },

  isBasedOnAssessment () {
    return !this.isBasedOnDataSheet() && !this.isBasedOnReportData()
      && !this.isBasedOnCampaignFactors() && !this.isBasedOnCampaignAIArtifacts()
  },

  shift () {
    const { position: { left, top } } = this.props
    this.props.position.left = left + 20
    this.props.position.top = top + 20
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
