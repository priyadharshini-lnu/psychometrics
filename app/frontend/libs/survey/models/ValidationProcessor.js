import _ from 'lodash'
import { EventEmitter } from 'fbemitter'

const ValidationProcessor = function (page) {
  this.page = page
}

ValidationProcessor.prototype = new EventEmitter()

_.extend(ValidationProcessor.prototype, {
  validate () {
    const allErrors = []
    _.each(this.page.questions, (question) => {
      const errors = question.validate()
      if (errors) {
        allErrors.push(errors)
      }
    })

    return allErrors
  },
})

export default ValidationProcessor
