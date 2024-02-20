import _ from 'lodash'
import { Schema } from '~/libs/jsonApi/schema'
import { RelationshipSchema } from './interfaces'

type Resource = {
  id: string | number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export const resourceToFormData = (resource: Resource, resourceName: string) => {
  const relationships = Schema[resourceName]?.relationships as RelationshipSchema
  if (!relationships) return resource

  return _.reduce(resource, (acc, value, name: string) => {
    const relationship = relationships[name]
    if (relationship) {
      const association = relationship.association || 'hasOne'
      name = relationship.field || (association === 'hasOne' ? `${name}Id` : `${relationship?.singularName || name}Ids`)
      value = association === 'hasOne' ? value.id : value.map(v => v.id)
    }
    acc[name] = value

    return acc
  }, {})
}

export const formDataToResource = (formData: { [key: string]: unknown }, resourceName: string) => {
  const relationships = Schema[resourceName]?.relationships as RelationshipSchema
  if (!relationships) { return formData }

  return _.reduce(relationships, (acc, relationship, relationshipName: string) => {
    const association = relationship.association || 'hasOne'
    const camelizedRelationshipName = _.camelCase(relationshipName)
    const field = relationship.field || (association === 'hasOne'
      ? `${camelizedRelationshipName}Id`
      : `${relationship?.singularName || camelizedRelationshipName}Ids`)

    if (formData[camelizedRelationshipName] === undefined && formData[field] !== undefined) {
      const val = formData[field]
      delete formData[field]

      const relType = relationship.type || (relationship.getType ? relationship.getType(formData) : null)
      if (relationship.readOnly) { return acc }

      if (Array.isArray(val)) {
        if (val.length === 0) {
          acc[camelizedRelationshipName] = []
        } else {
          acc[camelizedRelationshipName] = val.map(v => ({ type: relType, id: String(v) }))
        }
      } else if (val === null || val === undefined) {
        acc[camelizedRelationshipName] = null
      } else {
        acc[camelizedRelationshipName] = { type: relType, id: String(val) }
      }
    }

    return acc
  }, formData)
}
