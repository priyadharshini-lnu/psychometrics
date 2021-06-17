import { Question } from 'modules/survey/core/preview/FlowProcessor/interfaces'
import { I18n } from 'modules/survey/store/StoreWatchman'
import moment from 'moment'

class NotInFuture {
  question: Question

  constructor (
    _,
    question: Question,
  ) {
    this.question = question
  }

  validate ([{ value }]) {
    const date = moment(value)
    const now = moment()
    if (now < date) {
      return {
        type: 'NotInFuture',
        message: I18n().t('validations.not_in_future'),
      }
    }
    return null
  }
}

export default NotInFuture
