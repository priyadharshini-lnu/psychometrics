import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import Report from 'rb/models/Report'
import Occupation from 'rb/models/Occupation'
import PageList from 'rb/store/PageList'
import AssessmentStore from 'rb/store/AssessmentStore'
import AliasStore from 'rb/store/modals/AliasStore'
import DataConfigurationStore from 'rb/store/modals/DataConfigurationStore'
import NotificationDispatcher from 'rb/dispatchers/NotificationDispatcher'
import PropertyPanelStore from 'rb/store/PropertyPanelStore'
import InnovationStyle from 'rb/models/InnovationStyle'

const { $ } = window
const AppStore = function () {
  this.report = new Report()
  this.loaded = false
  this.disabled = false
  this.assessment = null
  this.assessments = []
  this.occupations = {}
  this.innovationStyles = {}
  this.name = 'Report Name'
  this.sortedOccupations = {}
  this.factors = {}
  this.subfactors = {}
  this.mapFactors = {}
  this.mainFactors = {}
  this.mapSubfactorIdsByFactor = {}
}

AppStore.prototype = new EventEmitter()

_.extend(AppStore.prototype, {
  init (data) {
    if (this.loaded) { return }

    this.report = new Report(data)
    this.category = data.category
    AssessmentStore.init(data.assessments)
    _.each(data.dimension_ids, (dimensionId) => {
      this.sortedOccupations[dimensionId] = []
      this.occupations[dimensionId] = []
      this.innovationStyles[dimensionId] = []
      this.factors[dimensionId] = []
      this.subfactors[dimensionId] = []
      this.mainFactors[dimensionId] = []
      this.mapFactors[dimensionId] = {}
      this.mapSubfactorIdsByFactor[dimensionId] = {}
    })

    _.each(data.occupations, (occupations, dimensionId) => {
      this.occupations[dimensionId] = _.map(occupations, oc => new Occupation(oc))
    })

    _.each(data.innovation_styles, (innovationStyles, dimensionId) => {
      this.innovationStyles[dimensionId] = _.map(innovationStyles, oc => new InnovationStyle(oc))
    })

    this.assessments = _.map(data.assessments, assessment => ({
      id: assessment.id,
      name: assessment.name,
      category: assessment.category,
      dimensionId: assessment.dimension_id,
      factors: assessment.factors,
    }))
    _.each(data.factors, (factors, dimensionId) => {
      this.factors[dimensionId] = _.sortBy(factors, 'name')
    })

    _.each(this.factors, (factors, dimensionId) => {
      const subfactorIds = _(factors).flatMap('factors_sub_factors').map('sub_factor_id').uniq()
        .value()
      this.subfactors[dimensionId] = _.filter(factors, factor => _.includes(subfactorIds, factor.id))
    })

    _.each(this.factors, (factors, dimensionId) => {
      this.mainFactors[dimensionId] = _.reject(factors, factor => _.includes(this.subfactors[dimensionId], factor))
    })

    _.each(this.factors, (factors, dimensionId) => {
      _.each(factors, (factor) => {
        this.mapFactors[dimensionId][factor.id] = factor
        if (_.includes(this.mainFactors[dimensionId], factor)) {
          this.mapSubfactorIdsByFactor[dimensionId][factor.id] = []
        }
      })
    })

    _.each(this.factors, (factors, dimensionId) => {
      _.each(this.mainFactors[dimensionId], (factor) => {
        if (!_.isEmpty(factor.factors_sub_factors)) {
          this.mapSubfactorIdsByFactor[dimensionId][factor.id] = _.map(factor.factors_sub_factors, 'sub_factor_id')
        }
      })
    })

    this.flatFactors = _.reduce(this.factors, (result, value) => {
      result = _.concat(result, value)
      return result
    }, [])

    AliasStore.setFactors(this.flatFactors)

    // Set Data Configuration value
    //
    DataConfigurationStore.setDataConfiguration(this.report.data_configuration)

    PageList.load(data.pages, data.completed_assessments)
    this.loaded = true
    this.name = data.name
    this.disabled = false
    this.emit('change')
    PropertyPanelStore.update()
  },

  isSubfactor (factorId) {
    return !!_.find(this.subfactors, factors => _.find(factors, f => f.id === factorId))
  },

  isMainfactor (factorId) {
    return !!_.find(this.mainFactors, factors => _.find(factors, f => f.id === factorId))
  },

  getSubFactors (factorId) {
    const factor = _.find(this.flatFactors, { id: factorId })
    return _.map(factor.factors_sub_factors, f => _.find(this.flatFactors, { id: f.sub_factor_id }))
  },

  disable () {
    this.disabled = true
    this.emit('change')
  },

  enable () {
    this.disabled = false
    this.emit('change')
  },

  // Serialize Report
  // report: {
  //   - Report Attributes (name, filters)
  //   pages: [
  //     ...
  //     {
  //       - Page Attributes
  //       modules: [
  //         ...
  //         {
  //           - Module Attributes
  //         }
  //       ]
  //     }
  //   ]
  // }
  serializeReport () {
    const report = this.report.toJSON()
    report.pages = []

    // Serialize blocks and questions
    _.each(PageList.list, (pageModel) => {
      const page = pageModel.toJSON()
      page.modules = []
      _.each(pageModel.modules.list, (moduleModel) => {
        const module = moduleModel.toJSON()
        page.modules.push(module)
      })
      report.pages.push(page)
    })
    return report
  },

  save (success) {
    const builder = {
      report: this.serializeReport(),
    }

    $.ajax({
      method: 'PUT',
      url: `/administration/reports/${this.report.id}/builders`,
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify({ builder }),
      error: (jqXHR, textStatus, errorThrown) => {
        console.info(jqXHR, textStatus, errorThrown)
        NotificationDispatcher.notify({ level: 'error', message: 'Something went wrong. Contact your administrator.' })
      },
      success: (data) => {
        this.loaded = false
        this.init(data.data)
        success && success()
        NotificationDispatcher.notify({ message: 'Report successfully saved' })
      },
    })
  },

  getAssessmentById (id) {
    return this.assessments.find(assessment => assessment.id === id)
  },
})

export default new AppStore()
