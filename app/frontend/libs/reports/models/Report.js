import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import Socket from 'rb/cable'
import AliasStore from 'rb/store/modals/AliasStore'
import DataConfigurationStore from 'rb/store/modals/DataConfigurationStore'
import I18nStore from 'rb/store/I18nStore'
import {
  PSYCHOMETRIC, HOGAN, MINDMILL, THREESIXTY,
} from 'rb/models/Assessment'
import Filter from './Filter'

export const DATA_SHEET_COLUMN_TYPES = ['Text', 'Markdown', 'HTML', 'Number']

export const PAGE_SIZES = [
  { width: 850, height: 1100, label: 'Letter - Portrait (850x1100)' },
  { width: 1100, height: 850, label: 'Letter - Landscape (1100x850)' },
  { width: 827, height: 1169, label: 'A4 - Portrait (827x1169)' },
  { width: 1169, height: 827, label: 'A4 - Landscape (1169x827)' },
]
const BASE_FONT_SIZE = 14

export const SOURCE_TYPES = {
  [PSYCHOMETRIC]: [
    { value: 'Question', label: 'Question', condition: false },
    { value: 'EmbeddedData', label: 'Embedded Data', condition: true },
    { value: 'Factor', label: 'Factors', condition: true },
  ],
  [THREESIXTY]: [
    { value: 'Question', label: 'Question', condition: false },
    { value: 'EmbeddedData', label: 'Embedded Data', condition: true },
    { value: 'Factor', label: 'Factors', condition: true },
  ],
  [MINDMILL]: [
    { value: 'Count', label: 'Count', condition: true },
    { value: 'Score', label: 'Score', condition: true },
    { value: 'Stability', label: 'Stability', condition: true },
  ],
  [HOGAN]: [
    { value: 'PercentileScale', label: 'Percentile Scale', condition: true },
    { value: 'PercentileSubscale', label: 'Percentile Subscale', condition: true },
    { value: 'RawScale', label: 'RAW Scale', condition: true },
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

  syncFilters (callback) {
    Socket.socket().perform('report_change_filters', this, (filters) => {
      this.setFilters(filters)
      if (callback) {
        callback()
      }
    })
  },

  syncAliases (callback) {
    Socket.socket().perform('report_change_aliases', { aliases: AliasStore.getFactors() }, () => {
      if (callback) {
        callback()
      }
    })
  },

  // Sends to sever new Data Configuration
  //
  syncDataConfiguration (callback) {
    const { dataConfiguration } = DataConfigurationStore
    Socket.socket().perform('report_change_data_configuration', { dataConfiguration }, () => {
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

  getPageSizeLabel () {
    const size = PAGE_SIZES.find(
      ({ width, height }) => width === this.props.sizes.width && height === this.props.sizes.height,
    )
    return size.label
  },
})

export default Report
