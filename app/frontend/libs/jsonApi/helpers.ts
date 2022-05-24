import { Schema } from 'modules/admin/modules/client/core/schema'
import reduce from 'lodash/reduce'

type Resource = {
  id: string | number
  [key: string]: any
}

export const resourceToFormData = (resource: Resource, resourceName: string) => {
  return reduce(resource, (acc, value: any, name: string) => {
    const relationship = Schema[resourceName]?.relationships?.[name]
    if (relationship) {
      const association = relationship.association || 'hasOne'
      name = relationship.field || (association === 'hasOne' ? `${name}Id` : `${name}Ids`)
      value = association === 'hasOne' ? value.id : value.map(v => v.id)
    }
    acc[name] = value

    return acc
  }, {})
}
