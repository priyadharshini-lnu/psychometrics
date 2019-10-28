import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import Condition from 'models/QuestionCondition'
import AppStore from 'store/AppStore'

const CustomValidationStore = function () {
  this.question = null
}

CustomValidationStore.prototype = new EventEmitter()

_.extend(CustomValidationStore.prototype, {

  open (model, onChange) {
    this.model = model
    this.saved = this.model.validation
    if (this.model.validation.type !== 'Custom') {
      this.model.validation = { type: 'Custom', args: { conditions: [new Condition({ subject: this.model.id })] } }
    }
    AppStore.fetchQuestions()
    this.onChange = onChange
    this.update()
  },

  save () {
    this.model = null
    this.update()
    this.onChange = null
  },

  cancel () {
    this.model.validation = this.saved
    this.model.update()
    this.model = null
    this.update()
    this.onChange = null
  },

  update () {
    this.onChange && this.onChange()
    this.emit('change')
  },
})

export default new CustomValidationStore()
