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
      const modifiedPath = path.map(p => humps.camelize(p))
      _.unset(transformedData, modifiedPath)
      _.set(transformedData, [...modifiedPath.slice(0, -1), path[path.length - 1]], node.value)
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

export const convertEnumToObject = function<T extends Record<string | number, string | number>>
(enumObject:T):Record<string, Array<string | number>> {
  return Object.entries(enumObject).map(([key, value]) => ([key, value])).reduce((acc, item) => {
    if (!isNaN(Number(item[0]))) {
      return acc
    }
    acc[item[1]] = item
    return acc
  }, {})
}

export const getLabelForEnumValue = function<T extends Record<string | number, string | number>, V extends string>
(enumObject:T, value:V):string {
  return convertEnumToObject(enumObject)[value][0] as V
}
