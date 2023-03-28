import humps from 'humps'
import _ from 'lodash'
import jsonpath from 'jsonpath/jsonpath.min'

interface Options {
  except?: string[]
  only?: string[]
}

export const camelizeKeys = (data: object, { except, only }: Options = {}) => {
  if (except && only) throw new Error("Both only and except options can't be used together")

  if (!except && !only) { return humps.camelizeKeys(data) }
  if (only) { return camelizeKeysOnly(data, only) }
  if (except) { return camelizeKeysExcept(data, except) }
}

const camelizeKeysExcept = (data: object, except: string[]) => {
  const transformedData = humps.camelizeKeys(data)
  except.forEach((ex) => {
    jsonpath.nodes(data, ex).forEach((node) => {
      const path = node.path.slice(1)
      _.set(transformedData, path.map(p => _.camelCase(p)), node.value)
      _.unset(transformedData, path)
    })
  })
  return transformedData
}

const camelizeKeysOnly = (data: object, only: string[]) => {
  const clonedData = _.cloneDeep(data)
  only.forEach((path) => {
    const nodes = jsonpath.nodes(clonedData, path)
    nodes.forEach((node) => {
      _.set(clonedData, node.path.slice(1), humps.camelizeKeys(node.value))
    })
  })
  return clonedData
}
