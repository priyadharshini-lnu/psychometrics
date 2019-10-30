import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import Result from 'rb/models/Result'
import PageList from './PageList'
import AppStore from './AppStore'
import AssessmentStore from './AssessmentStore'
import ResultStore from './ResultStore'

const PreviewStore = function () {

}

PreviewStore.prototype = new EventEmitter()

_.extend(PreviewStore.prototype, {
  init (data, results, user, campaign = null) {
    this.reset()
    AppStore.init(data)
    _.each(data.assessments, (assessment) => { ResultStore.results[assessment.id] = new Result(assessment.id) })

    if (results) {
      const assessmentIds = _.map(data.assessments, assessment => assessment.id)
      ResultStore.setResults(results, user, assessmentIds, campaign)
    } else {
      PageList.load(data.pages, data.completed_assessments)
    }
    this.assessment = data
    AssessmentStore.init(data.assessments)
    this.update()
  },

  update () {
    this.emit('change')
  },

  reset () {
    ResultStore.reset()
  },
})

export default new PreviewStore()
