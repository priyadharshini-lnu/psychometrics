import Command from 'rb/utils/Command'
import FieldsValidations from './FieldsValidations'

// TODO: move to logic
export default class FillingValidator extends Command {
  constructor (logic) {
    super()
    this.logic = logic
  }

  run () {
    let valid = true

    _.each(this.logic.conditions, (list) => {
      _.each(list.conditions, (condition) => {
        const fields = FieldsValidations[condition.conditionType]
        valid = _.every(fields, field => !!condition[field])
        return valid
      })
      return valid
    })

    return valid
  }
}
