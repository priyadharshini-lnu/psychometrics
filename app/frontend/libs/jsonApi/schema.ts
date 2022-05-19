import reduce from 'lodash/reduce'
import { Resolve } from './interfaces'
import {  ConditionalPick, Merge } from 'type-fest'

// export const hasMany = <N extends string>(name: N, { type }: { type: string }) => (
//   (values: string[]) => {
//     return {
//       [name]: values.map((value) => {
//         return { id: value,  type, }
//       })
//     } as unknown as  Record<typeof name, { id: string, type: string }[]>
//   }
// )

// export const hasOne = <N extends string>(name: N, { type }: { type: string}) => (
//   (value: string) => {
//     return { [name]: { id: value,  type } } as Record<typeof name, { id: string, type: typeof type }>
//   }
// )

// export const transformer = <
//   V extends Record<string, unknown>,
//   D extends Record<string, (value: string | string[]) => any> = Record<string, (value: string | string[]) => any>,
//   U extends keyof V = string
// >(definition: D, values: V,) => {
//   return reduce(values, (acc: Record<U, unknown>, value, key) => {
//     if (key in definition) {
//       const hash = definition[key](value as string | string[])
//       acc = { ...acc, ...hash }
//     } else {
//       acc[key] = value
//     }
//     return acc
//   }, values) as Resolve<typeof values, typeof definition>
// }

// export const transformer2 = (schema, values) => {
//   return reduce(schema.relationships, (acc, relationship, key) => {
//     const association = relationship['association'] || 'hasOne'
//     const field = relationship['field'] || (association == 'hasOne' ? `${key}_id` : `${key}_ids`)
//     const relationshipName = relationship.name
//     if (values[field] === null || values[field] === undefined) { return acc }

//     if (association == 'hasOne') {
//       acc[relationshipName] = { id: values[field],  type: '' }
//     } else {
//       acc[relationshipName] = values[field].map((id) => ({ id: id,  type: '' }))
//     }

//     return acc
//   }, {} as any)
// }

type Resource = { id: string } | undefined

// const schema = {
//   clients: {
//     type: 'clients',
//     relationships: {
//       account_manager: {
//         type: 'users',
//         association: 'hasOne'
//       },
//       project_manager: {
//         type: 'users',
//         association: 'hasMany'
//       }
//     }
//   }
// }

// export const relationshipDefinition = <R>(relationships: Record<string, { type: string, association?: string, field?: string }>): R => {
//   return reduce(relationships, (acc, relationship, key) => {
//     const association = relationship['association'] || 'hasOne'
//     const field = relationship['field'] || (association == 'hasOne' ? `${key}_id` : `${key}_ids`)

//     acc[field] = hasOne(key, { type: relationship['type'] })

//     return acc
//   }, {}) as unknown as R
// }

// const def = relationshipDefinition<{}>(schema.clients?.relationships)

// const values = { project_manger_id: '11', a: 10}
// if (def) {
//   type T = Resolve<typeof values,typeof def>
//   // const t: T = { 1: 1}
//   // console.log(t)
// }

import { Client } from '../../modules/admin/modules/client/core/clients'


type HasOneAttribute<Type> = Type extends Record<string, unknown> ? {
  [Property in keyof Type as `${string & Property}Id`]: string
} : never
type HasManyAttribute<Type> = Type extends Record<string, unknown> ? {
  [Property in keyof Type as `${string & Property}Ids`]: string[]
} : never

export type ResolveHasOne<D> = HasOneAttribute<ConditionalPick<D, Resource>>
export type ResolveHasMany<D> = HasManyAttribute<ConditionalPick<D, Resource[]>>
export type ResolveRelationships<D> =Merge<ResolveHasOne<D>, ResolveHasMany<D>>
export type ResolveAttribute<D, E = ResolveRelationships<D>> = {
  [Property in Exclude<keyof D, keyof E>]: D[Property]
}
export type AdditionRelationshipAttribute<D> = Merge<D, ResolveRelationships<D>>
type AA = AdditionRelationshipAttribute<Client>
type BB= AA
