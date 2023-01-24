import { FieldData } from 'rc-field-form/lib/interface'
import _ from 'lodash'

export default class FieldsUtil {
  fields: FieldData[]

  constructor (fields: FieldData[]) {
    this.fields = fields
  }

  getErrorsFor (fieldName: string) {
    const field = _.find(this.fields, field => _.includes(field.name as string[], fieldName))

    return field && field.errors
  }

  haveErrorFor (fieldName: string) {
    return !_.isEmpty(this.getErrorsFor(fieldName))
  }
}
