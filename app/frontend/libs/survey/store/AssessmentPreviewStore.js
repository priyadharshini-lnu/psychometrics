import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import FlowProcessor from 'models/FlowProcessor'
import Result from 'models/Preview/Result'
// import Question from 'models/Preview/Question'
import LocalStorage from 'utils/LocalStorage'
import { INIT } from 'libs/survey/core/preview/FlowProcessor/consts'
// TODO (atanych): Replace current RandOrder with new one to lookup question was answered or not.
// TODO (atanych): After it we might remove RankOrder from list below
export const NOT_ANSWERED_QUESTIONS = ['StaticContent', 'MetaInfo', 'Timing', 'RankOrder', 'PageBreak']
const AssessmentPreviewStore = function () {
  this.current = 0
  this.questions = []
  this.results = {}
  this.embeddedData = {}
  this.dbResult = {}
  this.dataSheetColumns = []
  this.dataSheet = null
  this.relationships = null
  this.ignoreValidation = false
  this.hideHiddenQuestions = true
  this.flow = false
  this.end = false
  this.dashboardUrl = '/'
  this.mediaUrl = ''
}

AssessmentPreviewStore.prototype = new EventEmitter()

_.extend(AssessmentPreviewStore.prototype, {
  init (data, type = 'preview_assessment', dbResult = {}, dashboardUrl = '/', rstore) {
    this.assessment = data
    // this.allQuestions = _(this.assessment.blocks).map(b => b.questions).flatten().map(q => new Question(q))
    // .value()
    this.dbResult = dbResult || {}
    this.dbResult.results = {
      ...(this.dbResult.results || {}),
      ...(LocalStorage.getIn(this.resultLocalStorageKey) || {}),
    }
    const byQuestionId = r => _.find(this.allQuestions, { id: r.question_id })
    const newResult = r => new Result(byQuestionId(r), r.answers, r.not_applicable)
    this.results = _(this.dbResult.results).pickBy(byQuestionId).mapValues(newResult).value()
    this.dataSheetColumns = data.data_sheet_columns || []
    this.relationships = data.relationships
    this.dataSheet = dbResult && dbResult.data_sheet
    this.relationship = dbResult && dbResult.relationship

    // can be pass_assessment, preview_block or preview_assessment
    this.readOnly = type === 'view_results'
    this.type = type
    this.dashboardUrl = dashboardUrl
    if (type === 'pass_assessment') {
      this.mediaUrl = this.isThreesixty
        ? `/campaigns/${dbResult.campaign_id}/users_results/${dbResult.id}`
        : `/assigns/${dbResult.id}`
    }

    // init data before flow initializing
    rstore.dispatch({
      type: INIT,
      data: {
        ...data, type, isThreesixty: this.isThreesixty, resultsUrl: this.resultsUrl,
      },
      result: this.dbResult,
    })
    this.rstore = rstore
    this.flow = new FlowProcessor(this)
  },

  restart () {
    this.flow.restart()
  },

  currentPage () {
    if (!this.flow) { return }
    return this.flow.currentPage()
  },

  nextPage () {
    this.flow.nextPage()
    window.scrollTo(0, 0)
  },

  prevPage () {
    this.flow.prevPage()
    window.scrollTo(0, 0)
  },

  // TODO (atanych): we should figure out why results are clean after new page
  getRealResults () {
    return this.questions.filter(q => !NOT_ANSWERED_QUESTIONS.includes(q.type)).map(q => q.result)
  },

  isFirstPage () {
    return this.flow.isFirstPage()
  },

  canBack () {
    return !this.flow.isFirstPage() && this.flow.canBack()
  },

  update () {
    this.emit('change')
  },

  countAnsweredQuestions () {
    return _.filter(this.getRealResults(), result => !result.isEmpty()).length
  },

  getAllAnsweringQuestions () {
    return this.allQuestions.filter(q => !NOT_ANSWERED_QUESTIONS.includes(q.type))
  },

  reset () {
    Object.assign(this, new AssessmentPreviewStore())
  },
})

export default new AssessmentPreviewStore()
