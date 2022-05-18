import reduce from 'lodash/reduce'
import { Resolve } from './interfaces'
import { UnionToIntersection } from 'type-fest'

export const hasMany = <N extends string>(name: N, { type }: { type: string }) => (
  (values: string[]) => {
    return {
      [name]: values.map((value) => {
        return { id: value,  type, }
      })
    } as unknown as  Record<typeof name, { id: string, type: string }[]>
  }
)

export const hasOne = <N extends string>(name: N, { type }: { type: string}) => (
  (value: string) => {
    return { [name]: { id: value,  type } } as Record<typeof name, { id: string, type: typeof type }>
  }
)

export const transformer = <
  V extends Record<string, unknown>,
  D extends Record<string, (value: string | string[]) => any> = Record<string, (value: string | string[]) => any>,
  U extends keyof V = string
>(definition: D, values: V,) => {
  return reduce(values, (acc: Record<U, unknown>, value, key) => {
    if (key in definition) {
      const hash = definition[key](value as string | string[])
      acc = { ...acc, ...hash }
    } else {
      acc[key] = value
    }
    return acc
  }, values) as Resolve<typeof values, typeof definition>
}

const schema = {
  clients: {
    type: 'clients',
    relationships: {
      account_manager: {
        type: 'users',
        association: 'hasOne'
      },
      project_manager: {
        type: 'users',
        association: 'hasMany'
      }
    }
  }
}

export const relationshipDefinition = <R>(relationships: Record<string, { type: string, association?: string, field?: string }>): R => {
  return reduce(relationships, (acc, relationship, key) => {
    const association = relationship['association'] || 'hasOne'
    const field = relationship['field'] || (association == 'hasOne' ? `${key}_id` : `${key}_ids`)

    acc[field] = hasOne(key, { type: relationship['type'] })

    return acc
  }, {}) as unknown as R
}

const def = relationshipDefinition<{}>(schema.clients?.relationships)

const values = { project_manger_id: '11', a: 10}
if (def) {
  type T = Resolve<typeof values,typeof def>
  // const t: T = { 1: 1}
  // console.log(t)
}
