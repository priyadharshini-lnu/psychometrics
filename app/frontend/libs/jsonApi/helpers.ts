import { Schema } from 'modules/admin/modules/client/core/schema'
import reduce from 'lodash/reduce'

type Resource = {
  id: string | number
  [key: string]: any
}

export const resourceToFormData = (resource: Resource, resourceName: string) => {
  const relationships = Schema[resourceName]?.relationships
  if (!relationships) return resource

  return reduce(resource, (acc, value: any, name: string) => {
    const relationship = relationships[name]
    if (relationship) {
      const association = relationship.association || 'hasOne'
      name = relationship.field || (association === 'hasOne' ? `${name}Id` : `${name}Ids`)
      value = association === 'hasOne' ? value.id : value.map(v => v.id)
    }
    acc[name] = value

    return acc
  }, {})
}

export const formDataToResource = (formData: { [key: string]: any }, resourceName: string) => {
  const relationships = Schema[resourceName]?.relationships
  if (!relationships) { return formData }

  return reduce(relationships, (acc, relationship: any, relationshipName: string) => {
    const association = relationship.association || 'hasOne'
    const field = relationship.field || (association === 'hasOne' ? `${relationshipName}Id` : `${relationshipName}Ids`)

    if (formData[relationshipName] === undefined && formData[field] !== undefined) {
      const val = formData[field]
      delete formData[field]

      const relType = relationship.type || (relationship.getType ? relationship.getType(formData) : null)
      if (relationship.readOnly) { return acc }

      if (Array.isArray(val)) {
        acc[relationshipName] = val.map(v => ({ type: relType, id: String(v) }))
      } else {
        acc[relationshipName] = { type: relType, id: String(val) }
      }
    }

    return acc
  }, formData)
}
