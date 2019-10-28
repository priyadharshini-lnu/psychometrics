import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import Socket from 'cable'
import AppStore from './AppStore'

const MappingNormsStore = function () {
  this.show = false
}

MappingNormsStore.prototype = new EventEmitter()

_.extend(MappingNormsStore.prototype, {

  openPopup () {
    Socket.socket().perform('assessment_norms', { without_notification: true }, (data) => {
      this.norms = data
      this.show = true
      this.assessment = AppStore.assessment
      this.old = _.cloneDeep(AppStore.assessment.norm_rules)
      AppStore.fetchQuestions()
      this.update()
    })
  },

  save () {
    this.assessment.sync()
    this.show = false
    this.update()
  },

  close () {
    this.assessment.norm_rules = this.old
    this.show = false
    this.update()
  },

  addRule () {
    this.assessment.addRule({ conditions: [{ conditionType: 'Hris' }] })
    this.update()
  },

  removeRule (rule) {
    this.assessment.removeRule(rule)
    this.update()
  },

  update () {
    this.emit('change')
  },
})

export default new MappingNormsStore()
