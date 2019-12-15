import _ from 'lodash'
import { EventEmitter } from 'fbemitter'

const EnfOfAssessmentOptionsStore = function () {
  this.flowElement = null
}

EnfOfAssessmentOptionsStore.prototype = new EventEmitter()

_.extend(EnfOfAssessmentOptionsStore.prototype, {
  open (flowElement) {
    this.flowElement = flowElement
    this.update()
  },

  close () {
    this.flowElement = null
    this.update()
  },

  save () {
    this.close()
  },

  update () {
    this.emit('change')
  },
})

export default new EnfOfAssessmentOptionsStore()
