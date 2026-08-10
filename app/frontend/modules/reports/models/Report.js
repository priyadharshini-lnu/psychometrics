import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import { perform } from '~/modules/reports/core/temp/socket'
import I18nStore from '~/modules/reports/store/I18nStore'
import {
  PSYCHOMETRIC, HOGAN, THREESIXTY, AGILE, SAVILLE,
  ORG_SURVEYS, CASE_STUDIES, PEARSON,
  ASSESSOR_FORM,
  MICROSITE,
} from '~/modules/reports/models/Assessment'
import Filter from './Filter'

export const PAGE_SIZES = [
  { width: 840, height: 1188, label: 'A4 - Portrait (840*1188)' },
  { width: 1188, height: 840, label: 'A4 - Landscape (1188*840)' },
  { width: 850, height: 1100, label: 'Letter - Portrait (850x1100)' },
  { width: 1100, height: 850, label: 'Letter - Landscape (1100x850)' },
  { width: 1355, height: 762, label: 'PowerPoint Presentation (1355x762)' },
]
export const LEGACY_PAGE_SIZES = [
  { width: 827, height: 1169, label: 'Legacy - A4 - Portrait (827x1169)' },
  { width: 1169, height: 827, label: 'Legacy - A4 - Landscape (1169x827)' },
]
export const ALL_PAGE_SIZES = [...PAGE_SIZES, ...LEGACY_PAGE_SIZES]

const BASE_FONT_SIZE = 14

export const SOURCE_TYPES = {
  [ASSESSOR_FORM]: [
    { value: 'EmbeddedData', label: 'Embedded Data', condition: true },
    { value: 'Factor', label: 'Factors', condition: true },
  ],
  [MICROSITE]: [
    { value: 'Question', label: 'Question', condition: false },
    { value: 'EmbeddedData', label: 'Embedded Data', condition: true },
    { value: 'Factor', label: 'Factors', condition: true },
  ],
  [PSYCHOMETRIC]: [
    { value: 'Question', label: 'Question', condition: false },
    { value: 'EmbeddedData', label: 'Embedded Data', condition: true },
    { value: 'Factor', label: 'Factors', condition: true },
  ],
  [ORG_SURVEYS]: [
    { value: 'Question', label: 'Question', condition: false },
    { value: 'EmbeddedData', label: 'Embedded Data', condition: true },
    { value: 'Factor', label: 'Factors', condition: true },
  ],
  [CASE_STUDIES]: [
    { value: 'Question', label: 'Question', condition: false },
    { value: 'EmbeddedData', label: 'Embedded Data', condition: true },
    { value: 'Factor', label: 'Factors', condition: true },
  ],
  [THREESIXTY]: [
    { value: 'Question', label: 'Question', condition: false },
    { value: 'EmbeddedData', label: 'Embedded Data', condition: true },
    { value: 'Factor', label: 'Factors', condition: true },
  ],
  [AGILE]: [
    { value: 'Factor', label: 'Factors', condition: true },
  ],
  [HOGAN]: [
    { value: 'PercentileScale', label: 'Percentile Scale', condition: true },
    { value: 'PercentileSubscale', label: 'Percentile Subscale', condition: true },
    { value: 'RawScale', label: 'RAW Scale', condition: true },
    { value: 'Factor', label: 'Factors', condition: true },
  ],
  [SAVILLE]: [
    { value: 'Saville#Ipsative', label: 'Ipsative', condition: true },
    { value: 'Saville#Nipsative', label: 'Nipsative', condition: true },
    { value: 'Saville#Normative', label: 'Normative', condition: true },
    { value: 'Saville#Raw', label: 'Raw', condition: true },
    { value: 'Factor', label: 'Factors', condition: true },
  ],
  [PEARSON]: [
    { value: 'Factor', label: 'Factors', condition: true },
  ],
}

const Report = function (attrs = {}) {
  this.id = attrs.id
  this.name = attrs.name
  this.props = attrs.props || {}
  if (!this.props.sizes) {
    this.props.sizes = { width: PAGE_SIZES[0].width, height: PAGE_SIZES[0].height, fontSize: BASE_FONT_SIZE }
  }
  this.assigns = {}
  _.each(attrs.assessments, (assessment) => { this.assigns[assessment.id] = [] })
  _.each(attrs.assigns, (assigns, assessmentId) => {
    this.assigns[assessmentId] = assigns
  })
  this.data_configuration = attrs.data_configuration

  this.factorNorms = attrs.factor_norms
  this.dataSheetColumns = attrs.data_sheet_columns
  this.campaignFactors = attrs.campaign_factors
  this.relationships = attrs.relationships || []
  this.setFilters(attrs.filters)
  this.result_completed_at = attrs.result_completed_at
  this.norm_used = attrs.norm_used
  this.result_locale = attrs.result_locale
}

Report.prototype = new EventEmitter()

_.extend(Report.prototype, {
  toJSON () {
    return {
      name: this.name,
      props: this.props,
      data_sheet_columns: this.dataSheetColumns,
      filters: this.filters,
    }
  },

  setFilters (filters) {
    this.filters = []
    if (filters) {
      _.each(filters, (filter) => {
        this.addFilter(filter)
      })
    }
  },

  rename (val) {
    this.name = val
    this.sync()
  },

  addFilter (attrs) {
    this.filters.push(new Filter(attrs, this))
  },

  sync () {
    // Socket.socket().perform('report_update', this)
  },

  syncFilters (filters, callback) {
    perform('report_change_filters', { filters }, (filters) => {
      this.setFilters(filters)
      if (callback) {
        callback()
      }
    })
  },

  syncAliases (factors, callback) {
    perform('report_change_aliases', { aliases: factors }, () => {
      if (callback) {
        callback()
      }
    })
  },

  // Sends to sever new Data Configuration
  //
  syncDataConfiguration (dataConfiguration, callback) {
    this.data_configuration = dataConfiguration
    perform('report_change_data_configuration', { dataConfiguration }, () => {
      if (callback) {
        callback()
      }
    })
  },

  removeFilter (filter) {
    _.remove(this.filters, filter)
  },

  getFilterNameById (filterId) {
    const filter = _.find(this.filters, { id: filterId })
    return filter ? I18nStore.tFilterName(filter) : null
  },

})

export default Report
