import dayjs from '~/utils/dayjs'
import { Question } from '~/modules/survey/core/preview/FlowProcessor/interfaces'
import { I18n } from '~/modules/survey/store/StoreWatchman'

class NotInPast {
  question: Question

  constructor (
    _,
    question: Question,
  ) {
    this.question = question
  }

  validate ([{ value }]) {
    const date = dayjs(value, this.question.props.dateFormat).endOf('day')
    const now = dayjs()
    if (now > date) {
      return {
        type: 'NotInPast',
        message: I18n().t('validations.not_in_past'),
      }
    }
    return null
  }
}

export default NotInPast
