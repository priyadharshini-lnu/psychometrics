import _ from 'lodash'
import ResultStore from '~/modules/reports/store/ResultStore'
import AppStore from '~/modules/reports/store/AppStore'

export default {
  getResults (filterId) {
    const assessment = this.getAssessmentByFilter(filterId)
    return ResultStore.results[assessment.id]
  },

  getDataSheet () {
    // TODO: remove datasheets relation on results
    const assessment = _.first(AppStore.assessments)
    return ResultStore.results[assessment.id].dataSheet
  },

  getAssessments () {
    return AppStore.assessments
  },

  getResultsByFilter (filterId) {
    const assessment = this.getAssessmentByFilter(filterId)
    return ResultStore.results[assessment.id].getByFilter(filterId)
  },

  getAssessmentByFilter (filterId) {
    const filter = _.find(AppStore.report.filters, { id: +filterId })
    return _.find(AppStore.assessments, { id: +filter.assessmentId })
  },
}
