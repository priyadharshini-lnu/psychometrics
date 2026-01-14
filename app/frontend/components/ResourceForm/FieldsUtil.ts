import type { FormProps, GetProp } from 'antd'
import _ from 'lodash'

type FieldData = GetProp<FormProps, 'fields'>[number]

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
