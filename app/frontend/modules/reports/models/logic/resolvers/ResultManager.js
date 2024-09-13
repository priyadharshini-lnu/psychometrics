import _ from 'lodash'
import ResultStore from '~/modules/reports/store/ResultStore'
import AppStore from '~/modules/reports/store/AppStore'

export default {
  getResults (filterId) {
    const assessment = this.getAssessmentByFilter(filterId)
    return ResultStore.results[assessment.id]
  },

  getDataSheet () {
    return ResultStore.user.datasheet
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
