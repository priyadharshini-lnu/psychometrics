import humps from 'humps'


interface Error {
  [key: string]: string[]
}

interface JsonApiStandardError {
  title: string
  detail?: string
  source: {
    pointer: string,
  }
}

export const convertJsonApiErrors  = (errors: JsonApiStandardError[], schema: any = null): Error => {
  const attributePrefix = 'data/attributes/'
  const relationshipPrefix = 'data/relationships/'

  return errors.reduce((acc, error) => {
    const pointer = error.source?.pointer
    let attribute: string

    if (pointer === undefined) {
      acc['base'] ||= []
      acc['base'] = [...acc['base'], { title: error.title, detail: error.detail }]
      return acc
    }

    if (pointer.startsWith(attributePrefix)) {
      attribute = pointer.replace(attributePrefix, '')
    } else if (pointer.startsWith(relationshipPrefix)) {
      const [relationshipName] = pointer.replace(relationshipPrefix, '').split('/')

      if (schema) {
        const association = schema?.relationships?.[relationshipName]?.['association'] || 'hasOne'
        attribute = association === 'hasOne' ? `${relationshipName}Id` : `${relationshipName}Ids`
      } else {
        attribute = relationshipName
      }
    } else {
      attribute = pointer
    }
    acc[attribute] = { title: error.title, detail: error.detail }

    return acc
  }, {})
}

export const formatErrors = (errors: JsonApiStandardError[] | undefined, schema: any) => {
  if (errors === undefined) return null

  errors = [errors].flat().map(error => {
    const pointer =  error.source?.pointer ? humps.camelize(error.source.pointer) : null
    const modifiedError = { ...error }
    if (pointer) { modifiedError.source = { pointer } }

    return modifiedError
  })
  return convertJsonApiErrors(errors, schema)
}
